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
  User
} from 'lucide-react';

const ThreadCard = ({ thread, isLiked: initialIsLiked }) => {
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
    <div className="thread-card group">
      <div className="flex items-start gap-4">
        {/* Author Avatar */}
        <div className="relative">
          <div className="w-12 h-12 bg-gold-gradient rounded-full flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
            <span className="text-white font-semibold text-sm">
              {thread.author?.userName?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          {thread.isPinned && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-gold-500 rounded-full flex items-center justify-center">
              <Pin className="h-3 w-3 text-white fill-current" />
            </div>
          )}
        </div>

        {/* Thread Content */}
        <div className="flex-1 min-w-0">
          {/* Title and Category */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <Link
                to={`/threads/${encodeURIComponent(thread.slug)}`}
                className="block group/link"
              >
                <h3 className="text-lg font-semibold text-navy-900 dark:text-navy-50 group-hover/link:text-ocean-600 dark:group-hover/link:text-ocean-400 line-clamp-2 mb-2 transition-colors duration-200">
                  {thread.title}
                </h3>
              </Link>
              
              {thread.description && (
                <div 
                  className="text-sm text-muted line-clamp-2 mb-3"
                  dangerouslySetInnerHTML={{ __html: thread.description }}
                />
              )}
            </div>
            
            {thread.category && (
              <span className="badge-primary flex-shrink-0">
                {thread.category.name}
              </span>
            )}
          </div>

          {/* Meta Information */}
          <div className="flex items-center gap-4 text-sm text-muted mb-4">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span className="font-medium text-navy-700 dark:text-navy-300">
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
              <div className="stat-item">
                <Eye className="h-4 w-4" />
                <span className="font-medium">{thread.views || 0}</span>
                <span className="hidden sm:inline">views</span>
              </div>
              
              <div className="stat-item">
                <MessageCircle className="h-4 w-4" />
                <span className="font-medium">{thread.replies || 0}</span>
                <span className="hidden sm:inline">replies</span>
              </div>
              
              <button
                onClick={handleLike}
                className={`stat-item hover:text-coral-500 transition-colors duration-200 ${
                  isLiked
                    ? 'text-coral-500'
                    : ''
                }`}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                <span className="font-medium">{likeCount}</span>
                <span className="hidden sm:inline">likes</span>
              </button>
            </div>
            
            <Link
              to={`/threads/${encodeURIComponent(thread.slug)}`}
              className="btn-primary text-sm px-4 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              Read More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreadCard;
