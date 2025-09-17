import React from 'react';
import { useSelector } from 'react-redux';
import { 
  Users, 
  FileText, 
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Download
} from 'lucide-react';

const DashboardView = ({ onGenerateSitemap, onDownloadSitemap, sitemapLoading }) => {
  const { analytics, analyticsLoading, analyticsError } = useSelector((state) => state.admin);

  // Debug logging
  console.log('DashboardView: Analytics data:', analytics);
  console.log('DashboardView: Analytics loading:', analyticsLoading);
  console.log('DashboardView: Analytics error:', analyticsError);

  if (analyticsError) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-red-800 dark:text-red-200">{analyticsError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-3">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-dark-800 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-dark-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Online Users</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {analyticsLoading ? '...' : (analytics?.onlineUsers || 0)}
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-dark-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Users</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {analyticsLoading ? '...' : (analytics?.totalUsers || 0)}
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-dark-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Monthly Registrations</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {analyticsLoading ? '...' : (analytics?.monthlyRegistrations || 0)}
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-dark-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Content</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {analyticsLoading ? '...' : (analytics?.totalContent || 0)}
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-dark-800 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-dark-700">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Content Overview</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Threads</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {analyticsLoading ? '...' : (analytics?.totalThreads || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Blogs</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {analyticsLoading ? '...' : (analytics?.totalBlogs || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Articles</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {analyticsLoading ? '...' : (analytics?.totalArticles || 0)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 p-6 rounded-lg border border-gray-200 dark:border-dark-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Engagement</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total Views</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {analyticsLoading ? '...' : (analytics?.totalViews || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total Likes</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {analyticsLoading ? '...' : (analytics?.totalLikes || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Avg. Engagement</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {analyticsLoading ? '...' : `${analytics?.avgEngagement || '0.0'}%`}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 p-6 rounded-lg border border-gray-200 dark:border-dark-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button 
              onClick={onGenerateSitemap}
              disabled={sitemapLoading}
              className="w-full text-left p-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded disabled:opacity-50"
            >
              {sitemapLoading ? 'Generating...' : 'Generate Sitemap'}
            </button>
            <button 
              onClick={onDownloadSitemap}
              className="w-full text-left p-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded"
            >
              Download Sitemap
            </button>
            <button className="w-full text-left p-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded">
              Export Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
