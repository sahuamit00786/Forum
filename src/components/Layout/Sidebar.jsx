import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  MessageSquare, 
  FileText, 
  BookOpen, 
  Users, 
  Ship,
  Star,
  TrendingUp,
  Calendar,
  Eye,
  Heart,
  Activity,
  Compass,
  Anchor
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const { categories } = useSelector((state) => state.forum);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const isActive = (path) => location.pathname === path;

  const sidebarItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Discussions', path: '/threads', icon: MessageSquare },
    { name: 'Blogs', path: '/blogs', icon: FileText },
    { name: 'Articles', path: '/articles', icon: BookOpen },
    { name: 'Products', path: '/marine-products', icon: Ship },
  ];

  if (isAuthenticated && user?.roleId === 1) {
    sidebarItems.push({ name: 'Members', path: '/members', icon: Users });
  }

  const popularTags = [
    { name: 'Boat Maintenance', count: 234, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
    { name: 'Fishing Tips', count: 189, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
    { name: 'Navigation', count: 156, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
    { name: 'Safety', count: 143, color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
    { name: 'Electronics', count: 98, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
    { name: 'Weather', count: 87, color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300' }
  ];

  const trendingDiscussions = [
    { title: 'Best anchor for rocky seabed?', replies: 23, author: 'SeaCaptain', time: '2h ago' },
    { title: 'Winter boat storage tips', replies: 18, author: 'BoatMaster', time: '4h ago' },
    { title: 'GPS vs Chart Plotter comparison', replies: 31, author: 'Navigator', time: '6h ago' },
    { title: 'Diesel engine maintenance schedule', replies: 15, author: 'EnginePro', time: '8h ago' }
  ];

  return (
    <aside className="hidden xl:block w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 min-h-screen">
      <div className="p-6 space-y-8">
        {/* Quick Navigation */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-4">
            Navigation
          </h3>
          <nav className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 group ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-700 dark:text-blue-300 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className={`p-2 rounded-lg transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Popular Tags */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Popular Topics
          </h3>
          <div className="space-y-2">
            {popularTags.map((tag) => (
              <Link
                key={tag.name}
                to={`/search?q=${encodeURIComponent(tag.name)}`}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${tag.color.split(' ')[0]}`}></div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {tag.name}
                  </span>
                </div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                  {tag.count}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Trending Discussions */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Trending Now
            </h3>
          </div>
          <div className="space-y-3">
            {trendingDiscussions.map((discussion, index) => (
              <Link
                key={index}
                to={`/threads/${discussion.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                className="block p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-800/80 rounded-xl hover:shadow-md transition-all duration-200 group border border-slate-200/50 dark:border-slate-700/50"
              >
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2 mb-2">
                  {discussion.title}
                </h4>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{discussion.author}</span>
                    <span>•</span>
                    <span>{discussion.time}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    <span className="font-semibold">{discussion.replies}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Community Stats */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-700/50">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-bold text-blue-900 dark:text-blue-100 uppercase tracking-wider">
              Community Stats
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                  <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Online Now</span>
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-slate-100">247</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Discussions</span>
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-slate-100">1,284</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Heart className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Total Posts</span>
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-slate-100">8,429</span>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Quick Links
          </h3>
          <div className="space-y-2">
            <Link
              to="/marine-products"
              className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-xl hover:shadow-md transition-all duration-200 group border border-amber-200/50 dark:border-amber-700/50"
            >
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                <Ship className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">Marine Store</p>
                <p className="text-xs text-amber-700 dark:text-amber-300">Browse products</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;