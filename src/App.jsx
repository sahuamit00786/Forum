import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setTheme } from './store/slices/themeSlice';
import { initializeAuth } from './store/slices/authSlice';
import { fetchThreadCategories } from './store/slices/forumSlice';
import { fetchBlogCategories } from './store/slices/blogSlice';
import { fetchArticleCategories } from './store/slices/articleSlice';
import { clearViewedEntities } from './store/slices/likesSlice';
import Header from './components/Layout/Header';
import Home from './pages/Home';
import Threads from './pages/Threads';
import Blogs from './pages/Blogs';
import Articles from './pages/Articles';
import Members from './pages/Members';
import MarineProducts from './pages/MarineProducts';
import Profile from './pages/Profile';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import AdminPanel from './pages/Admin/AdminPanel';
import ThreadDetail from './pages/ThreadDetail';
import ThreadCreate from './pages/ThreadCreate';
import BlogDetail from './pages/BlogDetail';
import ArticleDetail from './pages/ArticleDetail';
import CategoryView from './pages/CategoryView';
import SearchResults from './pages/SearchResults';
import SEOFileViewer from './components/SEO/SEOFileViewer';

function App() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isDarkMode } = useSelector((state) => state.theme);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  // Check if user is admin
  const isAdmin = isAuthenticated && user?.roleId === 1;
  
  // Check if we're in admin panel, auth pages, or SEO routes
  const isInAdminPanel = location.pathname.startsWith('/admin');
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isSEORoute = location.pathname === '/sitemap.xml' || location.pathname === '/robots.txt';

  useEffect(() => {
    // Load theme from localStorage or default to light mode
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      dispatch(setTheme(savedTheme === 'dark'));
    } else {
      dispatch(setTheme(false)); // Default to light mode for modern look
    }

    // Initialize auth from localStorage
    dispatch(initializeAuth());

    // Fetch initial data
    dispatch(fetchThreadCategories());
    dispatch(fetchBlogCategories());
    dispatch(fetchArticleCategories());

    // Clear viewed entities on app start (fresh session)
    dispatch(clearViewedEntities());
  }, [dispatch]);

  useEffect(() => {
    // Apply theme class to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [isDarkMode]);

  // Clear viewed entities when user navigates away from the app
  useEffect(() => {
    const handleBeforeUnload = () => {
      dispatch(clearViewedEntities());
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        dispatch(clearViewedEntities());
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [dispatch]);

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      isSEORoute 
        ? '' // No styling for SEO routes
        : 'bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800'
    }`}>
      {!isInAdminPanel && !isSEORoute && !isAuthPage && <Header />}
      <main className={`${!isInAdminPanel && !isSEORoute && !isAuthPage ? '' : ''} min-h-screen w-full`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/category/:categorySlug" element={<CategoryView />} />
          <Route path="/threads" element={<Threads />} />
          <Route path="/threads/create" element={<ThreadCreate />} />
          <Route path="/threads/:threadSlug" element={<ThreadDetail />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/blogs/:blogSlug" element={<BlogDetail />} />
          <Route path="/articles" element={<Articles />} />
          <Route path="/articles/:articleSlug" element={<ArticleDetail />} />
          <Route path="/members" element={<Members />} />
          <Route path="/marine-products" element={<MarineProducts />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/search" element={<SearchResults />} />
          
          {/* SEO Routes - sitemap.xml and robots.txt */}
          <Route path="/sitemap.xml" element={<SEOFileViewer />} />
          <Route path="/robots.txt" element={<SEOFileViewer />} />
          
          {isAuthenticated && user?.roleId === 1 && (
            <Route path="/admin/*" element={<AdminPanel />} />
          )}
        </Routes>
      </main>
    </div>
  );
}

export default App;