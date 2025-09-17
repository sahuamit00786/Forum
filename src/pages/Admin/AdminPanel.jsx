import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  BarChart3, 
  Users, 
  MessageSquare, 
  FileText, 
  BookOpen,
  Settings,
  Map,
  Menu,
  X,
  Clock,
  Upload
} from 'lucide-react';
import {
  fetchAdminAnalytics,
  clearErrors,
  clearDeleteError
} from '../../store/slices/adminSlice';
import CreateBlog from './CreateBlog';
import CreateArticle from './CreateArticle';
import CreateThread from './CreateThread';
import BulkUpload from './BulkUpload';
import DashboardView from './components/DashboardView';
import UsersView from './components/UsersView';
import ThreadsView from './components/ThreadsView';
import BlogsView from './components/BlogsView';
import ArticlesView from './components/ArticlesView';
import SitemapView from './components/SitemapView';
import PendingThreadsView from './components/PendingThreadsView';
import Toast from '../../components/Toast';

const AdminPanel = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { 
    analytics,
    analyticsLoading,
    analyticsError,
    sitemapStats,
    sitemapLoading,
    sitemapError,
    deleteError
  } = useSelector((state) => state.admin);
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const adminTabs = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'threads', name: 'Threads', icon: MessageSquare },
    { id: 'pending-threads', name: 'Pending Threads', icon: Clock },
    { id: 'blogs', name: 'Blogs', icon: FileText },
    { id: 'articles', name: 'Articles', icon: BookOpen },
    { id: 'bulk-upload', name: 'Bulk Upload', icon: Upload },
    { id: 'sitemap', name: 'Sitemap', icon: Map },
    { id: 'settings', name: 'Settings', icon: Settings }
  ];

  // Load initial data
  useEffect(() => {
    console.log('AdminPanel: Loading initial data...');
    dispatch(clearErrors());
    dispatch(fetchAdminAnalytics());
  }, [dispatch]);

  // Debug logging for analytics
  useEffect(() => {
    console.log('AdminPanel: Analytics data:', analytics);
    console.log('AdminPanel: Analytics loading:', analyticsLoading);
    console.log('AdminPanel: Analytics error:', analyticsError);
  }, [analytics, analyticsLoading, analyticsError]);

  // Handle sitemap generation
  const handleGenerateSitemap = async () => {
    try {
      // This will be implemented in the SitemapView component
      setToastMessage('Sitemap generated successfully');
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      setToastMessage(error || 'Failed to generate sitemap');
      setToastType('error');
      setShowToast(true);
    }
  };

  // Handle download sitemap
  const handleDownloadSitemap = () => {
    const baseUrl = window.location.origin;
    window.open(`${baseUrl}/api/admin/sitemap`, '_blank');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView 
            onGenerateSitemap={handleGenerateSitemap}
            onDownloadSitemap={handleDownloadSitemap}
            sitemapLoading={sitemapLoading}
          />
        );
      case 'users':
        return <UsersView />;
      case 'threads':
        return <ThreadsView />;
      case 'pending-threads':
        return <PendingThreadsView />;
      case 'blogs':
        return <BlogsView />;
      case 'articles':
        return <ArticlesView />;
      case 'bulk-upload':
        return <BulkUpload />;
      case 'sitemap':
        return <SitemapView />;
      case 'settings':
        return <div className="p-6">Settings coming soon...</div>;
      default:
        return (
          <DashboardView 
            onGenerateSitemap={handleGenerateSitemap}
            onDownloadSitemap={handleDownloadSitemap}
            sitemapLoading={sitemapLoading}
          />
        );
    }
  };





  return (
    <>
      <Routes>
        <Route path="/" element={
          <div className="flex h-screen bg-gray-100 dark:bg-dark-900">
            {/* Admin Mode Indicator and Go to Site Button - Fixed Top Right */}
            <div className="fixed top-2 right-2 z-30 flex items-center gap-1">
              {/* Admin Mode Badge */}
            
              
              {/* Go to Site Button */}
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-1 px-2 py-1 mr-6 mb-3 bg-[#0454cc] hover:bg-[#032a66] text-white text-xs rounded-md font-medium transition-colors shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                title="Return to main website"
              >
                {/* <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg> */}
                <span className="hidden sm:inline"> Go Back to Site → </span>
              </button>
            </div>

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-dark-800 shadow-lg transform transition-transform duration-300 ease-in-out ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } lg:translate-x-0 lg:static lg:inset-0`}>
              <div className="flex items-center justify-between h-16 px-4 sm:px-6 border-b border-gray-200 dark:border-dark-700">
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Boating Forum</p>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>
              
              <nav className="mt-6 px-2 sm:px-3">
                <div className="space-y-1">
                  {adminTabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                          activeTab === tab.id
                            ? 'bg-[#f97315] text-white'
                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-700'
                        }`}
                      >
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="truncate">{tab.name}</span>
                      </button>
                    );
                  })}
                </div>
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Mobile Header */}
              <header className="lg:hidden bg-white dark:bg-dark-800 shadow-sm border-b border-gray-200 dark:border-dark-700">
                <div className="flex items-center justify-between h-16 px-4 sm:px-6">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                  <div className="flex-1"></div>
                  <div className="flex items-center gap-2 sm:gap-4">
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      Welcome, Admin
                    </span>
                  </div>
                </div>
              </header>

              {/* Page Content */}
              <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-dark-900">
                <div className="max-w-7xl mx-auto py-4 sm:py-6 px-3 sm:px-4 lg:px-8 sm:pr-16">
                  {renderContent()}
                </div>
              </main>
            </div>

            {/* Mobile Overlay */}
            {sidebarOpen && (
              <div
                className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}
          </div>
        } />
        <Route path="/blogs/create" element={<CreateBlog />} />
        <Route path="/blogs/edit/:id" element={<CreateBlog />} />
        <Route path="/articles/create" element={<CreateArticle />} />
        <Route path="/articles/edit/:id" element={<CreateArticle />} />
        <Route path="/threads/create" element={<CreateThread />} />
        <Route path="/threads/edit/:id" element={<CreateThread />} />
      </Routes>

      {/* Toast Notifications */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}

      {deleteError && (
        <Toast
          message={deleteError}
          type="error"
          onClose={() => dispatch(clearDeleteError())}
        />
      )}
    </>
  );
};

export default AdminPanel;