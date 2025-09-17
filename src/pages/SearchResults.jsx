import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  searchContent, 
  searchGrouped, 
  setQuery, 
  setFilters, 
  setSortBy, 
  setCurrentPage,
  clearSearchResults 
} from '../store/slices/searchSlice';
import BackButton from '../components/BackButton';
import { 
  Search, 
  Filter, 
  SortAsc, 
  Eye, 
  MessageCircle, 
  ThumbsUp,
  Calendar,
  User,
  Tag
} from 'lucide-react';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  
  const { 
    results, 
    groupedResults, 
    loading, 
    error, 
    query,
    filters,
    sortBy,
    currentPage
  } = useSelector((state) => state.search);
  
  const [activeTab, setActiveTab] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const searchQuery = searchParams.get('q') || '';



  useEffect(() => {
    if (searchQuery) {
      dispatch(setQuery(searchQuery));
      
      if (activeTab === 'all') {
        dispatch(searchContent({ 
          query: searchQuery,
          options: {
            page: currentPage,
            limit: 20,
            sortBy,
            filters
          }
        }));
      } else {
        dispatch(searchGrouped({ 
          query: searchQuery,
          options: {
            page: currentPage,
            limit: 20,
            sortBy,
            filters
          }
        }));
      }
    }
  }, [searchQuery, activeTab, currentPage, sortBy, filters, dispatch]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    dispatch(setCurrentPage(1));
  };

  const handleSortChange = (newSortBy) => {
    dispatch(setSortBy(newSortBy));
    dispatch(setCurrentPage(1));
  };

  const handleFilterChange = (newFilters) => {
    dispatch(setFilters(newFilters));
    dispatch(setCurrentPage(1));
  };

  const handlePageChange = (page) => {
    dispatch(setCurrentPage(page));
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

  const getTypeUrl = (type, slug) => {
    switch (type) {
      case 'thread':
        return `/threads/${slug}`;
      case 'blog':
        return `/blogs/${slug}`;
      case 'article':
        return `/articles/${slug}`;
      default:
        return '/';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderResultCard = (result) => (
    <Link 
      key={result.id} 
      to={getTypeUrl(result.type, result.slug)}
      className="block bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700 hover:shadow-md transition-shadow"
    >
      <div className="p-3 sm:p-6">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="flex-shrink-0">
            <span className="text-lg sm:text-2xl">{getTypeIcon(result.type)}</span>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs sm:text-sm text-primary-600 dark:text-primary-400 font-medium">
                {getTypeLabel(result.type)}
              </span>
              {result.categoryName && (
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  in {result.categoryName}
                </span>
              )}
            </div>
            
            <h3 
              className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2"
              dangerouslySetInnerHTML={{ __html: result._formatted?.title || result.title }}
            />
            
            <p 
              className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-3"
              dangerouslySetInnerHTML={{ __html: result._formatted?.content || result._formatted?.description || result.excerpt }}
            />
            
            <div className="grid grid-cols-2 sm:flex sm:items-center sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="truncate">{result.authorName}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>{formatDate(result.createdAt)}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>{result.views || 0}</span>
              </div>
              
              {result.type === 'thread' && (
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>{result.comments || 0}</span>
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <ThumbsUp className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>{result.likes || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );

  const renderResults = () => {
    if (activeTab === 'all') {
      return results.hits?.map(renderResultCard) || [];
    } else {
      const tabResults = groupedResults[activeTab] || [];
      return tabResults.map(renderResultCard);
    }
  };

  const getTotalResults = () => {
    if (activeTab === 'all') {
      return results.totalHits || 0;
    } else {
      return groupedResults[activeTab]?.length || 0;
    }
  };

  const getTotalPages = () => {
    if (activeTab === 'all') {
      return results.totalPages || 0;
    } else {
      return Math.ceil((groupedResults[activeTab]?.length || 0) / 20);
    }
  };

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-1 sm:px-4 py-4 sm:py-8">
        <BackButton />
        <div className="text-center py-8 sm:py-12">
          <div className="text-red-500 text-4xl sm:text-6xl mb-3 sm:mb-4">⚠️</div>
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            Search Error
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
            {error}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm sm:text-base"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-1 sm:px-4 py-4 sm:py-8">
      <BackButton />
      
      {/* Header */}
      <div className="mb-4 sm:mb-8">
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <Search className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600" />
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            Search Results
          </h1>
        </div>
        
        {searchQuery && (
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Showing results for "<span className="font-medium">{searchQuery}</span>"
            {!loading && (
              <span className="ml-2">
                ({getTotalResults()} results in {results.processingTimeMs || 0}ms)
              </span>
            )}
          </p>
        )}
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
          >
            <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Filters</span>
            <span className="sm:hidden">Filter</span>
          </button>
          
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-2 sm:px-3 py-2 text-xs sm:text-sm bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg border-0 focus:ring-2 focus:ring-primary-500"
          >
            <option value="relevance">Relevance</option>
            <option value="createdAt:desc">Latest</option>
            <option value="createdAt:asc">Oldest</option>
            <option value="views:desc">Most Viewed</option>
            <option value="likes:desc">Most Liked</option>
          </select>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700 p-3 sm:p-4 mb-4 sm:mb-6">
          <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white mb-2 sm:mb-3">Filters</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Content Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange({ type: e.target.value })}
                className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg border-0"
              >
                <option value="all">All Types</option>
                <option value="thread">Threads</option>
                <option value="blog">Blogs</option>
                <option value="article">Articles</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date From
              </label>
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => handleFilterChange({ dateFrom: e.target.value })}
                className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg border-0"
              />
            </div>
            
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date To
              </label>
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => handleFilterChange({ dateTo: e.target.value })}
                className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg border-0"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-dark-700 mb-4 sm:mb-6 overflow-x-auto">
        <button
          onClick={() => handleTabChange('all')}
          className={`px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'all'
              ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          All ({getTotalResults()})
        </button>
        <button
          onClick={() => handleTabChange('threads')}
          className={`px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'threads'
              ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Threads ({groupedResults.threads?.length || 0})
        </button>
        <button
          onClick={() => handleTabChange('blogs')}
          className={`px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'blogs'
              ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Blogs ({groupedResults.blogs?.length || 0})
        </button>
        <button
          onClick={() => handleTabChange('articles')}
          className={`px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'articles'
              ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Articles ({groupedResults.articles?.length || 0})
        </button>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-8 sm:py-12">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-primary-600 mx-auto mb-3 sm:mb-4"></div>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Searching...</p>
        </div>
      ) : getTotalResults() > 0 ? (
        <div className="space-y-3 sm:space-y-6">
          {renderResults()}
          
          {/* Pagination */}
          {getTotalPages() > 1 && (
            <div className="flex justify-center mt-6 sm:mt-8">
              <div className="flex items-center gap-1 sm:gap-2">
                {Array.from({ length: getTotalPages() }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                      currentPage === page
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : searchQuery ? (
        <div className="text-center py-8 sm:py-12">
          <div className="text-gray-400 text-4xl sm:text-6xl mb-3 sm:mb-4">🔍</div>
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            No results found
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
            Try adjusting your search terms or filters
          </p>
        </div>
      ) : (
        <div className="text-center py-8 sm:py-12">
          <div className="text-gray-400 text-4xl sm:text-6xl mb-3 sm:mb-4">🔍</div>
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            Enter a search query
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Use the search bar above to find content
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchResults;