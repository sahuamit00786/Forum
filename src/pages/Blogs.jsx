import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchBlogsWithAllData, fetchBlogsPaginated, fetchBlogCategories } from '../store/slices/blogSlice';
import { Link } from 'react-router-dom';
import { DefaultSEO } from '../components/SEO';
import { useLikeReply } from '../hooks/useLikeReply';

import useSmartInfiniteScroll from '../hooks/useSmartInfiniteScroll';
import { 
  FileText, 
  Eye,
  Heart,
  MessageCircle
} from 'lucide-react';

const Blogs = () => {
  const dispatch = useDispatch();
  const { 
    blogs, 
    categories,
    loading, 
    loadingMore,
    blogsPagination,
    blogsLoaded,
    userLikes
  } = useSelector((state) => state.blog);
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  
  // Helpers to create professional, short excerpts
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
    if (!blogsLoaded || blogs.length === 0) {
      console.log('Blogs: Loading initial data...', {
        blogsLoaded,
        blogsLength: blogs.length
      });
      dispatch(fetchBlogsPaginated({ page: 1, limit: 20, append: false }));
      dispatch(fetchBlogCategories());
    }
  }, [dispatch, blogsLoaded, blogs.length]);

  // Force refresh pagination when component becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && blogs.length > 0 && blogsPagination.hasNext) {
        console.log('Blogs: Page became visible, ensuring pagination is ready');
        setTimeout(() => {
          console.log('Blogs: Pagination should be ready now');
        }, 100);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [blogs.length, blogsPagination.hasNext]);

  // Cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      console.log('Blogs: Component unmounting');
    };
  }, []);

  // Debug logging
  useEffect(() => {
    console.log('Blogs state:', {
      blogs: blogs.length,
      categories: categories.length,
      loading,
      blogsLoaded,
      userLikes: userLikes.length,
      blogsPagination
    });
  }, [blogs, categories, loading, blogsLoaded, userLikes, blogsPagination]);

  // Load more blogs when scrolling - always works regardless of navigation
  const loadMore = useCallback(() => {
    console.log('Blogs loadMore called:', {
      loadingMore,
      loading,
      hasNext: blogsPagination.hasNext,
      currentPage: blogsPagination.currentPage,
      blogsLength: blogs.length,
      totalPages: blogsPagination.totalPages,
      blogsLoaded
    });
    
    // Prevent multiple simultaneous calls
    if (loadingMore || loading) {
      console.log('Blogs: Already loading, skipping call');
      return;
    }
    
    if (!blogsPagination.hasNext) {
      console.log('Blogs: No more pages available');
      return;
    }
    
    // Always allow loading more if we have pagination info, even if blogs array is empty
    if (blogsPagination.totalPages === 0) {
      console.log('Blogs: No pagination info available yet');
      return;
    }
    
    const nextPage = blogsPagination.currentPage + 1;
    console.log('Blogs: Loading page', nextPage, 'of', blogsPagination.totalPages);
    
    dispatch(fetchBlogsPaginated({ 
      page: nextPage, 
      limit: 20, 
      append: true 
    }));
  }, [dispatch, loadingMore, loading, blogsPagination.hasNext, blogsPagination.currentPage, blogsPagination.totalPages, blogsLoaded]);

  // Smart infinite scroll hook - only triggers when user scrolls to bottom and data is ready
  const lastElementRef = useSmartInfiniteScroll(
    loadMore,
    blogsPagination.hasNext,
    loading,
    loadingMore,
    blogs.length
  );

  // Debug ref attachment
  useEffect(() => {
    console.log('🔍 Blogs ref attachment check:', {
      blogsLength: blogs.length,
      hasNext: blogsPagination.hasNext,
      loading,
      loadingMore,
      shouldAttachRef: blogs.length > 0 && blogsPagination.hasNext,
      currentPage: blogsPagination.currentPage,
      totalPages: blogsPagination.totalPages
    });
  }, [blogs.length, blogsPagination.hasNext, loading, loadingMore, blogsPagination.currentPage, blogsPagination.totalPages]);

  // Show all blogs since we removed search/filter functionality
  const filteredBlogs = blogs;
  
  // Compute sections for layout
  const sortedLatest = [...filteredBlogs].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  const mainList = sortedLatest; // Show all accumulated blogs

  // Like handler using shared hook; shows per-item spinner and updates local UI
  const { handleLike, isLiking, likingItemId } = useLikeReply();

  const handleBlogLikeClick = async (blog) => {
    const currentIsLiked = Boolean(blog.isLiked || userLikes.includes(blog.blogId));
    const currentLikes = Number(blog.likes || 0);
    const result = await handleLike('blog', blog.blogId, currentLikes, currentIsLiked);
    if (result && result.success) {
      // Update local blog object so the list reflects immediately
      blog.likes = result.newLikeCount;
      blog.isLiked = result.isLiked;
    }
  };

  // Compute sections: featured latest, more latest, most popular
  const featuredBlog = sortedLatest[0];
  const latestList = sortedLatest.slice(1, 7);
  const popularBlogs = [...filteredBlogs]
    .sort(
      (a, b) => (b.likes || 0) + (b.views || 0) - ((a.likes || 0) + (a.views || 0))
    )
    .slice(0, 7);

  // Debug layout calculation
  console.log('🔍 Blogs Layout Calculation:', {
    filteredBlogs: filteredBlogs.length,
    sortedLatest: sortedLatest.length,
    mainList: mainList.length,
    featuredBlog: featuredBlog ? featuredBlog.title : 'None',
    latestList: latestList.length,
    popularBlogs: popularBlogs.length,
    mainListTitles: mainList.map(b => b.title).slice(0, 3)
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
        title="Blog Posts"
        description="Discover insights, tips, and stories from the boating community. Read expert articles about marine life, boating techniques, and fishing guides."
        canonicalUrl="/blogs"
        keywords={['blog posts', 'boating articles', 'marine tips', 'fishing guides', 'boating community']}
      />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Blog Posts</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Discover insights, tips, and stories from the boating community</p>
        </div>
      </div>



      {/* Two-column news layout: Latest (large) + Popular (sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {loading && !blogsLoaded ? (
          <div className="col-span-full text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading blogs...</p>
          </div>
        ) : (
          <>
            {/* Left/Main column - Latest as compact list */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {mainList.map((b, index) => {
                    const isLastElement = index === mainList.length - 1;
                    const shouldAttachRef = isLastElement && blogsPagination.hasNext;
                    console.log('🔍 Blog rendering:', {
                      index,
                      totalLength: mainList.length,
                      isLastElement,
                      shouldAttachRef,
                      hasNext: blogsPagination.hasNext,
                      loading,
                      loadingMore,
                      blogId: b.blogId,
                      title: b.title
                    });
                    return (
                      <li key={b.blogId} ref={shouldAttachRef ? lastElementRef : null} className="p-3 sm:p-4">
                      <Link to={`/blogs/${encodeURIComponent(b.slug)}`} className="flex items-start gap-3 group">
                        <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden flex-shrink-0">
                          {b.image ? (
                            <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-lime-400 to-lime-600 flex items-center justify-center"><FileText className="h-4 w-4 text-white" /></div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm sm:text-base font-medium text-blue-700 dark:text-blue-300 group-hover:underline line-clamp-2">{b.title}</h3>
                          {(b.metaDescription || b.content) && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">{getExcerpt(b.metaDescription || b.content, 100)}</p>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Latest: {b.author?.userName || 'Admin'} · {formatDate(b.createdAt)}</p>
                          {b.category?.name && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{b.category.name}</p>
                          )}
                        </div>
                      </Link>
                    </li>
                    );
                  })}
                </ul>
              </div>
            
              {/* Loading more indicator for infinite scroll */}
            {loadingMore && (
                <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading more blogs...</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                  Page {blogsPagination.currentPage + 1} of {blogsPagination.totalPages}
                </p>
              </div>
            )}
            
            {/* End of results indicator */}
            {!blogsPagination.hasNext && blogs.length > 0 && (
              <div className="text-center py-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">You've reached the end!</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                  Showing {blogs.length} of {blogsPagination.total} blogs
                </p>
              </div>
            )}
            
            {/* Debug info */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-center py-2 text-xs text-gray-400 border-t border-gray-200 dark:border-gray-700">
                <p>Debug: Page {blogsPagination.currentPage}/{blogsPagination.totalPages} | 
                   Has Next: {blogsPagination.hasNext ? 'Yes' : 'No'} | 
                   Blogs: {blogs.length} | 
                   Loading: {loading ? 'Yes' : 'No'} | 
                   Loading More: {loadingMore ? 'Yes' : 'No'} |
                   BlogsLoaded: {blogsLoaded ? 'Yes' : 'No'}
                </p>
                <p>First 3 Blogs: {blogs.slice(0, 3).map(b => b.title).join(', ')}</p>
              </div>
            )}
            </div>

            {/* Right/Sidebar column - Popular */}
            <aside className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wide">Most popular</h2>
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {popularBlogs.map((b) => (
                    <li key={b.blogId} className="p-3">
                      <Link to={`/blogs/${encodeURIComponent(b.slug)}`} className="flex items-start gap-3 group">
                        <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                          {b.image ? (
                            <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-lime-400 to-lime-600 flex items-center justify-center"><FileText className="h-4 w-4 text-white" /></div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300 group-hover:underline line-clamp-2">{b.title}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Latest: {b.author?.userName || 'Admin'} · {formatDate(b.createdAt)}</p>
                          {b.category?.name && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{b.category.name}</p>
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
      {!loading && filteredBlogs.length === 0 && (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No blogs found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No blog posts available yet.
          </p>
        </div>
      )}
    </div>
    </>
  );
};

export default Blogs;