import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchHomePageData, clearCache } from '../store/slices/homeSlice';
import { DefaultSEO } from '../components/SEO';
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
  ArrowRight
} from 'lucide-react';
import AdBanner from '../components/Common/AdBanner';
import BoatAdCard from '../components/Common/BoatAdCard';
import Pagination from '../components/Pagination';

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
  const [currentPage, setCurrentPage] = useState(1);

  // Smart data loading with caching
  useEffect(() => {
    const shouldFetchData = () => {
      console.log('Home: Checking if should fetch data...', {
        dataLoaded,
        currentPage,
        paginationCurrentPage: pagination.currentPage,
        lastFetchTime
      });
      
      // Always fetch on initial load (when dataLoaded is false)
      if (!dataLoaded) {
        console.log('Home: No data loaded, fetching...');
        return true;
      }
      
      // If page changed, fetch new data
      if (pagination.currentPage !== currentPage) {
        console.log('Home: Page changed, fetching new data...');
        return true;
      }
      
      // For now, let's always fetch to debug the issue
      console.log('Home: Force fetching for debugging...');
      return true;
    };

    if (shouldFetchData()) {
      console.log('Home: Dispatching fetchHomePageData...');
      dispatch(fetchHomePageData({ page: currentPage, limit: 20 }));
    }
  }, [dispatch, currentPage, dataLoaded, pagination.currentPage, lastFetchTime]);

  // Force refresh function (can be called manually if needed)
  const handleRefresh = () => {
    console.log('Home: Force refreshing data...');
    dispatch(fetchHomePageData({ page: currentPage, limit: 20, forceRefresh: true }));
  };

  // Clear cache function
  const handleClearCache = () => {
    console.log('Home: Clearing cache...');
    dispatch(clearCache());
    // This will trigger a fresh fetch on next render
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

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

  return (
    <>
      <DefaultSEO
        title="Mariners Forum"
        description="Join the boating community. Discover marine products, expert articles, and connect with fellow boaters. Find the latest threads, blogs, and articles about boating and marine life."
        canonicalUrl="/"
        keywords={['boating', 'marine', 'fishing', 'boats', 'boating forum', 'marine products', 'boating community']}
      />
      
      <div className="max-w-6xl mx-auto px-4 py-4">
        {/* Breadcrumb */}
        <div className="mb-4">
          <nav className="text-sm text-navy-600 dark:text-navy-400">
            <span>Home</span>
          </nav>
        </div>

        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-navy-900 dark:text-navy-50 mb-2">Mariners Forum</h1>
          <div className="flex items-center space-x-4 text-sm">
            <Link to="/threads/new" className="text-ocean-600 hover:text-ocean-700">New posts</Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* General Section */}
            <div>
              <h2 className="text-lg font-semibold text-navy-900 dark:text-navy-50 mb-4">General</h2>
              
              <div className="bg-white dark:bg-navy-800 rounded border border-navy-200 dark:border-navy-700">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="loading-spinner h-6 w-6 mx-auto"></div>
                    <p className="mt-3 text-muted">Loading categories...</p>
                  </div>
                ) : threadsByCategory.length > 0 ? (
                  <div className="divide-y divide-navy-200 dark:divide-navy-700">
                    {threadsByCategory.slice(0, 6).map((category) => {
                      const latestThread = category.threads && category.threads.length > 0 
                        ? [...category.threads].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
                        : null;
                      
                      return (
                        <div key={category.categoryId} className="p-4 hover:bg-navy-50 dark:hover:bg-navy-700/50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3 flex-1">
                              <div className="w-10 h-10 bg-ocean-100 dark:bg-ocean-900 rounded flex items-center justify-center flex-shrink-0">
                                <MessageSquare className="h-5 w-5 text-ocean-600 dark:text-ocean-400" />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <Link
                                  to={`/category/${category.slug}`}
                                  className="block group"
                                >
                                  <h3 className="font-semibold text-navy-900 dark:text-navy-50 group-hover:text-ocean-600 dark:group-hover:text-ocean-400 mb-1">
                                    {category.name}
                                  </h3>
                                </Link>
                                
                                <div 
                                  className="text-sm text-muted line-clamp-2 mb-2"
                                  dangerouslySetInnerHTML={{ __html: category.description || 'Share practical, hands-on information.' }}
                                />
                                
                                {latestThread && (
                                  <div className="text-xs text-muted">
                                    <Link 
                                      to={`/threads/${latestThread.slug}`}
                                      className="hover:text-ocean-600 dark:hover:text-ocean-400"
                                    >
                                      {latestThread.title}
                                    </Link>
                                    <span className="mx-1">•</span>
                                    <span>{formatDate(latestThread.createdAt)}</span>
                                    <span className="mx-1">•</span>
                                    <span>{latestThread.author?.userName || 'Unknown'}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-right text-sm">
                              <div className="text-navy-900 dark:text-navy-50 font-semibold">
                                Threads
                              </div>
                              <div className="text-navy-900 dark:text-navy-50 font-bold text-lg">
                                {(category.threadCount || 0).toLocaleString()}
                              </div>
                              <div className="text-muted text-xs mt-1">
                                Messages
                              </div>
                              <div className="text-navy-900 dark:text-navy-50 font-semibold">
                                {(category.totalReplies || 0).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-navy-300 dark:text-navy-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-navy-900 dark:text-navy-50 mb-2">No categories found</h3>
                    <p className="text-muted">No discussion categories are available at the moment.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Forum Member Events Section */}
            <div>
              <h2 className="text-lg font-semibold text-navy-900 dark:text-navy-50 mb-4">Forum Member Events</h2>
              <p className="text-sm text-muted mb-4">A place for forums used to organize forum member meets</p>
              
              <div className="bg-white dark:bg-navy-800 rounded border border-navy-200 dark:border-navy-700">
                <div className="divide-y divide-navy-200 dark:divide-navy-700">
                  <div className="p-4 hover:bg-navy-50 dark:hover:bg-navy-700/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="w-10 h-10 bg-seafoam-100 dark:bg-seafoam-900 rounded flex items-center justify-center flex-shrink-0">
                          <Ship className="h-5 w-5 text-seafoam-600 dark:text-seafoam-400" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <Link to="/events/sailing-challenge" className="block group">
                            <h3 className="font-semibold text-navy-900 dark:text-navy-50 group-hover:text-ocean-600 dark:group-hover:text-ocean-400 mb-1">
                              Sailing Challenge
                            </h3>
                          </Link>
                          
                          <div className="text-sm text-muted line-clamp-2 mb-2">
                            For self-sufficient sailors who love crossing large oceans in small boats, on a low budget, and usually single-handed
                          </div>
                          
                          <div className="text-xs text-muted">
                            <Link to="/events/sailing-challenge/latest" className="hover:text-ocean-600 dark:hover:text-ocean-400">
                              Ocean Crossing Tips
                            </Link>
                            <span className="mx-1">•</span>
                            <span>2 days ago</span>
                            <span className="mx-1">•</span>
                            <span>SailingPro</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right text-sm">
                        <div className="text-navy-900 dark:text-navy-50 font-semibold">
                          Threads
                        </div>
                        <div className="text-navy-900 dark:text-navy-50 font-bold text-lg">
                          42
                        </div>
                        <div className="text-muted text-xs mt-1">
                          Messages
                        </div>
                        <div className="text-navy-900 dark:text-navy-50 font-semibold">
                          234
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 hover:bg-navy-50 dark:hover:bg-navy-700/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="w-10 h-10 bg-gold-100 dark:bg-gold-900 rounded flex items-center justify-center flex-shrink-0">
                          <Users className="h-5 w-5 text-gold-600 dark:text-gold-400" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <Link to="/events/crewing" className="block group">
                            <h3 className="font-semibold text-navy-900 dark:text-navy-50 group-hover:text-ocean-600 dark:group-hover:text-ocean-400 mb-1">
                              Crewing Opportunities
                            </h3>
                          </Link>
                          
                          <div className="text-sm text-muted line-clamp-2 mb-2">
                            Non-commercial listings for Crew/Boat-owners Power or Sail to help those looking for crews, or people looking for boating opportunities
                          </div>
                          
                          <div className="text-xs text-muted">
                            <Link to="/events/crewing/latest" className="hover:text-ocean-600 dark:hover:text-ocean-400">
                              Sailing companion Essex coast sought
                            </Link>
                            <span className="mx-1">•</span>
                            <span>1 hour ago</span>
                            <span className="mx-1">•</span>
                            <span>MarinerCrew</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right text-sm">
                        <div className="text-navy-900 dark:text-navy-50 font-semibold">
                          Threads
                        </div>
                        <div className="text-navy-900 dark:text-navy-50 font-bold text-lg">
                          128
                        </div>
                        <div className="text-muted text-xs mt-1">
                          Messages
                        </div>
                        <div className="text-navy-900 dark:text-navy-50 font-semibold">
                          356
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Discussions */}
            <div className="card">
              <div className="p-6 border-b border-navy-200 dark:border-navy-700">
                <div className="flex items-center justify-between">
                  <h2 className="heading-3 flex items-center gap-3">
                    <Activity className="h-5 w-5 text-seafoam-600" />
                    Recent Discussions
                  </h2>
                  <Link 
                    to="/threads" 
                    className="text-ocean-600 hover:text-ocean-700 dark:text-ocean-400 dark:hover:text-ocean-300 font-medium flex items-center gap-1"
                  >
                    View All
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
              
              <div className="p-6">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="loading-spinner h-6 w-6 mx-auto"></div>
                    <p className="mt-3 text-muted">Loading discussions...</p>
                  </div>
                ) : threads.length > 0 ? (
                  <div className="space-y-6">
                    {threads.slice(0, 5).map((thread) => (
                      <div key={thread.threadId} className="thread-card">
                        <Link
                          to={`/threads/${encodeURIComponent(thread.slug)}`}
                          className="block group"
                        >
                          <h3 className="text-lg font-semibold text-navy-900 dark:text-navy-50 group-hover:text-ocean-600 dark:group-hover:text-ocean-400 mb-2 line-clamp-2">
                            {thread.title}
                          </h3>
                          
                          <div className="thread-meta mb-3">
                            <span>by <strong>{thread.author?.userName || 'Unknown'}</strong></span>
                            <span>•</span>
                            <span>{formatDate(thread.createdAt)}</span>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="stat-item">
                              <Eye className="h-4 w-4" />
                              <span>{thread.views || 0}</span>
                            </div>
                            <div className="stat-item">
                              <MessageCircle className="h-4 w-4" />
                              <span>{thread.replies || 0}</span>
                            </div>
                            <div className="stat-item">
                              <Heart className="h-4 w-4" />
                              <span>{thread.likes || 0}</span>
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-navy-300 dark:text-navy-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-navy-900 dark:text-navy-50 mb-2">No discussions yet</h3>
                    <p className="text-muted">Be the first to start a conversation!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - exactly like YBW */}
          <div className="space-y-6">
            {/* Members Online */}
            <div className="bg-white dark:bg-navy-800 rounded border border-navy-200 dark:border-navy-700">
              <div className="p-4 border-b border-navy-200 dark:border-navy-700">
                <h3 className="font-semibold text-navy-900 dark:text-navy-50">Members online</h3>
              </div>
              <div className="p-4">
                <div className="text-sm space-y-1">
                  <div className="flex flex-wrap gap-x-2 gap-y-1 text-ocean-600 dark:text-ocean-400">
                    <Link to="/members/sailorjoe" className="hover:underline">sailorjoe</Link>
                    <span className="text-navy-400">•</span>
                    <Link to="/members/marinepro" className="hover:underline">marinepro</Link>
                    <span className="text-navy-400">•</span>
                    <Link to="/members/boatlover" className="hover:underline">boatlover</Link>
                    <span className="text-navy-400">•</span>
                    <Link to="/members/fishingguru" className="hover:underline">fishingguru</Link>
                    <span className="text-navy-400">•</span>
                    <Link to="/members/oceanrider" className="hover:underline">oceanrider</Link>
                    <span className="text-navy-400">•</span>
                    <Link to="/members/captainmark" className="hover:underline">captainmark</Link>
                    <span className="text-navy-400">•</span>
                    <Link to="/members/windseeker" className="hover:underline">windseeker</Link>
                    <span className="text-navy-400">•</span>
                    <Link to="/members/tidalhunter" className="hover:underline">tidalhunter</Link>
                    <span className="text-navy-400">•</span>
                    <Link to="/members/deepwater" className="hover:underline">deepwater</Link>
                    <span className="text-navy-400">•</span>
                    <span className="text-navy-500">... and 15 more.</span>
                  </div>
                  <div className="pt-2 text-xs text-muted">
                    Total: <strong>5,132</strong> (members: 55, guests: 5,077)
                  </div>
                </div>
              </div>
            </div>

            {/* Latest Posts */}
            <div className="bg-white dark:bg-navy-800 rounded border border-navy-200 dark:border-navy-700">
              <div className="p-4 border-b border-navy-200 dark:border-navy-700">
                <h3 className="font-semibold text-navy-900 dark:text-navy-50">Latest posts</h3>
              </div>
              <div className="p-4">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="loading-spinner h-4 w-4 mx-auto"></div>
                    <p className="mt-2 text-xs text-muted">Loading...</p>
                  </div>
                ) : threads.length > 0 ? (
                  <div className="space-y-4 text-sm">
                    {threads.slice(0, 5).map((thread, index) => (
                      <div key={thread.threadId} className="group">
                        <div className="flex items-start gap-2">
                          <div className="w-6 h-6 bg-ocean-gradient rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-semibold">
                            {thread.author?.userName?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <Link
                              to={`/threads/${encodeURIComponent(thread.slug)}`}
                              className="text-ocean-600 dark:text-ocean-400 hover:underline font-medium line-clamp-2"
                            >
                              {thread.title}
                            </Link>
                            <div className="text-xs text-muted mt-1">
                              Latest: <span className="text-navy-700 dark:text-navy-300">{thread.author?.userName || 'Unknown'}</span>
                              <span className="mx-1">•</span>
                              <span>{formatDate(thread.createdAt)}</span>
                            </div>
                            <div className="text-xs text-muted">
                              <Link to={`/category/${thread.category?.slug || ''}`} className="hover:text-ocean-600 dark:hover:text-ocean-400">
                                {thread.category?.name || 'General Discussion'}
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <MessageSquare className="h-8 w-8 text-navy-300 dark:text-navy-600 mx-auto mb-2" />
                    <p className="text-xs text-muted">No recent posts</p>
                  </div>
                )}
              </div>
            </div>

            {/* Forum Statistics */}
            <div className="bg-white dark:bg-navy-800 rounded border border-navy-200 dark:border-navy-700">
              <div className="p-4 border-b border-navy-200 dark:border-navy-700">
                <h3 className="font-semibold text-navy-900 dark:text-navy-50">Forum statistics</h3>
              </div>
              <div className="p-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Threads</span>
                  <span className="font-semibold text-navy-900 dark:text-navy-50">
                    {threadsByCategory.reduce((sum, cat) => sum + (cat.threadCount || 0), 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Messages</span>
                  <span className="font-semibold text-navy-900 dark:text-navy-50">
                    {threadsByCategory.reduce((sum, cat) => sum + (cat.totalReplies || 0), 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Members</span>
                  <span className="font-semibold text-navy-900 dark:text-navy-50">2,847</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Latest member</span>
                  <Link to="/members/newcomer" className="text-ocean-600 dark:text-ocean-400 hover:underline font-semibold">
                    NewComer
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;