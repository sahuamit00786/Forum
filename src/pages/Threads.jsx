import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchThreadsWithAllData, fetchThreadsPaginated, fetchThreadCategories, fetchThreadFroms } from '../store/slices/forumSlice';
import { Link } from 'react-router-dom';
import { DefaultSEO } from '../components/SEO';
import ThreadCard from '../components/ThreadCard';
import Sidebar from '../components/Layout/Sidebar';
import useSmartInfiniteScroll from '../hooks/useSmartInfiniteScroll';
import { 
  MessageSquare, 
  Plus, 
  Eye,
  Heart,
  Filter,
  Search,
  TrendingUp,
  Clock,
  Star,
  Users,
  Compass,
  Activity
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
  
  const [sortBy, setSortBy] = useState('latest');
  const [filterCategory, setFilterCategory] = useState('all');

  // Load initial data only once when component mounts
  useEffect(() => {
    if (!threadsLoaded || threads.length === 0) {
      dispatch(fetchThreadsPaginated({ page: 1, limit: 20, append: false }));
      dispatch(fetchThreadCategories());
      dispatch(fetchThreadFroms());
    }
  }, [dispatch, threadsLoaded, threads.length]);

  // Load more threads when scrolling
  const loadMore = useCallback(() => {
    if (loadingMore || loading) return;
    if (!threadsPagination.hasNext) return;
    if (threadsPagination.totalPages === 0) return;
    
    const nextPage = threadsPagination.currentPage + 1;
    dispatch(fetchThreadsPaginated({ 
      page: nextPage, 
      limit: 20, 
      append: true 
    }));
  }, [dispatch, loadingMore, loading, threadsPagination.hasNext, threadsPagination.currentPage, threadsPagination.totalPages]);

  // Smart infinite scroll hook
  const lastElementRef = useSmartInfiniteScroll(
    loadMore,
    threadsPagination.hasNext,
    loading,
    loadingMore,
    threads.length
  );

  // Filter and sort threads
  const getFilteredAndSortedThreads = () => {
    let filtered = threads;
    
    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(thread => thread.category?.slug === filterCategory);
    }
    
    // Sort threads
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'latest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'popular':
          return (b.likes || 0) + (b.views || 0) - ((a.likes || 0) + (a.views || 0));
        case 'replies':
          return (b.replies || 0) - (a.replies || 0);
        case 'views':
          return (b.views || 0) - (a.views || 0);
        default:
          return 0;
      }
    });
    
    return sorted;
  };

  const filteredThreads = getFilteredAndSortedThreads();

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
        title="Forum Discussions"
        description="Join engaging discussions with fellow boating enthusiasts. Share experiences, ask questions, and connect with the marine community."
        canonicalUrl="/threads"
        keywords={['forum discussions', 'boating discussions', 'marine community', 'boating forum', 'fishing discussions']}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto flex gap-8">
          {/* Sidebar */}
          <Sidebar />
          
          {/* Main Content */}
          <main className="flex-1 min-w-0 py-8 px-4 lg:px-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                    <MessageSquare className="h-5 w-5 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    Forum Discussions
                  </h1>
                </div>
                <p className="text-lg text-slate-600 dark:text-slate-400">
                  Join conversations with fellow marine enthusiasts
                </p>
              </div>
              
              {isAuthenticated && (
                <Link
                  to="/threads/create"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  <Plus className="h-5 w-5" />
                  Start Discussion
                </Link>
              )}
            </div>

            {/* Filters and Sort */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-8 shadow-sm">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Category Filter */}
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Category
                  </label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.categoryId} value={category.slug}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort Options */}
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="latest">Latest Posts</option>
                    <option value="popular">Most Popular</option>
                    <option value="replies">Most Replies</option>
                    <option value="views">Most Viewed</option>
                  </select>
                </div>

                {/* Stats */}
                <div className="flex items-end">
                  <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl px-4 py-3 border border-blue-200 dark:border-blue-700/50">
                    <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                      {filteredThreads.length} discussions
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      {threadsPagination.total} total
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Threads List */}
            <div className="space-y-6">
              {loading && !threadsLoaded ? (
                <div className="text-center py-16">
                  <div className="inline-flex items-center gap-3 text-slate-600 dark:text-slate-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-blue-600"></div>
                    <span className="text-lg font-medium">Loading discussions...</span>
                  </div>
                </div>
              ) : filteredThreads.length > 0 ? (
                <>
                  {filteredThreads.map((thread, index) => {
                    const isLastElement = index === filteredThreads.length - 1;
                    const shouldAttachRef = isLastElement && threadsPagination.hasNext && !loading && !loadingMore;
                    
                    return (
                      <ThreadCard 
                        key={thread.threadId}
                        thread={thread}
                        isLiked={userLikes.includes?.(thread.threadId)}
                        ref={shouldAttachRef ? lastElementRef : null}
                      />
                    );
                  })}

                  {loadingMore && (
                    <div className="text-center py-8">
                      <div className="inline-flex items-center gap-3 text-slate-600 dark:text-slate-400">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-slate-300 border-t-blue-600"></div>
                        <span className="font-medium">Loading more discussions...</span>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
                        Page {threadsPagination.currentPage + 1} of {threadsPagination.totalPages}
                      </p>
                    </div>
                  )}
                  
                  {/* End of results indicator */}
                  {!threadsPagination.hasNext && threads.length > 0 && (
                    <div className="text-center py-8">
                      <div className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <Star className="h-5 w-5" />
                        <span className="font-medium">You've reached the end!</span>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                        Showing {threads.length} of {threadsPagination.total} discussions
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <MessageSquare className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">No discussions found</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    {filterCategory !== 'all' ? 'No discussions in this category yet.' : 'Be the first to start a discussion!'}
                  </p>
                  {isAuthenticated && (
                    <Link
                      to="/threads/create"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    >
                      <Plus className="h-5 w-5" />
                      Start Discussion
                    </Link>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default Threads;