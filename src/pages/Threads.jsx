import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchThreadsWithAllData, fetchThreadsPaginated, fetchThreadCategories, fetchThreadFroms } from '../store/slices/forumSlice';
import { Link } from 'react-router-dom';
import { DefaultSEO } from '../components/SEO';

import useSmartInfiniteScroll from '../hooks/useSmartInfiniteScroll';
import { 
  MessageSquare, 
  Plus, 
  Eye,
  Heart
} from 'lucide-react';

const Threads = () => {
  const dispatch = useDispatch();
  const { 
    threads, 
    categories, 
    threadFroms,
    loading, 
    loadingMore,
    threadsPagination,
    threadsLoaded,
    userLikes
  } = useSelector((state) => state.forum);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  


  // Helpers to render short, professional excerpts from thread content
  const getPlainText = (value) => {
    if (!value) return '';
    return String(value)
      .replace(/<[^>]+>/g, ' ')
      .replace(/[#$*_`>\-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const getExcerpt = (value, limit = 140) => {
    const text = getPlainText(value);
    if (text.length <= limit) return text;
    return `${text.slice(0, limit)}…`;
  };

  // Load initial data only once when component mounts
  useEffect(() => {
    if (!threadsLoaded || threads.length === 0) {
      console.log('Threads: Loading initial data...', {
        threadsLoaded,
        threadsLength: threads.length
      });
      dispatch(fetchThreadsPaginated({ page: 1, limit: 20, append: false }));
      dispatch(fetchThreadCategories());
      dispatch(fetchThreadFroms());
    }
  }, [dispatch, threadsLoaded, threads.length]);

  // Force refresh pagination when component becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && threads.length > 0 && threadsPagination.hasNext) {
        console.log('Threads: Page became visible, ensuring pagination is ready');
        // Force a small delay to ensure DOM is ready
        setTimeout(() => {
          console.log('Threads: Pagination should be ready now');
        }, 100);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [threads.length, threadsPagination.hasNext]);

  // Debug logging
  useEffect(() => {
    console.log('🔍 Threads state:', {
      threads: threads.length,
      categories: categories.length,
      loading,
      threadsLoaded,
      userLikes: userLikes.length,
      threadsPagination,
      threadsData: threads.slice(0, 3).map(t => ({ id: t.threadId, title: t.title }))
    });
  }, [threads, categories, loading, threadsLoaded, userLikes, threadsPagination]);

  // Load more threads when scrolling - always works regardless of navigation
  const loadMore = useCallback(() => {
    console.log('Threads loadMore called:', {
      loadingMore,
      loading,
      hasNext: threadsPagination.hasNext,
      currentPage: threadsPagination.currentPage,
      threadsLength: threads.length,
      totalPages: threadsPagination.totalPages,
      threadsLoaded
    });
    
    // Prevent multiple simultaneous calls
    if (loadingMore || loading) {
      console.log('Threads: Already loading, skipping call');
      return;
    }
    
    if (!threadsPagination.hasNext) {
      console.log('Threads: No more pages available');
      return;
    }
    
    // Always allow loading more if we have pagination info, even if threads array is empty
    if (threadsPagination.totalPages === 0) {
      console.log('Threads: No pagination info available yet');
      return;
    }
    
    const nextPage = threadsPagination.currentPage + 1;
    console.log('Threads: Loading page', nextPage, 'of', threadsPagination.totalPages);
    
    dispatch(fetchThreadsPaginated({ 
      page: nextPage, 
      limit: 20, 
      append: true 
    }));
  }, [dispatch, loadingMore, loading, threadsPagination.hasNext, threadsPagination.currentPage, threadsPagination.totalPages, threadsLoaded]);

  // Smart infinite scroll hook - only triggers when user scrolls to bottom and data is ready
  const lastElementRef = useSmartInfiniteScroll(
    loadMore,
    threadsPagination.hasNext,
    loading,
    loadingMore,
    threads.length
  );

  // Debug ref attachment
  useEffect(() => {
    console.log('🔍 Threads ref attachment check:', {
      threadsLength: threads.length,
      hasNext: threadsPagination.hasNext,
      loading,
      loadingMore,
      shouldAttachRef: threads.length > 0 && threadsPagination.hasNext,
      currentPage: threadsPagination.currentPage,
      totalPages: threadsPagination.totalPages
    });
  }, [threads.length, threadsPagination.hasNext, loading, loadingMore, threadsPagination.currentPage, threadsPagination.totalPages]);

  // Show all threads since we removed search/filter functionality
  const filteredThreads = threads;
  
  // Compute sections for layout
  const sortedLatest = [...filteredThreads].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  const mainList = sortedLatest; // Show all accumulated threads
  const popularThreads = [...filteredThreads]
    .sort(
      (a, b) => (b.likes || 0) + (b.views || 0) + (b.replies || 0) - ((a.likes || 0) + (a.views || 0) + (a.replies || 0))
    )
    .slice(0, 7);

  // Debug mainList calculation
  console.log('🔍 Threads Layout Calculation:', {
    filteredThreads: filteredThreads.length,
    sortedLatest: sortedLatest.length,
    mainList: mainList.length,
    popularThreads: popularThreads.length,
    mainListTitles: mainList.map(t => t.title).slice(0, 3)
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <DefaultSEO
        title="Forum Threads"
        description="Join the conversation with fellow boating enthusiasts. Discuss marine topics, share experiences, and connect with the boating community."
        canonicalUrl="/threads"
        keywords={['forum threads', 'boating discussions', 'marine community', 'boating forum', 'fishing discussions']}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Forum Threads</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Join the conversation with fellow boating enthusiasts</p>
        </div>
        {isAuthenticated && (
          <Link
              to="/threads/create"
              className="inline-flex items-center gap-2 bg-[#f97315] hover:bg-[#ea580c] text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium transition-colors text-sm sm:text-base"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Post Your Query (thread)</span>
              <span className="sm:hidden">Create</span>
            </Link>
        )}
      </div>



      {/* Threads - Latest + Popular layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {loading && !threadsLoaded ? (
          <div className="col-span-full text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading threads...</p>
          </div>
        ) : (
          <>
            {/* Left/Main column - Latest */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {mainList.map((t, index) => {
                    const isLastElement = index === mainList.length - 1;
                    const shouldAttachRef = isLastElement && threadsPagination.hasNext && !loading && !loadingMore;
                    console.log('🔍 Thread rendering:', {
                      index,
                      totalLength: mainList.length,
                      isLastElement,
                      shouldAttachRef,
                      hasNext: threadsPagination.hasNext,
                      loading,
                      loadingMore,
                      threadId: t.threadId,
                      title: t.title
                    });
                    return (
                      <li key={t.threadId} ref={shouldAttachRef ? lastElementRef : null} className="p-3 sm:p-4">
                      <Link to={`/threads/${encodeURIComponent(t.slug)}`} className="flex items-start gap-3 group">
                        <div className="w-8 h-8 rounded-full bg-lime-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">{t.author?.userName?.[0]?.toUpperCase() || 'U'}</span>
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm sm:text-base font-medium text-blue-700 dark:text-blue-300 group-hover:underline line-clamp-2">{t.title}</h3>
                          {(t.description || t.content) && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">{getExcerpt(t.description || t.content, 100)}</p>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Latest: {t.author?.userName || 'Anonymous'} · {formatDate(t.createdAt)}</p>
                          {t.category?.name && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{t.category.name}</p>
                          )}
                        </div>
                      </Link>
                    </li>
                    );
                  })}
                </ul>
              </div>

              {loadingMore && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading more threads...</p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                    Page {threadsPagination.currentPage + 1} of {threadsPagination.totalPages}
                  </p>
                </div>
              )}
              
              {/* End of results indicator */}
              {!threadsPagination.hasNext && threads.length > 0 && (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">You've reached the end!</p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                    Showing {threads.length} of {threadsPagination.total} threads
                  </p>
                </div>
              )}
              
              {/* Debug info */}
              {process.env.NODE_ENV === 'development' && (
                <div className="text-center py-2 text-xs text-gray-400 border-t border-gray-200 dark:border-gray-700">
                  <p>Debug: Page {threadsPagination.currentPage}/{threadsPagination.totalPages} | 
                     Has Next: {threadsPagination.hasNext ? 'Yes' : 'No'} | 
                     Threads: {threads.length} | 
                     Loading: {loading ? 'Yes' : 'No'} | 
                     Loading More: {loadingMore ? 'Yes' : 'No'} |
                     ThreadsLoaded: {threadsLoaded ? 'Yes' : 'No'}
                  </p>
                  <p>First 3 Threads: {threads.slice(0, 3).map(t => t.title).join(', ')}</p>
                </div>
              )}
            </div>

            {/* Popular sidebar */}
            <aside className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wide">Most popular</h2>
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {popularThreads.map((t) => (
                    <li key={t.threadId} className="p-3">
                      <Link to={`/threads/${encodeURIComponent(t.slug)}`} className="flex items-start gap-3 group">
                        <div className="w-7 h-7 rounded-full bg-lime-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">{t.author?.userName?.[0]?.toUpperCase() || 'U'}</span>
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300 group-hover:underline line-clamp-2">{t.title}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Latest: {t.author?.userName || 'Anonymous'} · {formatDate(t.createdAt)}
                          </p>
                          {t.category?.name && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{t.category.name}</p>
                          )}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </>
        )}
      </div>

      {/* Empty State */}
      {!loading && filteredThreads.length === 0 && (
        <div className="text-center py-8 sm:py-12">
          <MessageSquare className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">No threads found</h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
            Be the first to start a discussion!
          </p>
          {isAuthenticated && (
            <Link
              to="/threads/create"
              className="inline-flex items-center gap-2 bg-[#f97315] hover:bg-[#ea580c] text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium transition-colors text-sm sm:text-base"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Create Thread</span>
              <span className="sm:hidden">Create</span>
            </Link>
          )}
        </div>
      )}
    </div>
    </>
  );
};

export default Threads;