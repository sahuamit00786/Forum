import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toggleLike } from '../store/slices/likesSlice';
import { 
  Pin, 
  Eye, 
  Heart, 
  MessageCircle,
  Clock,
  TrendingUp,
  User,
  ChevronRight
} from 'lucide-react';

const ThreadCard = ({ thread, isLiked: initialIsLiked, className = '' }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  // Use data from comprehensive API response
  const isLiked = initialIsLiked || false;
  const likeCount = thread.likes || 0;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return `${Math.floor(diffDays / 30)}mo ago`;
  };

  // Handle like toggle
  const handleLike = async (e) => {
    e.preventDefault(); // Prevent navigation when clicking like button
    
    if (!isAuthenticated) {
      alert('Please log in to like this content');
      return;
    }

    try {
      await dispatch(toggleLike({ entityType: 'thread', entityId: thread.threadId })).unwrap();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  return (
    <div className={`group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-700/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5 ${className}`}>
      <div className="p-6">
        <div className="flex items-start gap-4">
          {/* Author Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
              <span className="text-white font-bold text-sm">
                {thread.author?.userName?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            {thread.isPinned && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center shadow-md">
                <Pin className="h-3 w-3 text-white fill-current" />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800"></div>
          </div>

          {/* Thread Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <Link
                  to={`/threads/${encodeURIComponent(thread.slug)}`}
                  className="block group/link"
                >
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover/link:text-blue-600 dark:group-hover/link:text-blue-400 line-clamp-2 mb-2 transition-colors duration-200 leading-tight">
                    {thread.title}
                  </h3>
                </Link>
                
                {thread.description && (
                  <div 
                    className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: thread.description }}
                  />
                )}
              </div>
              
              {thread.category && (
                <span className="flex-shrink-0 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-semibold border border-blue-200 dark:border-blue-700/50">
                  {thread.category.name}
                </span>
              )}
            </div>

            {/* Meta Information */}
            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                  <User className="h-3 w-3 text-slate-600 dark:text-slate-400" />
                </div>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {thread.author?.userName || 'Unknown'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{formatDate(thread.createdAt)}</span>
              </div>
              {thread.updatedAt !== thread.createdAt && (
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  <span>Updated {formatDate(thread.updatedAt)}</span>
                </div>
              )}
            </div>

            {/* Stats and Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                    <Eye className="h-4 w-4" />
                  </div>
                  <div className="text-sm">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{thread.views || 0}</span>
                    <span className="hidden sm:inline ml-1">views</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                    <MessageCircle className="h-4 w-4" />
                  </div>
                  <div className="text-sm">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{thread.replies || 0}</span>
                    <span className="hidden sm:inline ml-1">replies</span>
                  </div>
                </div>
                
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 transition-all duration-200 hover:scale-105 ${
                    isLiked
                      ? 'text-red-500'
                      : 'text-slate-600 dark:text-slate-400 hover:text-red-500'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    isLiked 
                      ? 'bg-red-100 dark:bg-red-900/30' 
                      : 'bg-slate-100 dark:bg-slate-700 hover:bg-red-100 dark:hover:bg-red-900/30'
                  }`}>
                    <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                  </div>
                  <div className="text-sm">
                    <span className="font-bold">{likeCount}</span>
                    <span className="hidden sm:inline ml-1">likes</span>
                  </div>
                </button>
              </div>
              
              <Link
                to={`/threads/${encodeURIComponent(thread.slug)}`}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium text-sm shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 opacity-0 group-hover:opacity-100"
              >
                Read More
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreadCard;