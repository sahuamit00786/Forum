import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchHomePageData, clearCache } from '../store/slices/homeSlice';
import { DefaultSEO } from '../components/SEO';
import ThreadCard from '../components/ThreadCard';
import Sidebar from '../components/Layout/Sidebar';
import { 
  MessageSquare, 
  FileText, 
  BookOpen, 
  Users, 
  TrendingUp,
  Eye,
  Heart,
  MessageCircle,
  ChevronRight,
  Star,
  RefreshCw,
  Clock,
  Anchor,
  Compass,
  Waves,
  Ship,
  Activity,
  BarChart3,
  Plus,
  ArrowRight,
  Zap,
  Award,
  Globe
} from 'lucide-react';

const Home = () => {
  const dispatch = useDispatch();
  const { 
    threads, 
    blogs, 
    articles, 
    categories, 
    threadFroms,
    userLikes,
    pagination,
    loading,
    dataLoaded,
    lastFetchTime
  } = useSelector((state) => state.home);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [currentPage, setCurrentPage] = useState(1);

  // Smart data loading with caching
  useEffect(() => {
    const shouldFetchData = () => {
      if (!dataLoaded) {
        return true;
      }
      
      if (pagination.currentPage !== currentPage) {
        return true;
      }
      
      return false;
    };

    if (shouldFetchData()) {
      dispatch(fetchHomePageData({ page: currentPage, limit: 20 }));
    }
  }, [dispatch, currentPage, dataLoaded, pagination.currentPage, lastFetchTime]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  // Helper to create short, clean excerpts
  const getPlainText = (value) => {
    if (!value) return '';
    return String(value)
      .replace(/<[^>]+>/g, ' ')
      .replace(/[#$*_`>\-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Group threads by category for display
  const threadsByCategory = categories.threads.map(category => {
    const categoryThreads = threads.filter(thread => thread.categoryId === category.categoryId);
    const totalViews = categoryThreads.reduce((sum, thread) => sum + (thread.views || 0), 0);
    const totalReplies = categoryThreads.reduce((sum, thread) => sum + (thread.replies || 0), 0);
    const totalLikes = categoryThreads.reduce((sum, thread) => sum + (thread.likes || 0), 0);
    
    return {
      ...category,
      threads: categoryThreads,
      threadCount: categoryThreads.length,
      totalViews,
      totalReplies,
      totalLikes
    };
  });

  const featuredCategories = [
    {
      name: 'Boat Maintenance',
      description: 'Tips, guides, and discussions about keeping your vessel in top condition',
      icon: '🔧',
      threads: 234,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-700/50'
    },
    {
      name: 'Navigation & Safety',
      description: 'Essential knowledge for safe and confident boating',
      icon: '🧭',
      threads: 189,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      borderColor: 'border-emerald-200 dark:border-emerald-700/50'
    },
    {
      name: 'Fishing & Angling',
      description: 'Share your catches, techniques, and fishing adventures',
      icon: '🎣',
      threads: 156,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      borderColor: 'border-amber-200 dark:border-amber-700/50'
    },
    {
      name: 'Yacht Racing',
      description: 'Competitive sailing, racing techniques, and regatta discussions',
      icon: '⛵',
      threads: 143,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-700/50'
    }
  ];

  return (
    <>
      <DefaultSEO
        title="Mariners Forum"
        description="Join the premier marine community. Discover expert insights, connect with fellow boaters, and explore the latest in marine technology and techniques."
        canonicalUrl="/"
        keywords={['boating', 'marine', 'fishing', 'boats', 'boating forum', 'marine products', 'boating community']}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto flex gap-8">
          {/* Sidebar */}
          <Sidebar />
          
          {/* Main Content */}
          <main className="flex-1 min-w-0 py-8 px-4 lg:px-6">
            {/* Hero Section */}
            <div className="mb-12">
              <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-3xl p-8 lg:p-12 shadow-2xl">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20zm20 0c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundSize: '30px 30px'
                  }}></div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute top-8 right-8 opacity-20">
                  <Anchor className="h-16 w-16 text-white animate-float" />
                </div>
                <div className="absolute bottom-8 left-8 opacity-15">
                  <Waves className="h-12 w-12 text-white animate-float" style={{ animationDelay: '1s' }} />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <Ship className="h-6 w-6 text-white" />
                    </div>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-white/90 text-sm font-medium">Live Community</span>
                  </div>
                  
                  <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                    Welcome to
                    <span className="block bg-gradient-to-r from-blue-200 to-white bg-clip-text text-transparent">
                      Mariners Forum
                    </span>
                  </h1>
                  
                  <p className="text-xl text-blue-100 mb-8 max-w-2xl leading-relaxed">
                    Connect with passionate boaters, share experiences, and discover expert insights in our thriving marine community.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    {isAuthenticated ? (
                      <Link
                        to="/threads/create"
                        className="inline-flex items-center gap-3 bg-white hover:bg-blue-50 text-blue-700 px-6 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                      >
                        <Plus className="h-5 w-5" />
                        Start a Discussion
                      </Link>
                    ) : (
                      <Link
                        to="/register"
                        className="inline-flex items-center gap-3 bg-white hover:bg-blue-50 text-blue-700 px-6 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                      >
                        <Users className="h-5 w-5" />
                        Join Community
                      </Link>
                    )}
                    
                    <Link
                      to="/threads"
                      className="inline-flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20 px-6 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105"
                    >
                      <MessageSquare className="h-5 w-5" />
                      Browse Discussions
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Categories */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                    Popular Categories
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    Explore our most active discussion topics
                  </p>
                </div>
                <Link
                  to="/threads"
                  className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold text-sm transition-colors"
                >
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featuredCategories.map((category, index) => (
                  <Link
                    key={index}
                    to={`/category/${category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                    className={`group relative overflow-hidden ${category.bgColor} ${category.borderColor} border rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center text-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                          {category.icon}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {category.name}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            {category.threads} active discussions
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-all duration-300 group-hover:translate-x-1" />
                    </div>
                    
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {category.description}
                    </p>
                    
                    {/* Subtle gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white/5 dark:to-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Discussions */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      Recent Discussions
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400">
                      Latest conversations from our community
                    </p>
                  </div>
                </div>
                <Link 
                  to="/threads" 
                  className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200"
                >
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              
              <div className="space-y-6">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center gap-3 text-slate-600 dark:text-slate-400">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-slate-300 border-t-blue-600"></div>
                      <span className="font-medium">Loading discussions...</span>
                    </div>
                  </div>
                ) : threads.length > 0 ? (
                  threads.slice(0, 6).map((thread) => (
                    <ThreadCard 
                      key={thread.threadId} 
                      thread={thread} 
                      isLiked={userLikes.threads?.includes(thread.threadId)}
                    />
                  ))
                ) : (
                  <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">No discussions yet</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">Be the first to start a conversation!</p>
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
            </div>

            {/* Community Highlights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
              {/* Latest Blogs */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Latest Blogs</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Expert insights & tips</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {blogs.slice(0, 3).map((blog) => (
                    <Link
                      key={blog.blogId}
                      to={`/blogs/${encodeURIComponent(blog.slug)}`}
                      className="block group"
                    >
                      <div className="flex gap-3">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-xl overflow-hidden flex-shrink-0">
                          {blog.image ? (
                            <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                              <FileText className="h-5 w-5 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2 text-sm mb-1 transition-colors">
                            {blog.title}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {blog.author?.userName} • {formatDate(blog.createdAt)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                
                <Link
                  to="/blogs"
                  className="flex items-center justify-center gap-2 mt-6 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold text-sm transition-colors"
                >
                  View All Blogs
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Latest Articles */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Expert Articles</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">In-depth guides</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {articles.slice(0, 3).map((article) => (
                    <Link
                      key={article.articleId}
                      to={`/articles/${encodeURIComponent(article.slug)}`}
                      className="block group"
                    >
                      <div className="flex gap-3">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-xl overflow-hidden flex-shrink-0">
                          {article.image ? (
                            <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                              <BookOpen className="h-5 w-5 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2 text-sm mb-1 transition-colors">
                            {article.title}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {article.author?.userName} • {formatDate(article.createdAt)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                
                <Link
                  to="/articles"
                  className="flex items-center justify-center gap-2 mt-6 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold text-sm transition-colors"
                >
                  View All Articles
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Community Stats */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Community</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Live statistics</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                        <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Online</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-lg font-bold text-slate-900 dark:text-slate-100">247</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Discussions</span>
                    </div>
                    <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {threadsByCategory.reduce((sum, cat) => sum + (cat.threadCount || 0), 0).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <Heart className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Total Posts</span>
                    </div>
                    <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {threadsByCategory.reduce((sum, cat) => sum + (cat.totalReplies || 0), 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            {!isAuthenticated && (
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-700 rounded-3xl p-8 lg:p-12 text-center">
                <div className="max-w-2xl mx-auto">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                    <Anchor className="h-8 w-8 text-white" />
                  </div>
                  
                  <h2 className="text-3xl font-bold text-white mb-4">
                    Ready to Join Our Community?
                  </h2>
                  
                  <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                    Connect with thousands of passionate boaters, share your experiences, and learn from marine experts worldwide.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                      to="/register"
                      className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                    >
                      <Users className="h-5 w-5" />
                      Join Free Today
                    </Link>
                    
                    <Link
                      to="/threads"
                      className="inline-flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105"
                    >
                      <Globe className="h-5 w-5" />
                      Explore Forum
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
};

export default Home;