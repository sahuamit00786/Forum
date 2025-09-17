import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCategoryData, clearCategoryData } from '../store/slices/categorySlice';
import { categoriesAPI } from '../utils/api';
import { 
  MessageSquare, 
  ArrowLeft,
  Eye,
  Heart,
  MessageCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const CategoryView = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { categorySlug } = useParams();
  
  const { 
    category, 
    threads, 
    blogs, 
    articles, 
    counts, 
    userLikes,
    pagination,
    loading, 
    error 
  } = useSelector((state) => state.category);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  
  // Quick category loading state
  const [quickCategory, setQuickCategory] = useState(null);
  const [categoryInfoLoaded, setCategoryInfoLoaded] = useState(false);

  // Quick category info loading (for fast heading display)
  useEffect(() => {
    if (categorySlug && !categoryInfoLoaded) {
      console.log('CategoryView: Loading quick category info for:', categorySlug);
      categoriesAPI.getCategoryInfo(categorySlug)
        .then(response => {
          setQuickCategory(response.category);
          setCategoryInfoLoaded(true);
        })
        .catch(error => {
          console.error('Error loading category info:', error);
        });
    }
  }, [categorySlug, categoryInfoLoaded]);

  // Fetch category data on component mount and when categorySlug changes
  useEffect(() => {
    if (categorySlug && !dataLoaded) {
      console.log('CategoryView: Loading initial data for category:', categorySlug);
      dispatch(fetchCategoryData({ categorySlug, page: 1, limit: itemsPerPage }));
      setDataLoaded(true);
    }
    
    // Cleanup when component unmounts
    return () => {
      dispatch(clearCategoryData());
    };
  }, [dispatch, categorySlug, dataLoaded, itemsPerPage]);

  // Load data for specific page
  const loadPage = useCallback((page) => {
    if (categorySlug && page !== currentPage && !pageLoading) {
      console.log('CategoryView: Loading page:', page);
      setPageLoading(true);
      setCurrentPage(page);
      dispatch(fetchCategoryData({ categorySlug, page, limit: itemsPerPage }))
        .finally(() => {
          setPageLoading(false);
        });
    }
  }, [dispatch, categorySlug, currentPage, itemsPerPage, pageLoading]);

  // Helper function to remove HTML tags
  const stripHtmlTags = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  };

  // Simplified - only get threads content
  const getFilteredContent = () => {
    return threads.map(thread => ({
      id: thread.threadId,
      type: 'thread',
      title: stripHtmlTags(thread.title),
      excerpt: stripHtmlTags(thread.description) || stripHtmlTags(thread.title),
      author: thread.author?.userName || 'Unknown',
      views: thread.views || 0,
      replies: thread.replies || 0,
      likes: thread.likes || 0,
      createdAt: thread.createdAt,
      slug: thread.slug,
      isLiked: userLikes.threads.includes(thread.threadId)
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Simplified - no need for content icon function

  const getContentLink = (item) => {
    return `/threads/${encodeURIComponent(item.slug)}`;
  };

  // Handle thread row click
  const handleThreadClick = (thread) => {
    navigate(`/threads/${encodeURIComponent(thread.slug)}`);
  };

  // Simplified - no tabs needed

  const filteredContent = getFilteredContent();

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-1 sm:px-4 space-y-4 sm:space-y-6">
        <div className="mb-4 sm:mb-6">
          <Link to="/">
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white" />
          </Link>
        </div>
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error Loading Category</h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto  px-0 py-0 md:px-4 md:py-6">
        {/* Back Button */}
        <div className='  flex flex-col md:flex-row md:justify-between md:items-center sm:mt-2 md:mt-0'> 
        <div className="mb-2 md:mb-0">
          <Link to="/" className="inline-flex items-center  dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-green-500">
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span>Back to Home</span>
          </Link>
        </div>
        {(quickCategory || category) && (
          <div className="mb-2">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {(quickCategory || category)?.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {(quickCategory || category)?.description || 'Category description'}
            </p>
          </div>
        )} </div>
       

        {/* Category Header - Show quick category first, then full category */}
        

        {/* Threads Container - Responsive Design */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          {loading || pageLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                {pageLoading ? 'Loading page...' : 'Loading threads...'}
              </p>
            </div>
          ) : filteredContent.length > 0 ? (
            <>
              {/* Desktop Table Header - Hidden on Mobile */}
              <div className="hidden md:block bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-800 dark:text-gray-200">
                  <div className="col-span-6">Thread</div>
                  <div className="col-span-2">Author</div>
                  <div className="col-span-2">Date</div>
                  <div className="col-span-1 text-center">Views</div>
                  <div className="col-span-1 text-center">Replies</div>
                </div>
              </div>

              {/* Desktop Table Body - Hidden on Mobile */}
              <div className="hidden md:block divide-y divide-gray-100 dark:divide-gray-700">
                {filteredContent.map((item, index) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    onClick={() => handleThreadClick(item)}
                    className={`px-6 py-4 cursor-pointer transition-all duration-200 ${
                      index % 2 === 0 
                        ? 'bg-white dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-gray-700' 
                        : 'bg-gray-50 dark:bg-gray-750 hover:bg-green-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Thread Title & Excerpt */}
                      <div className="col-span-6">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 rounded-lg flex items-center justify-center">
                              <MessageSquare className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white hover:text-green-600 dark:hover:text-green-400 transition-colors line-clamp-1">
                              {item.title}
                            </h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
                              {item.excerpt}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Author */}
                      <div className="col-span-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {item.author}
                        </span>
                      </div>

                      {/* Date */}
                      <div className="col-span-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(item.createdAt)}
                        </span>
                      </div>

                      {/* Views */}
                      <div className="col-span-1 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <Eye className="h-3 w-3 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {item.views}
                          </span>
                        </div>
                      </div>

                      {/* Replies */}
                      <div className="col-span-1 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <MessageCircle className="h-3 w-3 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {item.replies || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile Cards - Hidden on Desktop */}
              <div className="md:hidden space-y-3 p-4">
                {filteredContent.map((item, index) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    onClick={() => handleThreadClick(item)}
                    className="bg-gray-500 dark:bg-gray-700 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:bg-green-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600"
                  >
                    {/* Thread Header */}
                    <div className="flex items-start space-x-3 mb-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 rounded-lg flex items-center justify-center">
                          <MessageSquare className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-semibold text-blue-700 dark:text-blue-300 transition-colors line-clamp-2 mb-1">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {item.excerpt}
                        </p>
                      </div>
                    </div>

                    {/* Thread Meta */}
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-4">
                        <span>By {item.author}</span>
                        <span>•</span>
                        <span>{formatDate(item.createdAt)}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>{item.views}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="h-4 w-4" />
                          <span>{item.replies || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>


              {/* Pagination - Responsive */}
              {pagination && pagination.totalPages > 1 && (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 px-0 md:px-6 md:py-4 border-t border-gray-200 dark:border-gray-600">
                  {/* Desktop Pagination */}
                  <div className="hidden md:flex items-center justify-between">
                    <div className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, pagination.total)} of {pagination.total} threads in {(quickCategory || category)?.name}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => loadPage(currentPage - 1)}
                        disabled={currentPage === 1 || loading || pageLoading}
                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-green-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </button>
                      
                      <div className="flex items-center space-x-1">
                        {(() => {
                          const totalPages = pagination.totalPages;
                          const current = currentPage;
                          const pages = [];
                          
                          // Show up to 5 pages, centered around current page
                          let startPage = Math.max(1, current - 2);
                          let endPage = Math.min(totalPages, startPage + 4);
                          
                          // Adjust start if we're near the end
                          if (endPage - startPage < 4) {
                            startPage = Math.max(1, endPage - 4);
                          }
                          
                          for (let i = startPage; i <= endPage; i++) {
                            pages.push(
                              <button
                                key={i}
                                onClick={() => loadPage(i)}
                                disabled={loading || pageLoading}
                                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                  currentPage === i
                                    ? 'bg-green-600 text-white shadow-md'
                                    : 'text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-green-50 dark:hover:bg-gray-700'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                              >
                                {i}
                              </button>
                            );
                          }
                          
                          return pages;
                        })()}
                      </div>
                      
                      <button
                        onClick={() => loadPage(currentPage + 1)}
                        disabled={currentPage === pagination.totalPages || loading || pageLoading}
                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-green-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </button>
                    </div>
                  </div>

                  {/* Mobile Pagination */}
                  <div className="md:hidden space-y-3">
                    <div className="text-center text-sm text-gray-700 dark:text-gray-300 font-medium">
                      Page {currentPage} of {pagination.totalPages}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => loadPage(currentPage - 1)}
                        disabled={currentPage === 1 || loading || pageLoading}
                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-green-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </button>
                      
                      <div className="flex items-center space-x-1">
                        {(() => {
                          const totalPages = pagination.totalPages;
                          const current = currentPage;
                          const pages = [];
                          
                          // Show fewer pages on mobile (max 3)
                          let startPage = Math.max(1, current - 1);
                          let endPage = Math.min(totalPages, startPage + 2);
                          
                          // Adjust start if we're near the end
                          if (endPage - startPage < 2) {
                            startPage = Math.max(1, endPage - 2);
                          }
                          
                          for (let i = startPage; i <= endPage; i++) {
                            pages.push(
                              <button
                                key={i}
                                onClick={() => loadPage(i)}
                                disabled={loading || pageLoading}
                                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                  currentPage === i
                                    ? 'bg-green-600 text-white shadow-md'
                                    : 'text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-green-50 dark:hover:bg-gray-700'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                              >
                                {i}
                              </button>
                            );
                          }
                          
                          return pages;
                        })()}
                      </div>
                      
                      <button
                        onClick={() => loadPage(currentPage + 1)}
                        disabled={currentPage === pagination.totalPages || loading || pageLoading}
                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-green-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No threads found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                No threads available in this category yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryView;