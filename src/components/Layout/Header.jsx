import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Bell, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Sun, 
  Moon,
  Shield,
  Anchor,
  Search,
  Plus
} from 'lucide-react';
import { logout } from '../../store/slices/authSlice';
import { toggleTheme } from '../../store/slices/themeSlice';
import SearchInput from '../SearchInput';
import NotificationDropdown from '../NotificationDropdown';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { isDarkMode } = useSelector((state) => state.theme);
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setIsProfileOpen(false);
  };

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  // Helper function to check if a menu item is active
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Navigation items
  const navItems = [
    { path: '/threads', label: 'Discussions', icon: null },
    { path: '/blogs', label: 'Blogs', icon: null },
    { path: '/articles', label: 'Articles', icon: null },
    { path: '/marine-products', label: 'Products', icon: null },
  ];

  if (isAuthenticated && user?.roleId === 1) {
    navItems.push({ path: '/members', label: 'Members', icon: null });
  }

  return (
    <header className="bg-white dark:bg-navy-900 border-b border-navy-200 dark:border-navy-700">
      <div className="max-w-6xl mx-auto px-4">
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between h-14">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2 text-xl font-bold text-ocean-600 dark:text-ocean-400">
              <Anchor className="h-6 w-6" />
              Mariners Forum
            </Link>
          </div>

          {/* Top Right Navigation */}
          <div className="flex items-center space-x-4 text-sm">
            <nav className="hidden md:flex items-center space-x-4">
              <Link to="/" className="text-navy-600 dark:text-navy-300 hover:text-ocean-600">Home</Link>
              <Link to="/threads" className="text-navy-600 dark:text-navy-300 hover:text-ocean-600">Forums</Link>
              <span className="text-navy-400">New posts</span>
              <span className="text-navy-400">Search forums</span>
              <span className="text-navy-400">What's new</span>
              <span className="text-navy-400">Featured content</span>
              <span className="text-navy-400">New posts</span>
              <span className="text-navy-400">Latest activity</span>
              <span className="text-navy-400">Members</span>
              <span className="text-navy-400">Current visitors</span>
            </nav>

            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <NotificationDropdown />
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-1 text-sm font-medium text-navy-700 dark:text-navy-300"
                  >
                    <span>{user?.userName}</span>
                  </button>
                  {isProfileOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-[55]" 
                        onClick={() => setIsProfileOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-navy-800 rounded shadow-lg border border-navy-200 dark:border-navy-700 py-1 z-[60]">
                        <Link to="/profile" className="block px-4 py-2 text-sm text-navy-700 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-700" onClick={() => setIsProfileOpen(false)}>Profile</Link>
                        {user?.roleId === 1 && (
                          <Link to="/admin" className="block px-4 py-2 text-sm text-navy-700 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-700" onClick={() => setIsProfileOpen(false)}>Admin Panel</Link>
                        )}
                        <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-navy-700 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-700">Logout</button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="text-ocean-600 dark:text-ocean-400 font-medium">Log in</Link>
                <Link to="/register" className="bg-ocean-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-ocean-700">Register</Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-1"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="py-3 border-t border-navy-100 dark:border-navy-800">
          <SearchInput placeholder="Search..." />
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-navy-100 dark:border-navy-800 py-3">
            <nav className="space-y-2">
              <Link to="/" className="block px-3 py-2 text-sm">Home</Link>
              <Link to="/threads" className="block px-3 py-2 text-sm">Forums</Link>
              <Link to="/search" className="block px-3 py-2 text-sm">Search</Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;