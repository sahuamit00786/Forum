import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Search, X, Loader2 } from 'lucide-react';
import { getSuggestions, clearSuggestions } from '../store/slices/searchSlice';

const SearchInput = ({ 
  placeholder = "Search discussions, articles...",
  value: externalValue,
  onChange: externalOnChange,
  onSubmit: externalOnSubmit,
  className = ""
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { suggestions, suggestionsLoading } = useSelector((state) => state.search);
  
  const [query, setQuery] = useState(externalValue || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  
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
      debounceRef.current = setTimeout(() => {
        dispatch(getSuggestions({ prefix: query.trim(), limit: 8 }));
        setShowSuggestions(true);
      }, 300);
    } else {
      dispatch(clearSuggestions());
      setShowSuggestions(false);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, dispatch]);

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

  const handleSearch = () => {
    if (query.trim()) {
      if (externalOnSubmit) {
        externalOnSubmit();
      } else {
        navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      }
      setShowSuggestions(false);
      setSelectedIndex(-1);
      inputRef.current?.blur();
    }
  };

  const handleSuggestionClick = (suggestion) => {
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
        return;
    }

    setQuery('');
    setShowSuggestions(false);
    setSelectedIndex(-1);
    dispatch(clearSuggestions());
    navigate(url);
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
        return 'Discussion';
      case 'blog':
        return 'Blog';
      case 'article':
        return 'Article';
      default:
        return 'Content';
    }
  };

  return (
    <div className={`relative w-full ${className}`} ref={suggestionsRef}>
      <div className="relative">
        <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-all duration-200 ${
          isFocused ? 'text-blue-500' : 'text-slate-400'
        }`}>
          <Search className="h-5 w-5" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          onFocus={() => {
            setIsFocused(true);
            if (query.trim().length >= 2) {
              setShowSuggestions(true);
            }
          }}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={`w-full pl-12 pr-12 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 font-medium transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-700 shadow-sm focus:shadow-lg ${
            isFocused ? 'shadow-lg shadow-blue-500/10' : ''
          }`}
        />
        
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          {suggestionsLoading && (
            <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
          )}
          {query && (
            <button
              onClick={clearQuery}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 max-h-96 overflow-hidden">
          {suggestions.length > 0 ? (
            <div className="py-2">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Suggestions
                </p>
              </div>
              
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`w-full px-4 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200 ${
                    index === selectedIndex ? 'bg-blue-50 dark:bg-blue-900/30 border-r-2 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-lg">{getTypeIcon(suggestion.type)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div 
                        className="font-semibold text-slate-900 dark:text-slate-100 truncate text-sm mb-1"
                        dangerouslySetInnerHTML={{ __html: suggestion.highlightedTitle || suggestion.title || 'Untitled' }}
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-lg">
                          {getTypeLabel(suggestion.type)}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {suggestion.authorName}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
              
              {query.trim() && (
                <div className="border-t border-slate-100 dark:border-slate-700 mt-2 pt-2">
                  <button
                    onClick={handleSearch}
                    className="w-full px-4 py-4 text-left text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 font-semibold transition-all duration-200 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                      <Search className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span>Search for "{query.trim()}"</span>
                  </button>
                </div>
              )}
            </div>
          ) : query.trim().length >= 2 ? (
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Search className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-slate-600 dark:text-slate-400 font-medium mb-2">No suggestions found</p>
              <p className="text-sm text-slate-500 dark:text-slate-500 mb-4">Try different keywords</p>
              <button
                onClick={handleSearch}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold text-sm transition-colors"
              >
                Search Anyway
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchInput;