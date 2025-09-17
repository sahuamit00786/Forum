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
  Calendar
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const { categories } = useSelector((state) => state.forum);

  const isActive = (path) => location.pathname === path;

  const sidebarItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Recent Threads', path: '/threads', icon: MessageSquare },
    { name: 'Popular Blogs', path: '/blogs', icon: FileText },
    { name: 'Latest Articles', path: '/articles', icon: BookOpen },
    { name: 'Marine Products', path: '/marine-products', icon: Ship },
    { name: 'Members', path: '/members', icon: Users },
  ];

  const popularTags = [
    'Boating Tips',
    'Fishing Gear', 
    'Boat Maintenance',
    'Safety',
    'Navigation',
    'Marine Electronics'
  ];

  return (
    <aside className="hidden lg:block w-64 bg-white dark:bg-dark-800 border-r border-gray-200 dark:border-dark-700 min-h-screen">
      <div className="p-4 space-y-6">
        {/* Navigation */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            Navigation
          </h3>
          <nav className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`sidebar-item ${isActive(item.path) ? 'active' : ''}`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Categories */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            Categories
          </h3>
          <nav className="space-y-1">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/category/${category.slug}`}
                className="sidebar-item"
              >
                <div className="w-2 h-2 rounded-full bg-primary-600"></div>
                {category.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Popular Tags */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            Popular Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {popularTags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-dark-600 cursor-pointer transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Community Stats
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-green-500" />
                <span className="text-gray-600 dark:text-gray-400">Online</span>
              </div>
              <span className="font-medium text-gray-900 dark:text-white">247</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-blue-500" />
                <span className="text-gray-600 dark:text-gray-400">Threads</span>
              </div>
              <span className="font-medium text-gray-900 dark:text-white">1,284</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-500" />
                <span className="text-gray-600 dark:text-gray-400">Posts</span>
              </div>
              <span className="font-medium text-gray-900 dark:text-white">8,429</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;