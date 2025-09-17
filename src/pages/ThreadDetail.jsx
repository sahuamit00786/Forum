import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchThreadDetailData, addComment, clearThreadDetailData, updateThreadLike } from '../store/slices/threadDetailSlice';
import { useLikeReply } from '../hooks/useLikeReply';
import BackButton from '../components/BackButton';
import ShareButton from '../components/ShareButton';
import { ArticleSEO } from '../components/SEO';
import { viewsAPI } from '../utils/api';
import Notification from '../components/Notification';
import { 
  ArrowLeft, 
  Heart, 
  MessageCircle, 
  Pin, 
  Eye,
  Calendar,
  User,
  Reply,
  ThumbsUp,
  Flag,
  Send
} from 'lucide-react';

const ThreadDetail = () => {
  const { threadSlug } = useParams();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { thread, comments, relatedThreads, userLikes, loading, error } = useSelector((state) => state.threadDetail);
  
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [showNotFound, setShowNotFound] = useState(false);
  const [loadingStartTime, setLoadingStartTime] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  
  // Use the new like/reply hook
  const { handleLike, handleReply, isLiking, isReplying, likingItemId } = useLikeReply();

  useEffect(() => {
    if (threadSlug) {
      console.log('Fetching thread detail with slug:', threadSlug);
      setLoadingStartTime(Date.now());
      setShowNotFound(false);
      dispatch(fetchThreadDetailData(threadSlug));
    }
    
    // Cleanup when component unmounts
    return () => {
      dispatch(clearThreadDetailData());
    };
  }, [dispatch, threadSlug]);

  useEffect(() => {
    if (thread?.threadId) {
      console.log('Thread data received:', thread);
      setShowNotFound(false);
    }
  }, [thread?.threadId]);

  // Increment unique view once per IP and update local count immediately
  useEffect(() => {
    const incrementUniqueView = async () => {
      try {
        if (thread?.threadId) {
          const response = await viewsAPI.increment('thread', thread.threadId);
          if (thread && response?.views !== undefined) {
            thread.views = response.views;
          }
        }
      } catch (e) {
        console.log('View increment skipped/error:', e?.message || e);
      }
    };
    incrementUniqueView();
  }, [thread?.threadId]);

  // Handle loading timeout and show not found after minimum loading time
  useEffect(() => {
    if (loadingStartTime && !loading && !thread) {
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
  }, [loading, thread, loadingStartTime]);

  const handleComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;
    
    const result = await handleReply('thread', thread.threadId, newComment, replyTo?.commentId || null);
    
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

  const setReplyToComment = (comment) => {
    setReplyTo(comment);
  };

  const handleThreadLike = async () => {
    const result = await handleLike('thread', thread.threadId, thread.likes || 0, thread.isLiked);
    
    if (result && result.success) {
      // Update via Redux slice to ensure re-render
      dispatch(updateThreadLike({ isLiked: result.isLiked, likes: result.newLikeCount }));
      
      // Show success notification
      const action = result.isLiked ? 'liked' : 'unliked';
      setNotification({
        show: true,
        message: `Successfully ${action} thread!`,
        type: 'success'
      });
      
      console.log('Like updated successfully:', result);
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

  if (loading || (!thread && !showNotFound)) {
    return (
      <div className="max-w-4xl mx-auto px-1 sm:px-4 space-y-4 sm:space-y-6">
        {/* Back Button */}
        <div className="mb-4 sm:mb-6">
          <BackButton />
        </div>
        
        <div className="flex flex-col justify-center items-center h-48 sm:h-64">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-500 mb-3 sm:mb-4"></div>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 text-center">
            Loading thread content...
          </p>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 mt-2">
            Please wait while we fetch the thread details
          </p>
          {loadingStartTime && !thread && (
            <div className="mt-3 sm:mt-4 w-48 sm:w-64 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
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

  if (!thread && showNotFound) {
    return (
      <div className="max-w-4xl mx-auto px-1 sm:px-4 space-y-4 sm:space-y-6">
        {/* Back Button */}
        <div className="mb-4 sm:mb-6">
          <BackButton />
        </div>
        
        <div className="text-center py-6 sm:py-8">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
            Thread Not Found
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
            The thread you're looking for doesn't exist or has been removed.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
            <Link
              to="/threads"
              className="inline-flex items-center justify-center px-3 sm:px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm sm:text-base"
            >
              Browse All Threads
            </Link>
            <Link
              to="/search"
              className="inline-flex items-center justify-center px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base"
            >
              Search Threads
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-1 sm:px-4 space-y-4 sm:space-y-6">
        <div className="mb-4 sm:mb-6">
          <BackButton />
        </div>
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error Loading Thread</h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ArticleSEO
        title={thread.title}
        description={thread.description || thread.content?.substring(0, 155) + '...'}
        canonicalUrl={`/threads/${thread.slug}`}
        author={thread.author?.userName}
        publishedAt={thread.createdAt}
        updatedAt={thread.updatedAt}
        category={thread.category?.name}
        keywords={[thread.category?.name, 'thread', 'forum', 'boating', 'marine'].filter(Boolean)}
      />
                  <div className="max-w-6xl mx-auto px-1 sm:px-4 space-y-4 sm:space-y-6">
        {/* Notification */}
        <Notification
          message={notification.message}
          type={notification.type}
          isVisible={notification.show}
          onClose={() => setNotification({ ...notification, show: false })}
        />
        
        {/* Back Button */}
        <div className="mb-4 sm:mb-6">
          <BackButton />
        </div>

      {/* Thread Header */}
      <div className="bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700">
        <div className="p-3 sm:p-6">
          {/* Thread Meta */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3 sm:mb-4">
            {thread.category && (
              <Link
                to={`/category/${thread.category.slug}`}
                className="px-2 sm:px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors text-xs sm:text-sm"
              >
                {thread.category.name}
              </Link>
            )}
            {thread.isPinned && (
              <div className="flex items-center gap-1 text-yellow-600">
                <Pin className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Pinned</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>{formatDate(thread.createdAt)}</span>
            </div>
          </div>

          {/* Thread Title */}
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
            {thread.title}
          </h1>

          {/* Author Info */}
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-600 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {thread.author?.userName || 'Unknown User'}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {formatTimeAgo(thread.createdAt)}
              </div>
            </div>
          </div>

          {/* Thread Content */}
          <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none text-gray-700 dark:text-gray-300 mb-6 sm:mb-8">
            <div 
              className="whitespace-pre-wrap break-words"
              dangerouslySetInnerHTML={{ __html: thread.content || thread.description || 'No content available' }} 
            />
          </div>

          {/* Thread Actions */}
          <div className="flex items-center justify-between pt-4 sm:pt-6 border-t border-gray-200 dark:border-dark-700">
            <div className="flex items-center gap-4 sm:gap-6">
              <button
                onClick={handleThreadLike}
                disabled={isLiking && likingItemId === thread.threadId}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-colors ${
                  thread.isLiked
                    ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
                    : 'bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-600'
                }`}
              >
                {isLiking && likingItemId === thread.threadId ? (
                  <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-current"></div>
                ) : (
                  <Heart className={`h-4 w-4 sm:h-5 sm:w-5 ${thread.isLiked ? 'fill-current' : ''}`} />
                )}
                <span className="text-sm sm:text-base">{thread.likes || 0}</span>
              </button>
              
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-sm sm:text-base">{comments.length} replies</span>
              </div>
              
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-sm sm:text-base">{thread.views || 0} views</span>
              </div>
            </div>
            
            <ShareButton url={window.location.href} title={thread.title} />
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700">
        <div className="p-3 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
            Replies ({comments.length})
          </h2>

          {/* Comment Form */}
          {isAuthenticated ? (
            <div className="mb-6 sm:mb-8">
              {replyTo && (
                <div className="mb-3 sm:mb-4 p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Replying to <strong>{replyTo.author?.userName || 'Unknown'}</strong>
                    </span>
                    <button
                      onClick={() => setReplyTo(null)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleComment} className="space-y-3 sm:space-y-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write your reply..."
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white resize-none"
                  rows="4"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!newComment.trim() || isReplying}
                    className="px-4 sm:px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
                  >
                    {isReplying ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Posting...</span>
                      </div>
                    ) : (
                      'Post Reply'
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm sm:text-base font-semibold text-blue-900 dark:text-blue-100 mb-1 sm:mb-2">
                    Join the Discussion
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-200 mb-3 sm:mb-4">
                    To reply to this thread and participate in the discussion, please log in to your account.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <Link
                      to="/login"
                      className="inline-flex items-center justify-center px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base font-medium"
                    >
                      Log In
                    </Link>
                    <Link
                      to="/register"
                      className="inline-flex items-center justify-center px-3 sm:px-4 py-2 bg-white dark:bg-dark-700 text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-dark-600 transition-colors text-sm sm:text-base font-medium"
                    >
                      Create Account
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4 sm:space-y-6">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.commentId} className="border-b border-gray-200 dark:border-dark-700 pb-4 sm:pb-6 last:border-b-0">
                  {/* Comment Header */}
                  <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 sm:gap-3 mb-1">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {comment.author?.userName || 'Unknown User'}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatTimeAgo(comment.createdAt)}
                        </span>
                      </div>
                      
                      {/* Comment Content */}
                      <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300 mb-3 sm:mb-4">
                        <div dangerouslySetInnerHTML={{ __html: comment.content }} />
                      </div>
                      
                      {/* Comment Actions */}
                      <div className="flex items-center gap-4 sm:gap-6">
                        <button
                          onClick={() => handleCommentLike(comment.commentId)}
                          disabled={isLiking && likingItemId === comment.commentId}
                          className={`flex items-center gap-1 text-sm transition-colors ${
                            comment.isLiked
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                          }`}
                        >
                          {isLiking && likingItemId === comment.commentId ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                          ) : (
                            <ThumbsUp className={`h-4 w-4 ${comment.isLiked ? 'fill-current' : ''}`} />
                          )}
                          <span>{comment.likeCount || 0}</span>
                        </button>
                        
                        {isAuthenticated ? (
                          <button
                            onClick={() => setReplyToComment(comment)}
                            className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                          >
                            <Reply className="h-4 w-4" />
                            <span>Reply</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              alert('Please log in to reply to comments');
                            }}
                            className="flex items-center gap-1 text-sm text-gray-400 dark:text-gray-500 cursor-not-allowed"
                            title="Log in to reply"
                          >
                            <Reply className="h-4 w-4" />
                            <span>Reply</span>
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
                                <div className="flex-1 min-w-0">
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
                                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-400'
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
              <div className="text-center py-8 sm:py-12">
                <MessageCircle className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4 sm:mb-6" />
                <h3 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white mb-2 sm:mb-3">
                  No replies yet
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  Be the first to reply to this thread!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Threads */}
      {relatedThreads.length > 0 && (
        <div className="bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700">
          <div className="p-3 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
              Related Threads
            </h2>
            <div className="space-y-3 sm:space-y-4">
              {relatedThreads.map((relatedThread) => (
                <Link
                  key={relatedThread.threadId}
                  to={`/threads/${encodeURIComponent(relatedThread.slug)}`}
                  className="block p-3 sm:p-4 border border-gray-200 dark:border-dark-700 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {relatedThread.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>by {relatedThread.author?.userName || 'Unknown'}</span>
                    <span>•</span>
                    <span>{relatedThread.replies || 0} replies</span>
                    <span>•</span>
                    <span>{formatTimeAgo(relatedThread.createdAt)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default ThreadDetail;