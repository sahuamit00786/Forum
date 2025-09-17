import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchBlogDetailData, addComment, clearBlogDetailData, updateBlogLike } from '../store/slices/blogDetailSlice';
import { useLikeReply } from '../hooks/useLikeReply';
import BackButton from '../components/BackButton';
import ShareButton from '../components/ShareButton';
import { ArticleSEO } from '../components/SEO';
import { viewsAPI } from '../utils/api';
import Notification from '../components/Notification';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Eye, 
  MessageCircle, 
  Heart, 
  Clock,
  Tag,
  Send,
  Reply,
  ThumbsUp
} from 'lucide-react';

const BlogDetail = () => {
  const { blogSlug } = useParams();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { blog, comments, relatedBlogs, userLikes, loading, error } = useSelector((state) => state.blogDetail);
  const [showNotFound, setShowNotFound] = useState(false);
  const [loadingStartTime, setLoadingStartTime] = useState(null);
  
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [commentSuccess, setCommentSuccess] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  
  // Use the new like/reply hook
  const { handleLike, handleReply, isLiking, isReplying, likingItemId } = useLikeReply();
  
  // Local function to set reply state
  const setReplyToComment = (comment) => {
    setReplyTo(comment);
  };

  useEffect(() => {
    if (blogSlug) {
      setLoadingStartTime(Date.now());
      setShowNotFound(false);
      dispatch(fetchBlogDetailData(blogSlug));
    }
    
    // Cleanup when component unmounts
    return () => {
      dispatch(clearBlogDetailData());
    };
  }, [dispatch, blogSlug]);

  useEffect(() => {
    if (blog?.blogId) {
      setShowNotFound(false);
    }
  }, [blog?.blogId]);

  // Increment unique view once per IP and update local count immediately
  useEffect(() => {
    const incrementUniqueView = async () => {
      try {
        if (blog?.blogId) {
          const response = await viewsAPI.increment('blog', blog.blogId);
          if (blog && response?.views !== undefined) {
            blog.views = response.views;
          }
        }
      } catch (e) {
        console.log('View increment skipped/error:', e?.message || e);
      }
    };
    incrementUniqueView();
  }, [blog?.blogId]);

  // Handle loading timeout and show not found after minimum loading time
  useEffect(() => {
    if (loadingStartTime && !loading && !blog) {
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
  }, [loading, blog, loadingStartTime]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (commentSuccess) {
      const timer = setTimeout(() => {
        setCommentSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [commentSuccess]);

  const handleBlogLike = async () => {
    const result = await handleLike('blog', blog.blogId, blog.likes || 0, blog.isLiked);
    
    if (result && result.success) {
      // Update via Redux slice to ensure re-render
      dispatch(updateBlogLike({ isLiked: result.isLiked, likes: result.newLikeCount }));
      
      // Show success notification
      const action = result.isLiked ? 'liked' : 'unliked';
      setNotification({
        show: true,
        message: `Successfully ${action} blog!`,
        type: 'success'
      });
      
      console.log('Blog like updated successfully:', result);
    } else {
      // Show error notification
      setNotification({
        show: true,
        message: 'Failed to update like. Please try again.',
        type: 'error'
      });
    }
  };

  const handleCommentLike = async (commentId) => {
    // Find the comment to get current like count
    let currentComment = null;
    let currentLikeCount = 0;
    let currentIsLiked = false;
    
    // Check in main comments first
    const commentIndex = comments.findIndex(c => c.commentId === commentId);
    if (commentIndex !== -1) {
      currentComment = comments[commentIndex];
      currentLikeCount = currentComment.likeCount || 0;
      currentIsLiked = currentComment.isLiked || false;
    } else {
      // Check in replies
      for (let i = 0; i < comments.length; i++) {
        if (comments[i].replies) {
          const replyIndex = comments[i].replies.findIndex(r => r.commentId === commentId);
          if (replyIndex !== -1) {
            currentComment = comments[i].replies[replyIndex];
            currentLikeCount = currentComment.likeCount || 0;
            currentIsLiked = currentComment.isLiked || false;
            break;
          }
        }
      }
    }
    
    if (!currentComment) return;
    
    const result = await handleLike('comment', commentId, currentLikeCount, currentIsLiked);
    
    if (result && result.success) {
      // Manually update local state for real-time UI
      if (commentIndex !== -1) {
        // Update main comment
        comments[commentIndex].isLiked = result.isLiked;
        comments[commentIndex].likeCount = result.newLikeCount;
      } else {
        // Update reply comment
        for (let i = 0; i < comments.length; i++) {
          if (comments[i].replies) {
            const replyIndex = comments[i].replies.findIndex(r => r.commentId === commentId);
            if (replyIndex !== -1) {
              comments[i].replies[replyIndex].isLiked = result.isLiked;
              comments[i].replies[replyIndex].likeCount = result.newLikeCount;
              break;
            }
          }
        }
      }
      
      // Show success notification
      const action = result.isLiked ? 'liked' : 'unliked';
      setNotification({
        show: true,
        message: `Successfully ${action} comment!`,
        type: 'success'
      });
      
      console.log('Comment like updated successfully:', result);
    } else {
      // Show error notification
      setNotification({
        show: true,
        message: 'Failed to update like. Please try again.',
        type: 'error'
      });
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;
    
    const result = await handleReply('blog', blog.blogId, newComment, replyTo?.commentId || null);
    
    if (result && result.success) {
      // Add new comment to the top of the list
      if (result.comment) {
        const newComment = {
          ...result.comment,
          commentId: result.comment.commentId || Date.now(), // Fallback ID
          content: newComment,
          author: { userName: user?.userName || 'You' },
          createdAt: new Date().toISOString(),
          likeCount: 0,
          isLiked: false,
          replies: []
        };
        
        // Add to beginning of comments array (newest first)
        comments.unshift(newComment);
      }
      
      setNewComment('');
      setReplyTo(null);
      setCommentSuccess(true);
      
      // Show success notification
      setNotification({
        show: true,
        message: replyTo ? 'Reply posted successfully!' : 'Comment posted successfully!',
        type: 'success'
      });
      
      console.log('Comment posted successfully:', result);
    } else {
      // Show error notification
      setNotification({
        show: true,
        message: 'Failed to post comment. Please try again.',
        type: 'error'
      });
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

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  if (loading || (!blog && !showNotFound)) {
    return (
      <div className="max-w-6xl mx-auto px-1 sm:px-4 space-y-4 sm:space-y-6">
        <div className="text-center py-8 sm:py-12">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-primary-600 mx-auto mb-3 sm:mb-4"></div>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Loading blog content...</p>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 mt-2">
            Please wait while we fetch the blog details
          </p>
          {loadingStartTime && !blog && (
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

  if (!blog && showNotFound) {
    return (
      <div className="max-w-6xl mx-auto px-1 sm:px-4 space-y-4 sm:space-y-6">
        <div className="text-center py-8 sm:py-12">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Blog Not Found</h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">The blog you're looking for doesn't exist or has been removed.</p>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
            <Link
              to="/search"
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base"
            >
              Search Blogs
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
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error Loading Blog</h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ArticleSEO
        title={blog.title}
        description={blog.metaDescription || blog.content?.substring(0, 155) + '...'}
        canonicalUrl={`/blogs/${blog.slug}`}
        image={blog.image}
        author={blog.author?.userName}
        publishedAt={blog.createdAt}
        updatedAt={blog.updatedAt}
        category={blog.category?.name}
        keywords={[blog.category?.name, 'blog', 'boating', 'marine'].filter(Boolean)}
      />
      <div className="max-w-6xl mx-auto px-1 sm:px-4 space-y-4 sm:space-y-6">
      {/* Back Button */}
      <div className="mb-4 sm:mb-6">
        <BackButton />
      </div>

      {/* Notification */}
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.show}
        onClose={() => setNotification({ ...notification, show: false })}
      />

      {/* Blog Header */}
      <article className="bg-white dark:bg-dark-800 rounded-lg overflow-hidden border border-gray-200 dark:border-dark-700">
        {/* Featured Image */}
        <div className="h-48 sm:h-56 md:h-96 overflow-hidden">
          <img 
            src={blog.image || 'https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg?auto=compress&cs=tinysrgb&w=1200'} 
            alt={blog.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-3 sm:p-6 lg:p-8">
          {/* Blog Meta */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3 sm:mb-4">
            {blog.category && (
              <Link
                to={`/category/${blog.category.slug}`}
                className="px-2 sm:px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors text-xs sm:text-sm"
              >
                {blog.category.name}
              </Link>
            )}
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>{Math.ceil((blog.content?.length || 0) / 200)} min read</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>{formatDate(blog.createdAt)}</span>
            </div>
          </div>

          {/* Blog Title */}
          <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            {blog.title}
          </h1>

          {/* Author Info */}
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-primary-600 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                {blog.author?.userName || 'Anonymous'}
              </p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Marine Expert
              </p>
            </div>
          </div>

          {/* Blog Stats */}
          <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-gray-200 dark:border-dark-700">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
              {blog.views || 0} views
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
              {comments?.length || 0} comments
            </span>
            <button 
              onClick={handleBlogLike}
              disabled={isLiking && likingItemId === blog.blogId}
              className={`flex items-center gap-1 transition-colors ${
                blog.isLiked 
                  ? 'text-red-500 hover:text-red-600' 
                  : 'hover:text-red-500'
              }`}
            >
              {isLiking && likingItemId === blog.blogId ? (
                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-current"></div>
              ) : (
                <Heart className={`h-3 w-3 sm:h-4 sm:w-4 ${blog.isLiked ? 'fill-current' : ''}`} />
              )}
              {blog.likes || 0} likes
            </button>

            {/* Share */}
          <div className="flex items-center gap-3 border-gray-200 dark:border-dark-700">
            
            <ShareButton 
              url={window.location.href} 
              title={blog.title}
            />
          </div>

          </div>

          

          {/* Blog Content */}
          <div className="prose dark:prose-invert max-w-none mb-6 sm:mb-8">
            <div 
              className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed [&>p]:mb-3 sm:[&>p]:mb-4 [&>p]:leading-relaxed [&>strong]:font-semibold [&>strong]:text-gray-900 dark:[&>strong]:text-white [&>ul]:list-disc [&>ul]:pl-4 sm:[&>ul]:pl-6 [&>ul]:mb-3 sm:[&>ul]:mb-4 [&>li]:mb-1 [&>li]:leading-relaxed"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </div>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="mb-4 sm:mb-6">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <Tag className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Tags:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag, index) => (
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

      {/* Comments Section */}
      <div className="bg-white dark:bg-dark-800 rounded-lg p-3 sm:p-6 border border-gray-200 dark:border-dark-700">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
          Comments ({comments?.length || 0})
        </h2>

        {/* Add Comment */}
        {isAuthenticated && (
          <div className="mb-6 sm:mb-8">
            {replyTo && (
              <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    Replying to <strong>{replyTo.author?.userName || 'Unknown'}</strong>
                  </span>
                  <button
                    onClick={() => setReplyTo(null)}
                    className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            
            <form onSubmit={handleComment} className="space-y-3 sm:space-y-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={replyTo ? `Reply to ${replyTo.author?.userName}...` : "Write a comment..."}
                className="w-full p-3 sm:p-4 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none text-sm sm:text-base"
                rows="4"
              />
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  disabled={isReplying}
                  className="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isReplying ? (
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                      <span>Posting...</span>
                    </div>
                  ) : (
                    <>
                      <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                      {replyTo ? 'Reply' : 'Comment'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-4 sm:space-y-6">
          {commentSuccess && (
            <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-2 h-2 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-green-800 dark:text-green-200 font-medium text-xs sm:text-sm">Comment added successfully!</span>
              </div>
            </div>
          )}
          {comments && comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.commentId} className="border-b border-gray-200 dark:border-dark-700 last:border-0 pb-4 sm:pb-6 last:pb-0">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                        {comment.author?.userName || 'Anonymous'}
                      </span>
                      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        {formatTimeAgo(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-3">
                      {comment.content}
                    </p>
                    <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm">
                      <button 
                        onClick={() => handleCommentLike(comment.commentId)}
                        disabled={isLiking && likingItemId === comment.commentId}
                        className={`flex items-center gap-1 transition-colors ${
                          comment.isLiked
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-gray-500 hover:text-primary-600'
                        }`}
                      >
                        {isLiking && likingItemId === comment.commentId ? (
                          <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-current"></div>
                        ) : (
                          <ThumbsUp className={`h-3 w-3 sm:h-4 sm:w-4 ${comment.isLiked ? 'fill-current' : ''}`} />
                        )}
                        {comment.likeCount || 0}
                      </button>
                      {isAuthenticated && (
                        <button
                          onClick={() => setReplyToComment(comment)}
                          className="flex items-center gap-1 text-gray-500 hover:text-primary-600 transition-colors"
                        >
                          <Reply className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">Reply</span>
                        </button>
                      )}
                    </div>
                    
                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-4 sm:mt-6 ml-4 sm:ml-8 space-y-3 sm:space-y-4">
                        {comment.replies.map((reply) => (
                          <div key={reply.commentId} className="border-l-2 border-gray-200 dark:border-dark-600 pl-4 sm:pl-6">
                            <div className="flex items-start gap-3 sm:gap-4">
                              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <User className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 sm:gap-3 mb-1">
                                  <span className="font-semibold text-gray-900 dark:text-white">
                                    {reply.author?.userName || 'Unknown User'}
                                  </span>
                                  <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {formatTimeAgo(reply.createdAt)}
                                  </span>
                                </div>
                                
                                <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
                                  <div dangerouslySetInnerHTML={{ __html: reply.content }} />
                                </div>
                                
                                <div className="flex items-center gap-4 sm:gap-6">
                                  <button
                                    onClick={() => handleCommentLike(reply.commentId)}
                                    disabled={isLiking && likingItemId === reply.commentId}
                                    className={`flex items-center gap-1 text-sm transition-colors ${
                                      reply.isLiked
                                        ? 'text-red-600 dark:text-red-400'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                    }`}
                                  >
                                    {isLiking && likingItemId === reply.commentId ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                                    ) : (
                                      <ThumbsUp className={`h-4 w-4 ${reply.isLiked ? 'fill-current' : ''}`} />
                                    )}
                                    <span>{reply.likeCount || 0}</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 sm:py-8 text-gray-500 dark:text-gray-400 text-sm sm:text-base">
              No comments yet. Be the first to comment!
            </div>
          )}
        </div>
      </div>

      {/* Related Blogs */}
      <div className="bg-white dark:bg-dark-800 rounded-lg p-3 sm:p-6 border border-gray-200 dark:border-dark-700">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
          Related Articles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {relatedBlogs && relatedBlogs.length > 0 ? (
            relatedBlogs.map((relatedBlog) => (
              <Link key={relatedBlog.blogId} to={`/blogs/${relatedBlog.slug}`} className="group">
                <div className="flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">
                  <img 
                    src={relatedBlog.image || 'https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&w=100'} 
                    alt={relatedBlog.title}
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-primary-600 mb-1 text-sm sm:text-base">
                      {relatedBlog.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      {relatedBlog.metaDescription || relatedBlog.content?.substring(0, 100) + '...'}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>by {relatedBlog.author?.userName || 'Unknown'}</span>
                      <span>•</span>
                      <span>{relatedBlog.replies || 0} replies</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-2 text-center py-6 sm:py-8 text-gray-500 dark:text-gray-400 text-sm sm:text-base">
              No related blogs found.
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default BlogDetail;