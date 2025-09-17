import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Search, X } from 'lucide-react';
import { getSuggestions, clearSuggestions } from '../store/slices/searchSlice';
import Toast from './Toast';

const SearchInput = ({ 
  placeholder = "Search threads, blogs, articles...",
  value: externalValue,
  onChange: externalOnChange,
  onSubmit: externalOnSubmit
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { suggestions, suggestionsLoading } = useSelector((state) => state.search);
  
  const [query, setQuery] = useState(externalValue || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isNavigating, setIsNavigating] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceRef = useRef(null);

  // Update internal query when external value changes
  useEffect(() => {
    if (externalValue !== undefined) {
      setQuery(externalValue);
    }
  }, [externalValue]);

  // Debounced search suggestions
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.trim().length >= 2) {
      console.log('Searching for:', query.trim());
      debounceRef.current = setTimeout(() => {
        console.log('Dispatching getSuggestions for:', query.trim());
        dispatch(getSuggestions({ prefix: query.trim(), limit: 8 }));
        setShowSuggestions(true);
      }, 300);
    } else {
      console.log('Clearing suggestions');
      dispatch(clearSuggestions());
      setShowSuggestions(false);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, dispatch]);

  // Debug suggestions state
  useEffect(() => {
    console.log('Suggestions state:', { suggestions, suggestionsLoading, showSuggestions });
  }, [suggestions, suggestionsLoading, showSuggestions]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showSuggestions) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < suggestions.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && suggestions[selectedIndex]) {
            handleSuggestionClick(suggestions[selectedIndex]);
          } else if (query.trim()) {
            handleSearch();
          }
          break;
        case 'Escape':
          setShowSuggestions(false);
          setSelectedIndex(-1);
          inputRef.current?.blur();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showSuggestions, selectedIndex, suggestions, query]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset navigating state when component unmounts or location changes
  useEffect(() => {
    const handleLocationChange = () => {
      setIsNavigating(false);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const handleSearch = () => {
    if (query.trim()) {
      if (externalOnSubmit) {
        externalOnSubmit();
      } else {
        navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      }
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  const handleSuggestionClick = async (suggestion) => {
    try {
      // Set navigating state
      setIsNavigating(true);
      
      // Validate suggestion data
      if (!validateSuggestion(suggestion)) {
        console.error('Invalid suggestion data:', suggestion);
        setToastMessage('Invalid suggestion data. Please try searching instead.');
        setToastType('error');
        setShowToast(true);
        setIsNavigating(false);
        return;
      }

      // Construct the URL based on content type
      let url;
      switch (suggestion.type) {
        case 'thread':
          url = `/threads/${suggestion.slug}`;
          break;
        case 'blog':
          url = `/blogs/${suggestion.slug}`;
          break;
        case 'article':
          url = `/articles/${suggestion.slug}`;
          break;
        default:
          console.error('Unknown content type:', suggestion.type);
          setToastMessage('Unknown content type');
          setToastType('error');
          setShowToast(true);
          setIsNavigating(false);
          return;
      }

      // Clear suggestions
      setQuery('');
      setShowSuggestions(false);
      setSelectedIndex(-1);
      dispatch(clearSuggestions());
      
      // Show loading state for at least 1 second to give user feedback
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to the content
      navigate(url);
      
      // Set a timeout to handle navigation issues (15 seconds total)
      const navigationTimeout = setTimeout(() => {
        if (isNavigating) {
          setToastMessage('Content loading is taking longer than expected. Please try again.');
          setToastType('error');
          setShowToast(true);
          setIsNavigating(false);
        }
      }, 15000); // 15 seconds total timeout
      
      // Clear timeout when component unmounts or navigation completes
      return () => clearTimeout(navigationTimeout);
      
    } catch (error) {
      console.error('Error navigating to suggestion:', error);
      setToastMessage('Error navigating to content. Redirecting to search results.');
      setToastType('error');
      setShowToast(true);
      // Fallback: navigate to search results instead
      navigate(`/search?q=${encodeURIComponent(suggestion.title || suggestion.slug)}`);
    } finally {
      setIsNavigating(false);
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setQuery(newValue);
    setSelectedIndex(-1);
    
    if (externalOnChange) {
      externalOnChange(e);
    }
  };

  const clearQuery = () => {
    setQuery('');
    setShowSuggestions(false);
    setSelectedIndex(-1);
    dispatch(clearSuggestions());
    inputRef.current?.focus();
  };

  // Validate suggestion before navigation
  const validateSuggestion = (suggestion) => {
    if (!suggestion) return false;
    
    // Check if suggestion has required fields
    if (!suggestion.type || !suggestion.slug || !suggestion.title) {
      return false;
    }
    
    // Validate content type
    const validTypes = ['thread', 'blog', 'article'];
    if (!validTypes.includes(suggestion.type)) {
      return false;
    }
    
    // Validate slug format (basic check)
    if (typeof suggestion.slug !== 'string' || suggestion.slug.trim().length === 0) {
      return false;
    }
    
    return true;
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'thread':
        return '💬';
      case 'blog':
        return '📝';
      case 'article':
        return '📄';
      default:
        return '📄';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'thread':
        return 'Thread';
      case 'blog':
        return 'Blog';
      case 'article':
        return 'Article';
      default:
        return 'Content';
    }
  };

  return (
    <div className="relative w-full" ref={suggestionsRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder={placeholder}
          className="form-input pl-12 pr-12 py-3 text-base bg-white dark:bg-navy-800 border-navy-300 dark:border-navy-600 rounded-xl focus:border-ocean-500 focus:ring-ocean-200 dark:focus:border-ocean-400 shadow-sm"
        />
        
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-navy-400 dark:text-navy-500" />
        
        {query && (
          <button
            onClick={clearQuery}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-navy-400 hover:text-navy-600 dark:text-navy-500 dark:hover:text-navy-300 transition-colors duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-navy-800 rounded-xl shadow-xl border border-navy-200 dark:border-navy-700 z-50 max-h-96 overflow-y-auto">
          {suggestionsLoading ? (
            <div className="p-6 text-center text-muted">
              <div className="loading-spinner h-5 w-5 mx-auto mb-3"></div>
              <p>Finding content...</p>
              <p className="text-sm mt-2">Please wait while we search</p>
            </div>
          ) : suggestions.length > 0 ? (
            <div className="py-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  disabled={isNavigating}
                  className={`w-full px-4 py-3 text-left hover:bg-ocean-50 dark:hover:bg-ocean-950 transition-colors duration-200 ${
                    index === selectedIndex ? 'bg-ocean-50 dark:bg-ocean-950' : ''
                  } ${isNavigating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    {isNavigating ? (
                      <div className="loading-spinner h-4 w-4"></div>
                    ) : (
                      <span className="text-lg">{getTypeIcon(suggestion.type)}</span>
                    )}
                    <div className="flex-1 min-w-0">
                      <div 
                        className="font-medium text-sm text-navy-900 dark:text-navy-100 truncate"
                        dangerouslySetInnerHTML={{ __html: suggestion.highlightedTitle || suggestion.title || 'Untitled' }}
                      />
                      <div className="text-xs text-muted">
                        {isNavigating ? 'Loading...' : getTypeLabel(suggestion.type)}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
              
              {query.trim() && (
                <div className="border-t border-navy-200 dark:border-navy-700 mt-2 pt-2">
                  <button
                    onClick={handleSearch}
                    className="w-full px-4 py-3 text-left text-ocean-600 dark:text-ocean-400 hover:bg-ocean-50 dark:hover:bg-ocean-950 font-medium transition-colors duration-200"
                  >
                    🔍 Search for "{query.trim()}"
                  </button>
                </div>
              )}
            </div>
          ) : query.trim().length >= 2 ? (
            <div className="p-6 text-center text-muted">
              <p>No suggestions found</p>
              <p className="text-sm mt-2">Try different keywords</p>
              <button
                onClick={handleSearch}
                className="btn-primary mt-3 px-4 py-2 text-sm"
              >
                Search Anyway
              </button>
            </div>
          ) : null}
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default SearchInput;
