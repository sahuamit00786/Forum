import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Map,
  RefreshCw,
  Download,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { generateSitemap, fetchSitemapStats } from '../../../store/slices/adminSlice';
import { adminAPI } from '../../../utils/api';

const SitemapView = () => {
  const dispatch = useDispatch();
  const { 
    sitemapStats, 
    sitemapLoading, 
    sitemapError 
  } = useSelector((state) => state.admin);

  useEffect(() => {
    console.log('SitemapView: Fetching sitemap stats...');
    dispatch(fetchSitemapStats());
  }, [dispatch]);

  const handleGenerateSitemap = async () => {
    try {
      const result = await dispatch(generateSitemap()).unwrap();
      console.log('Sitemap generated successfully:', result);
      // Refresh stats
      dispatch(fetchSitemapStats());
    } catch (error) {
      console.error('Generate sitemap error:', error);
    }
  };

  const handleDownloadSitemap = () => {
    const baseUrl = window.location.origin;
    window.open(`${baseUrl}/api/admin/sitemap/download`, '_blank');
  };

  if (sitemapError) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-red-800 dark:text-red-200">{sitemapError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Sitemap Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Generate and manage XML sitemap for SEO</p>
        </div>
      </div>

      {/* Sitemap Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-dark-800 p-6 rounded-lg border border-gray-200 dark:border-dark-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total URLs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {sitemapLoading ? '...' : (sitemapStats?.totalUrls || 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Map className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 p-6 rounded-lg border border-gray-200 dark:border-dark-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Threads</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {sitemapLoading ? '...' : (sitemapStats?.threads || 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💬</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 p-6 rounded-lg border border-gray-200 dark:border-dark-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Blogs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {sitemapLoading ? '...' : (sitemapStats?.blogs || 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📝</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 p-6 rounded-lg border border-gray-200 dark:border-dark-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Articles</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {sitemapLoading ? '...' : (sitemapStats?.articles || 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📄</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-dark-800 p-6 rounded-lg border border-gray-200 dark:border-dark-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Category Breakdown</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Thread Categories</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {sitemapLoading ? '...' : (sitemapStats?.threadCategories || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Blog Categories</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {sitemapLoading ? '...' : (sitemapStats?.blogCategories || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Article Categories</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {sitemapLoading ? '...' : (sitemapStats?.articleCategories || 0)}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-600 dark:text-gray-400 font-medium">Total Categories</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {sitemapLoading ? '...' : (sitemapStats?.categories || 0)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 p-6 rounded-lg border border-gray-200 dark:border-dark-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Content Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Main Pages</span>
              <span className="font-medium text-gray-900 dark:text-white">8</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Content Pages</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {sitemapLoading ? '...' : ((sitemapStats?.threads || 0) + (sitemapStats?.blogs || 0) + (sitemapStats?.articles || 0))}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Category Pages</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {sitemapLoading ? '...' : (sitemapStats?.categories || 0)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 p-6 rounded-lg border border-gray-200 dark:border-dark-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Last Generated</h3>
          <div className="space-y-3">
            {sitemapStats?.lastGenerated ? (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <div className="font-medium text-gray-900 dark:text-white mb-1">
                  {new Date(sitemapStats.lastGenerated).toLocaleDateString()}
                </div>
                <div>
                  {new Date(sitemapStats.lastGenerated).toLocaleTimeString()}
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Not generated yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sitemap Actions */}
      <div className="bg-white dark:bg-dark-800 p-6 rounded-lg border border-gray-200 dark:border-dark-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sitemap Management</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleGenerateSitemap}
            disabled={sitemapLoading}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${sitemapLoading ? 'animate-spin' : ''}`} />
            {sitemapLoading ? 'Generating...' : 'Generate Sitemap'}
          </button>
          <button
            onClick={handleDownloadSitemap}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
          >
            <Download className="h-4 w-4" />
            Download XML
          </button>
        </div>
        
        {sitemapStats?.lastGenerated && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <p className="text-green-800 dark:text-green-200 text-sm">
                Last generated: {new Date(sitemapStats.lastGenerated).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Sitemap Preview */}
      <div className="bg-white dark:bg-dark-800 p-6 rounded-lg border border-gray-200 dark:border-dark-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sitemap Preview</h3>
        <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Your sitemap will include the following URL types:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Main Pages</h4>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>• Homepage (/)</li>
                <li>• Threads (/threads)</li>
                <li>• Blogs (/blogs)</li>
                <li>• Articles (/articles)</li>
                <li>• Marine Products (/marine-products)</li>
                <li>• Members (/members)</li>
                <li>• Search (/search)</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Dynamic Pages</h4>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>• Thread Categories (/category/[slug])</li>
                <li>• Blog Categories (/blog-category/[slug])</li>
                <li>• Article Categories (/article-category/[slug])</li>
                <li>• Thread Pages (/threads/[slug])</li>
                <li>• Blog Pages (/blogs/[slug])</li>
                <li>• Article Pages (/articles/[slug])</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Note:</strong> Only approved threads (adminApproved: true) are included in the sitemap for better SEO.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SitemapView;
