import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchArticleDetailData, clearArticleDetailData, updateArticleLike } from '../store/slices/articleDetailSlice';
import { useLikeReply } from '../hooks/useLikeReply';
import BackButton from '../components/BackButton';
import ShareButton from '../components/ShareButton';
import { ArticleSEO } from '../components/SEO';
import { viewsAPI } from '../utils/api';
import { ArrowLeft, Calendar, Eye, Clock, Tag, Bookmark, Printer as Print, Zap, Upload, Heart, User } from 'lucide-react';

const ArticleDetail = () => {
  const { articleSlug } = useParams();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { article, relatedArticles, userLikes, loading, error } = useSelector((state) => state.articleDetail);
  const [showNotFound, setShowNotFound] = useState(false);
  const [loadingStartTime, setLoadingStartTime] = useState(null);
  
  // Use the new like/reply hook
  const { handleLike, isLiking } = useLikeReply();

  useEffect(() => {
    if (articleSlug) {
      setLoadingStartTime(Date.now());
      setShowNotFound(false);
      dispatch(fetchArticleDetailData(articleSlug));
    }
    
    // Cleanup when component unmounts
    return () => {
      dispatch(clearArticleDetailData());
    };
  }, [dispatch, articleSlug]);

  useEffect(() => {
    if (article?.articleId) {
      setShowNotFound(false);
    }
  }, [article?.articleId]);

  // Increment unique view once per IP and update local count immediately
  useEffect(() => {
    const incrementUniqueView = async () => {
      try {
        if (article?.articleId) {
          const response = await viewsAPI.increment('article', article.articleId);
          if (article && response?.views !== undefined) {
            article.views = response.views;
          }
        }
      } catch (e) {
        console.log('View increment skipped/error:', e?.message || e);
      }
    };
    incrementUniqueView();
  }, [article?.articleId]);

  // Handle loading timeout and show not found after minimum loading time
  useEffect(() => {
    if (loadingStartTime && !loading && !article) {
      const elapsedTime = Date.now() - loadingStartTime;
      const minLoadingTime = 5000; // 5 seconds minimum loading time
      
      if (elapsedTime < minLoadingTime) {
        // Wait for the remaining time before showing not found
        const remainingTime = minLoadingTime - elapsedTime;
        const timeout = setTimeout(() => {
          setShowNotFound(true);
        }, remainingTime);
        
        return () => clearTimeout(timeout);
      } else {
        // Already waited enough time, show not found immediately
        setShowNotFound(true);
      }
    }
  }, [loading, article, loadingStartTime]);

  const handleArticleLike = async () => {
    const result = await handleLike('article', article.articleId, article.likes || 0, article.isLiked);
    
    if (result && result.success) {
      // Update via Redux slice to ensure re-render
      dispatch(updateArticleLike({ isLiked: result.isLiked, likes: result.newLikeCount }));
      console.log('Article like updated successfully:', result);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading || (!article && !showNotFound)) {
    return (
      <div className="max-w-6xl mx-auto px-1 sm:px-4 space-y-4 sm:space-y-6">
        <div className="text-center py-8 sm:py-12">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-primary-600 mx-auto mb-3 sm:mb-4"></div>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Loading article content...</p>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 mt-2">
            Please wait while we fetch the article details
          </p>
          {loadingStartTime && !article && (
            <div className="mt-3 sm:mt-4 w-48 sm:w-64 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mx-auto">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min(100, ((Date.now() - loadingStartTime) / 5000) * 100)}%` 
                }}
              ></div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!article && showNotFound) {
    return (
      <div className="max-w-6xl mx-auto px-1 sm:px-4 space-y-4 sm:space-y-6">
        <div className="text-center py-8 sm:py-12">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Article Not Found</h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">The article you're looking for doesn't exist or has been removed.</p>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
            <Link
              to="/search"
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base"
            >
              Search Articles
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-1 sm:px-4 space-y-4 sm:space-y-6">
        <div className="mb-4 sm:mb-6">
          <BackButton />
        </div>
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error Loading Article</h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ArticleSEO
        title={article.title}
        description={article.metaDescription || article.content?.substring(0, 155) + '...'}
        canonicalUrl={`/articles/${article.slug}`}
        image={article.image}
        author={article.author?.userName}
        publishedAt={article.createdAt}
        updatedAt={article.updatedAt}
        category={article.category?.name}
        keywords={[article.category?.name, 'article', 'boating', 'marine'].filter(Boolean)}
      />
      <div className="max-w-6xl mx-auto px-1 sm:px-4 space-y-4 sm:space-y-6">
      {/* Back Button */}
      <div className="mb-4 sm:mb-6">
        <BackButton />
      </div>

      {/* Article Header */}
      <article className="bg-white dark:bg-dark-800 rounded-lg overflow-hidden border border-gray-200 dark:border-dark-700 relative z-10">
        {/* Featured Image */}
        <div className="h-48 sm:h-64 md:h-96 overflow-hidden">
          <img 
            src={article.image || 'https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg?auto=compress&cs=tinysrgb&w=1200'} 
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-3 sm:p-6 lg:p-8">
          {/* Article Meta */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3 sm:mb-4">
            {article.category && (
              <Link
                to={`/category/${article.category.slug}`}
                className="px-2 sm:px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors text-xs sm:text-sm"
              >
                {article.category.name}
              </Link>
            )}
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>{Math.ceil((article.content?.length || 0) / 200)} min read</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>{formatDate(article.createdAt)}</span>
            </div>
          </div>

          {/* Article Title */}
          <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            {article.title}
          </h1>

          {/* Article Description */}
          {article.metaDescription && (
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
              {article.metaDescription}
            </p>
          )}

          {/* Author Info */}
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-primary-600 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                {article.author?.userName || 'Anonymous'}
              </p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Marine Expert
              </p>
            </div>
          </div>

          {/* Article Stats */}
          <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-gray-200 dark:border-dark-700">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
              {article.views || 0} views
            </span>
            <button 
              onClick={handleArticleLike}
              disabled={isLiking}
              className={`flex items-center gap-1 transition-colors ${
                article.isLiked 
                  ? 'text-red-500 hover:text-red-600' 
                  : 'hover:text-red-500'
              }`}
            >
              {isLiking ? (
                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-current"></div>
              ) : (
                <Heart className={`h-3 w-3 sm:h-4 sm:w-4 ${article.isLiked ? 'fill-current' : ''}`} />
              )}
              {article.likes || 0} likes
            </button>

              {/* Action Buttons */}
         
       <ShareButton 
         url={window.location.href} 
         title={article.title}
       />
     
    

          </div>

          {/* Article Content */}
          <div className="prose dark:prose-invert max-w-none mb-6 sm:mb-8">
            <div 
              className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed [&>p]:mb-3 sm:[&>p]:mb-4 [&>p]:leading-relaxed [&>strong]:font-semibold [&>strong]:text-gray-900 dark:[&>strong]:text-white [&>ul]:list-disc [&>ul]:pl-4 sm:[&>ul]:pl-6 [&>ul]:mb-3 sm:[&>ul]:mb-4 [&>li]:mb-1 [&>li]:leading-relaxed"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mb-4 sm:mb-6">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <Tag className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Tags:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 sm:px-3 py-1 bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-full text-xs sm:text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

        
        </div>
      </article>

      {/* Related Articles */}
      <div className="bg-white dark:bg-dark-800 rounded-lg p-3 sm:p-6 border border-gray-200 dark:border-dark-700">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
          Related Articles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {relatedArticles && relatedArticles.length > 0 ? (
            relatedArticles.map((relatedArticle) => (
              <Link key={relatedArticle.articleId} to={`/articles/${relatedArticle.slug}`} className="group">
                <div className="flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">
                  <img 
                    src={relatedArticle.image || 'https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&w=100'} 
                    alt={relatedArticle.title}
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-primary-600 mb-1 text-sm sm:text-base">
                      {relatedArticle.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      {relatedArticle.metaDescription || relatedArticle.content?.substring(0, 100) + '...'}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>by {relatedArticle.author?.userName || 'Unknown'}</span>
                      <span>•</span>
                      <span>{relatedArticle.likes || 0} likes</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-2 text-center py-6 sm:py-8 text-gray-500 dark:text-gray-400 text-sm sm:text-base">
              No related articles found.
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default ArticleDetail;