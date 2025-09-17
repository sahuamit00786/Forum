import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toggleLike } from '../store/slices/likesSlice';
import { 
  Eye, 
  Heart, 
  MessageCircle 
} from 'lucide-react';

const BlogCard = ({ blog, isLiked: initialIsLiked }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  // Use data from comprehensive API response
  const isLiked = initialIsLiked || false;
  const likeCount = blog.likes || 0;

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

  const calculateReadTime = (content) => {
    if (!content) return '1 min read';
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    return `${readTime} min read`;
  };

  // Handle like toggle
  const handleLike = async (e) => {
    e.preventDefault(); // Prevent navigation
    if (!isAuthenticated) {
      alert('Please log in to like this content');
      return;
    }

    try {
      await dispatch(toggleLike({ entityType: 'blog', entityId: blog.blogId })).unwrap();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  return (
    <Link to={`/blogs/${encodeURIComponent(blog.slug)}`} className="group">
      <article className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200">
        {/* Blog Image */}
        <div className="aspect-video overflow-hidden">
          <img 
            src={blog.image} 
            alt={blog.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Blog Content */}
        <div className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <span className="px-2 py-1 bg-lime-100 dark:bg-lime-900/20 text-lime-700 dark:text-lime-300 rounded-full text-xs font-medium border border-lime-200 dark:border-lime-800">
              {blog.category?.name || 'General'}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {calculateReadTime(blog.content)}
            </span>
          </div>

          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-lime-600 dark:group-hover:text-lime-300 mb-2 sm:mb-3 line-clamp-2 transition-colors duration-200">
            {blog.title}
          </h2>

          <div 
            className="text-sm text-gray-600 dark:text-gray-300 mb-3 sm:mb-4 line-clamp-3 [&>p]:mb-0 [&>p]:leading-relaxed [&>strong]:font-semibold [&>strong]:text-gray-900 dark:[&>strong]:text-gray-100 [&>ul]:list-disc [&>ul]:pl-4 [&>ul]:mb-2 [&>li]:mb-1"
            dangerouslySetInnerHTML={{ __html: blog.metaDescription }}
          />

          {/* Author and Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-lime-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-medium">{blog.author?.userName?.[0]?.toUpperCase() || 'A'}</span>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">{blog.author?.userName || 'Admin'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(blog.createdAt)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span className="hidden sm:inline">{blog.views || 0}</span>
                <span className="sm:hidden">{blog.views || 0}</span>
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                <span className="hidden sm:inline">{blog.replies || 0}</span>
                <span className="sm:hidden">{blog.replies || 0}</span>
              </span>
              <button
                onClick={handleLike}
                className={`flex items-center gap-1 transition-colors duration-200 ${
                  isLiked
                    ? 'text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300'
                    : 'hover:text-red-500 dark:hover:text-red-400'
                }`}
              >
                <Heart className={`h-3 w-3 ${isLiked ? 'fill-current' : ''}`} />
                <span className="hidden sm:inline">{likeCount}</span>
                <span className="sm:hidden">{likeCount}</span>
              </button>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default BlogCard;
