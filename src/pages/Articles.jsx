import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchArticlesWithAllData, fetchArticlesPaginated, fetchArticleCategories } from '../store/slices/articleSlice';
import { Link } from 'react-router-dom';
import { DefaultSEO } from '../components/SEO';
import useSmartInfiniteScroll from '../hooks/useSmartInfiniteScroll';
import { 
  Newspaper, 
  Eye,
  Heart
} from 'lucide-react';

const Articles = () => {
  const dispatch = useDispatch();
  const { 
    articles, 
    categories,
    loading, 
    loadingMore,
    articlesPagination,
    articlesLoaded,
    userLikes
  } = useSelector((state) => state.article);
  const { isAuthenticated } = useSelector((state) => state.auth);
  


  // Helpers to create short, clean excerpts
  const getPlainText = (value) => {
    if (!value) return '';
    return String(value)
      .replace(/<[^>]+>/g, ' ')
      .replace(/[#$*_`>\\-]+/g, ' ')
      .replace(/\\s+/g, ' ')
      .trim();
  };

  const getExcerpt = (value, limit = 140) => {
    const text = getPlainText(value);
    if (text.length <= limit) return text;
    return `${text.slice(0, limit)}…`;
  };

  // Load initial data only once when component mounts
  useEffect(() => {
    if (!articlesLoaded || articles.length === 0) {
      console.log('Articles: Loading initial data...', {
        articlesLoaded,
        articlesLength: articles.length
      });
      dispatch(fetchArticlesPaginated({ page: 1, limit: 20, append: false }));
      dispatch(fetchArticleCategories());
    }
  }, [dispatch, articlesLoaded, articles.length]);

  // Force refresh pagination when component becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && articles.length > 0 && articlesPagination.hasNext) {
        console.log('Articles: Page became visible, ensuring pagination is ready');
        setTimeout(() => {
          console.log('Articles: Pagination should be ready now');
        }, 100);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [articles.length, articlesPagination.hasNext]);

  // Debug logging
  useEffect(() => {
    console.log('Articles state:', {
      articles: articles.length,
      categories: categories.length,
      loading,
      articlesLoaded,
      userLikes: userLikes.length,
      articlesPagination
    });
  }, [articles, categories, loading, articlesLoaded, userLikes, articlesPagination]);

  // Load more articles when scrolling - always works regardless of navigation
  const loadMore = useCallback(() => {
    console.log('Articles loadMore called:', {
      loadingMore,
      loading,
      hasNext: articlesPagination.hasNext,
      currentPage: articlesPagination.currentPage,
      articlesLength: articles.length,
      totalPages: articlesPagination.totalPages,
      articlesLoaded
    });
    
    // Prevent multiple simultaneous calls
    if (loadingMore || loading) {
      console.log('Articles: Already loading, skipping call');
      return;
    }
    
    if (!articlesPagination.hasNext) {
      console.log('Articles: No more pages available');
      return;
    }
    
    // Always allow loading more if we have pagination info, even if articles array is empty
    if (articlesPagination.totalPages === 0) {
      console.log('Articles: No pagination info available yet');
      return;
    }
    
    const nextPage = articlesPagination.currentPage + 1;
    console.log('Articles: Loading page', nextPage, 'of', articlesPagination.totalPages);
    
    dispatch(fetchArticlesPaginated({ 
      page: nextPage, 
      limit: 20, 
      append: true 
    }));
  }, [dispatch, loadingMore, loading, articlesPagination.hasNext, articlesPagination.currentPage, articlesPagination.totalPages, articlesLoaded]);

  // Smart infinite scroll hook - only triggers when user scrolls to bottom and data is ready
  const lastElementRef = useSmartInfiniteScroll(
    loadMore,
    articlesPagination.hasNext,
    loading,
    loadingMore,
    articles.length
  );

  // Debug ref attachment
  useEffect(() => {
    console.log('🔍 Articles ref attachment check:', {
      articlesLength: articles.length,
      hasNext: articlesPagination.hasNext,
      loading,
      loadingMore,
      shouldAttachRef: articles.length > 0 && articlesPagination.hasNext,
      currentPage: articlesPagination.currentPage,
      totalPages: articlesPagination.totalPages
    });
  }, [articles.length, articlesPagination.hasNext, loading, loadingMore, articlesPagination.currentPage, articlesPagination.totalPages]);

  // Show all articles since we removed search/filter functionality
  const filteredArticles = articles;
  
  // Compute sections for layout
  const sortedLatest = [...filteredArticles].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  const mainList = sortedLatest; // Show all accumulated articles
  const featuredArticle = sortedLatest[0];
  const latestList = sortedLatest.slice(1, 7);
  const popularArticles = [...filteredArticles]
    .sort(
      (a, b) => (b.likes || 0) + (b.views || 0) - ((a.likes || 0) + (a.views || 0))
    )
    .slice(0, 7);

  // Debug layout calculation
  console.log('🔍 Articles Layout Calculation:', {
    filteredArticles: filteredArticles.length,
    sortedLatest: sortedLatest.length,
    mainList: mainList.length,
    featuredArticle: featuredArticle ? featuredArticle.title : 'None',
    latestList: latestList.length,
    popularArticles: popularArticles.length,
    mainListTitles: mainList.map(a => a.title).slice(0, 3)
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
        title="Articles"
        description="In-depth articles and guides for boating enthusiasts. Expert insights on marine technology, safety, and boating techniques."
        canonicalUrl="/articles"
        keywords={['boating articles', 'marine guides', 'fishing tips', 'boat safety', 'marine technology']}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Articles</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">In-depth articles and guides for boating enthusiasts</p>
        </div>
      </div>



      {/* Articles - Latest + Popular layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {loading && !articlesLoaded ? (
          <div className="col-span-full text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading articles...</p>
          </div>
        ) : (
          <>
            {/* Left/Main column - Latest as compact list */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {mainList.map((a, index) => {
                    const isLastElement = index === mainList.length - 1;
                    const shouldAttachRef = isLastElement && articlesPagination.hasNext;
                    console.log('🔍 Article rendering:', {
                      index,
                      totalLength: mainList.length,
                      isLastElement,
                      shouldAttachRef,
                      hasNext: articlesPagination.hasNext,
                      loading,
                      loadingMore,
                      articleId: a.articleId,
                      title: a.title
                    });
                    return (
                      <li key={a.articleId} ref={shouldAttachRef ? lastElementRef : null} className="p-3 sm:p-4">
                      <Link to={`/articles/${encodeURIComponent(a.slug)}`} className="flex items-start gap-3 group">
                        <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden flex-shrink-0">
                          {a.image ? (
                            <img src={a.image} alt={a.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-lime-400 to-lime-600 flex items-center justify-center"><Newspaper className="h-4 w-4 text-white" /></div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm sm:text-base font-medium text-blue-700 dark:text-blue-300 group-hover:underline line-clamp-2">{a.title}</h3>
                          {(a.metaDescription || a.content) && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">{getExcerpt(a.metaDescription || a.content, 100)}</p>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Latest: {a.author?.userName || 'System'} · {formatDate(a.createdAt)}</p>
                          {a.category?.name && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{a.category.name}</p>
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
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading more articles...</p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                    Page {articlesPagination.currentPage + 1} of {articlesPagination.totalPages}
                  </p>
                </div>
              )}
              
              {/* End of results indicator */}
              {!articlesPagination.hasNext && articles.length > 0 && (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">You've reached the end!</p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                    Showing {articles.length} of {articlesPagination.total} articles
                  </p>
                </div>
              )}
              
              {/* Debug info */}
              {process.env.NODE_ENV === 'development' && (
                <div className="text-center py-2 text-xs text-gray-400 border-t border-gray-200 dark:border-gray-700">
                  <p>Debug: Page {articlesPagination.currentPage}/{articlesPagination.totalPages} | 
                     Has Next: {articlesPagination.hasNext ? 'Yes' : 'No'} | 
                     Articles: {articles.length} | 
                     Loading: {loading ? 'Yes' : 'No'} | 
                     Loading More: {loadingMore ? 'Yes' : 'No'} |
                     ArticlesLoaded: {articlesLoaded ? 'Yes' : 'No'}
                  </p>
                  <p>First 3 Articles: {articles.slice(0, 3).map(a => a.title).join(', ')}</p>
                </div>
              )}
            </div>

            {/* Popular sidebar */}
            <aside className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wide">Most popular</h2>
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {popularArticles.map((a) => (
                    <li key={a.articleId} className="p-3">
                      <Link to={`/articles/${encodeURIComponent(a.slug)}`} className="flex items-start gap-3 group">
                        <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                          {a.image ? (
                            <img src={a.image} alt={a.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-lime-400 to-lime-600 flex items-center justify-center"><Newspaper className="h-4 w-4 text-white" /></div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300 group-hover:underline line-clamp-2">{a.title}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Latest: {a.author?.userName || 'System'} · {formatDate(a.createdAt)}</p>
                          {a.category?.name && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{a.category.name}</p>
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
      {!loading && filteredArticles.length === 0 && (
        <div className="text-center py-8">
          <Newspaper className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No articles found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No articles available yet.
          </p>
        </div>
      )}
    </div>
    </>
  );
};

export default Articles;