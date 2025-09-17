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
  Send,
  Clock,
  Award,
  Shield
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
      setLoadingStartTime(Date.now());
      setShowNotFound(false);
      dispatch(fetchThreadDetailData(threadSlug));
    }
    
    return () => {
      dispatch(clearThreadDetailData());
    };
  }, [dispatch, threadSlug]);

  useEffect(() => {
    if (thread?.threadId) {
      setShowNotFound(false);
    }
  }, [thread?.threadId]);

  // Increment view count
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

  // Handle loading timeout
  useEffect(() => {
    if (loadingStartTime && !loading && !thread) {
      const elapsedTime = Date.now() - loadingStartTime;
      const minLoadingTime = 5000;
      
      if (elapsedTime < minLoadingTime) {
        const remainingTime = minLoadingTime - elapsedTime;
        const timeout = setTimeout(() => {
          setShowNotFound(true);
        }, remainingTime);
        
        return () => clearTimeout(timeout);
      } else {
        setShowNotFound(true);
      }
    }
  }, [loading, thread, loadingStartTime]);

  const handleComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;
    
    const result = await handleReply('thread', thread.threadId, newComment, replyTo?.commentId || null);
    
    if (result && result.success) {
      if (result.comment) {
        const newCommentObj = {
          ...result.comment,
          commentId: result.comment.commentId || Date.now(),
          content: newComment,
          author: { userName: user?.userName || 'You' },
          createdAt: new Date().toISOString(),
          likeCount: 0,
          isLiked: false,
          replies: []
        };
        
        comments.unshift(newCommentObj);
      }
      
      setNewComment('');
      setReplyTo(null);
      
      setNotification({
        show: true,
        message: replyTo ? 'Reply posted successfully!' : 'Comment posted successfully!',
        type: 'success'
      });
    } else {
      setNotification({
        show: true,
        message: 'Failed to post comment. Please try again.',
        type: 'error'
      });
    }
  };

  const setReplyToComment = (comment) => {
    setReplyTo(comment);
    // Scroll to comment form
    const commentForm = document.getElementById('comment-form');
    if (commentForm) {
      commentForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleThreadLike = async () => {
    const result = await handleLike('thread', thread.threadId, thread.likes || 0, thread.isLiked);
    
    if (result && result.success) {
      dispatch(updateThreadLike({ isLiked: result.isLiked, likes: result.newLikeCount }));
      
      const action = result.isLiked ? 'liked' : 'unliked';
      setNotification({
        show: true,
        message: `Successfully ${action} discussion!`,
        type: 'success'
      });
    } else {
      setNotification({
        show: true,
        message: 'Failed to update like. Please try again.',
        type: 'error'
      });
    }
  };

  const handleCommentLike = async (commentId) => {
    let currentComment = null;
    let currentLikeCount = 0;
    let currentIsLiked = false;
    
    const commentIndex = comments.findIndex(c => c.commentId === commentId);
    if (commentIndex !== -1) {
      currentComment = comments[commentIndex];
      currentLikeCount = currentComment.likeCount || 0;
      currentIsLiked = currentComment.isLiked || false;
    } else {
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
      if (commentIndex !== -1) {
        comments[commentIndex].isLiked = result.isLiked;
        comments[commentIndex].likeCount = result.newLikeCount;
      } else {
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
      
      const action = result.isLiked ? 'liked' : 'unliked';
      setNotification({
        show: true,
        message: `Successfully ${action} comment!`,
        type: 'success'
      });
    } else {
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
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)}w ago`;
    return `${Math.ceil(diffDays / 30)}mo ago`;
  };

  if (loading || (!thread && !showNotFound)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-6">
            <BackButton />
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-blue-600"></div>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Loading Discussion
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Please wait while we fetch the discussion details
              </p>
              {loadingStartTime && !thread && (
                <div className="mt-6 w-64 bg-slate-200 dark:bg-slate-700 rounded-full h-2 mx-auto">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min(100, ((Date.now() - loadingStartTime) / 5000) * 100)}%` 
                    }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!thread && showNotFound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-6">
            <BackButton />
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Discussion Not Found
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              The discussion you're looking for doesn't exist or has been removed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/threads"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                Browse Discussions
              </Link>
              <Link
                to="/search"
                className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                Search Forum
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-6">
            <BackButton />
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 text-center">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Error Loading Discussion</h2>
            <p className="text-slate-600 dark:text-slate-400">{error}</p>
          </div>
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
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Notification */}
          <Notification
            message={notification.message}
            type={notification.type}
            isVisible={notification.show}
            onClose={() => setNotification({ ...notification, show: false })}
          />
          
          {/* Back Button */}
          <div className="mb-8">
            <BackButton />
          </div>

          {/* Thread Header */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg mb-8">
            <div className="p-8">
              {/* Thread Meta */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                {thread.category && (
                  <Link
                    to={`/category/${thread.category.slug}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-all duration-200 font-semibold text-sm"
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    {thread.category.name}
                  </Link>
                )}
                {thread.isPinned && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-xl font-semibold text-sm">
                    <Pin className="h-4 w-4" />
                    Pinned
                  </div>
                )}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-xl font-medium text-sm">
                  <Calendar className="h-4 w-4" />
                  {formatDate(thread.createdAt)}
                </div>
              </div>

              {/* Thread Title */}
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-6 leading-tight">
                {thread.title}
              </h1>

              {/* Author Info */}
              <div className="flex items-center gap-4 mb-8 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">
                    {thread.author?.userName?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {thread.author?.userName || 'Unknown User'}
                    </span>
                    {thread.author?.roleId === 1 && (
                      <div className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg text-xs font-semibold">
                        <Shield className="h-3 w-3" />
                        Admin
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                    <span>Posted {formatTimeAgo(thread.createdAt)}</span>
                    <span>•</span>
                    <span>Marine Expert</span>
                  </div>
                </div>
              </div>

              {/* Thread Content */}
              <div className="prose prose-lg max-w-none text-slate-700 dark:text-slate-300 mb-8 leading-relaxed">
                <div 
                  className="whitespace-pre-wrap break-words"
                  dangerouslySetInnerHTML={{ __html: thread.content || thread.description || 'No content available' }} 
                />
              </div>

              {/* Thread Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-6">
                  <button
                    onClick={handleThreadLike}
                    disabled={isLiking && likingItemId === thread.threadId}
                    className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-semibold transition-all duration-200 transform hover:scale-105 ${
                      thread.isLiked
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 shadow-lg'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400'
                    }`}
                  >
                    {isLiking && likingItemId === thread.threadId ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent"></div>
                    ) : (
                      <Heart className={`h-5 w-5 ${thread.isLiked ? 'fill-current' : ''}`} />
                    )}
                    <span>{thread.likes || 0} Likes</span>
                  </button>
                  
                  <div className="flex items-center gap-3 px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-2xl">
                    <MessageCircle className="h-5 w-5" />
                    <span className="font-semibold">{comments.length} Replies</span>
                  </div>
                  
                  <div className="flex items-center gap-3 px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-2xl">
                    <Eye className="h-5 w-5" />
                    <span className="font-semibold">{thread.views || 0} Views</span>
                  </div>
                </div>
                
                <ShareButton url={window.location.href} title={thread.title} />
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg">
            <div className="p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Replies ({comments.length})
                </h2>
              </div>

              {/* Comment Form */}
              {isAuthenticated ? (
                <div id="comment-form" className="mb-8">
                  {replyTo && (
                    <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Reply className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                            Replying to {replyTo.author?.userName || 'Unknown'}
                          </span>
                        </div>
                        <button
                          onClick={() => setReplyTo(null)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <form onSubmit={handleComment} className="space-y-4">
                    <div className="relative">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={replyTo ? `Reply to ${replyTo.author?.userName}...` : "Share your thoughts..."}
                        className="w-full px-6 py-4 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 resize-none font-medium leading-relaxed transition-all duration-200"
                        rows="4"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        <span className="font-medium">{newComment.length}</span> characters
                      </div>
                      <button
                        type="submit"
                        disabled={!newComment.trim() || isReplying}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                      >
                        {isReplying ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            Posting...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            {replyTo ? 'Post Reply' : 'Post Comment'}
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700/50 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <MessageCircle className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-2">
                        Join the Discussion
                      </h3>
                      <p className="text-blue-700 dark:text-blue-200 mb-4">
                        Sign in to reply and participate in this conversation.
                      </p>
                      <div className="flex gap-3">
                        <Link
                          to="/login"
                          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold text-sm transition-colors"
                        >
                          Sign In
                        </Link>
                        <Link
                          to="/register"
                          className="inline-flex items-center gap-2 bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700 px-4 py-2 rounded-xl font-semibold text-sm hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                        >
                          Create Account
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-6">
                {comments.length > 0 ? (
                  comments.map((comment, index) => (
                    <div key={comment.commentId} className={`${index !== comments.length - 1 ? 'border-b border-slate-200 dark:border-slate-700 pb-6' : ''}`}>
                      {/* Comment Header */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                          <span className="text-white font-bold">
                            {comment.author?.userName?.[0]?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                              {comment.author?.userName || 'Unknown User'}
                            </span>
                            {comment.author?.roleId === 1 && (
                              <div className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg text-xs font-semibold">
                                <Shield className="h-3 w-3" />
                                Admin
                              </div>
                            )}
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                              {formatTimeAgo(comment.createdAt)}
                            </span>
                          </div>
                          
                          {/* Comment Content */}
                          <div className="prose prose-lg max-w-none text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
                            <div dangerouslySetInnerHTML={{ __html: comment.content }} />
                          </div>
                          
                          {/* Comment Actions */}
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => handleCommentLike(comment.commentId)}
                              disabled={isLiking && likingItemId === comment.commentId}
                              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 ${
                                comment.isLiked
                                  ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400'
                              }`}
                            >
                              {isLiking && likingItemId === comment.commentId ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                              ) : (
                                <ThumbsUp className={`h-4 w-4 ${comment.isLiked ? 'fill-current' : ''}`} />
                              )}
                              <span>{comment.likeCount || 0}</span>
                            </button>
                            
                            {isAuthenticated && (
                              <button
                                onClick={() => setReplyToComment(comment)}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl font-semibold text-sm transition-all duration-200"
                              >
                                <Reply className="h-4 w-4" />
                                Reply
                              </button>
                            )}
                          </div>
                          
                          {/* Replies */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="mt-6 ml-8 space-y-4 border-l-2 border-slate-200 dark:border-slate-700 pl-6">
                              {comment.replies.map((reply) => (
                                <div key={reply.commentId} className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-6">
                                  <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                                      <span className="text-white font-bold text-sm">
                                        {reply.author?.userName?.[0]?.toUpperCase() || 'U'}
                                      </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-3 mb-2">
                                        <span className="font-bold text-slate-900 dark:text-slate-100">
                                          {reply.author?.userName || 'Unknown User'}
                                        </span>
                                        <span className="text-sm text-slate-500 dark:text-slate-400">
                                          {formatTimeAgo(reply.createdAt)}
                                        </span>
                                      </div>
                                      
                                      <div className="prose max-w-none text-slate-700 dark:text-slate-300 mb-3 leading-relaxed">
                                        <div dangerouslySetInnerHTML={{ __html: reply.content }} />
                                      </div>
                                      
                                      <button
                                        onClick={() => handleCommentLike(reply.commentId)}
                                        disabled={isLiking && likingItemId === reply.commentId}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                                          reply.isLiked
                                            ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                            : 'bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400'
                                        }`}
                                      >
                                        {isLiking && likingItemId === reply.commentId ? (
                                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                                        ) : (
                                          <ThumbsUp className={`h-4 w-4 ${reply.isLiked ? 'fill-current' : ''}`} />
                                        )}
                                        <span>{reply.likeCount || 0}</span>
                                      </button>
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
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <MessageCircle className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                      No replies yet
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      Be the first to reply to this discussion!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Related Threads */}
          {relatedThreads.length > 0 && (
            <div className="mt-8 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg">
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    Related Discussions
                  </h2>
                </div>
                <div className="grid gap-4">
                  {relatedThreads.map((relatedThread) => (
                    <Link
                      key={relatedThread.threadId}
                      to={`/threads/${encodeURIComponent(relatedThread.slug)}`}
                      className="block p-6 border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:border-blue-200 dark:hover:border-blue-700/50 transition-all duration-200 group"
                    >
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-2 line-clamp-2 text-lg">
                        {relatedThread.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                        <span className="font-medium">by {relatedThread.author?.userName || 'Unknown'}</span>
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
      </div>
    </>
  );
};

export default ThreadDetail;