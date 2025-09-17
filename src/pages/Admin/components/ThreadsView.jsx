import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Eye, 
  Edit, 
  Trash2, 
  Search, 
  Plus,
  AlertCircle,
  Check,
  X,
  Clock
} from 'lucide-react';
import { fetchThreads, deleteThread } from '../../../store/slices/adminSlice';
import { approveThread, rejectThread } from '../../../store/slices/forumSlice';
import { useNavigate } from 'react-router-dom';

const ThreadsView = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { 
    threads, 
    threadsLoading, 
    threadsError, 
    threadsPagination,
    deleteLoading 
  } = useSelector((state) => state.admin);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [approvingThreadId, setApprovingThreadId] = useState(null);
  const [rejectingThreadId, setRejectingThreadId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    console.log('ThreadsView: Fetching threads for page:', currentPage, 'search:', searchQuery);
    dispatch(fetchThreads({ page: currentPage, limit: 10, search: searchQuery }));
  }, [dispatch, currentPage, searchQuery]);

  // Clear success/error messages after 5 seconds
  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
        setErrorMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleDelete = async (thread) => {
    if (window.confirm(`Are you sure you want to delete thread "${thread.title}"?`)) {
      try {
        await dispatch(deleteThread(thread.threadId)).unwrap();
        // Refresh the current page data
        dispatch(fetchThreads({ page: currentPage, limit: 10, search: searchQuery }));
      } catch (error) {
        console.error('Delete thread error:', error);
      }
    }
  };

  const handleApprove = async (thread) => {
    setApprovingThreadId(thread.threadId);
    setSuccessMessage('');
    setErrorMessage('');
    
    try {
      await dispatch(approveThread(thread.threadId)).unwrap();
      setSuccessMessage(`Thread "${thread.title}" approved successfully!`);
      // Refresh the current page data
      dispatch(fetchThreads({ page: currentPage, limit: 10, search: searchQuery }));
    } catch (error) {
      setErrorMessage(`Failed to approve thread: ${error.message}`);
    } finally {
      setApprovingThreadId(null);
    }
  };

  const handleReject = async (thread, reason) => {
    setRejectingThreadId(thread.threadId);
    setSuccessMessage('');
    setErrorMessage('');
    
    try {
      await dispatch(rejectThread({ threadId: thread.threadId, reason })).unwrap();
      setSuccessMessage(`Thread "${thread.title}" rejected successfully!`);
      setShowRejectModal(false);
      setRejectReason('');
      setRejectingThreadId(null);
      // Refresh the current page data
      dispatch(fetchThreads({ page: currentPage, limit: 10, search: searchQuery }));
    } catch (error) {
      setErrorMessage(`Failed to reject thread: ${error.message}`);
      setRejectingThreadId(null);
    }
  };

  const openRejectModal = (thread) => {
    setRejectingThreadId(thread.threadId);
    setShowRejectModal(true);
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setRejectReason('');
    setRejectingThreadId(null);
  };

  if (threadsLoading) {
    return (
      <div className="bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700 p-6">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (threadsError) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-red-800 dark:text-red-200">{threadsError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 mt-3">
      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            <p className="text-sm sm:text-base text-green-800 dark:text-green-200">{successMessage}</p>
          </div>
        </div>
      )}
      
      {errorMessage && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
            <p className="text-sm sm:text-base text-red-800 dark:text-red-200">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Threads Management</h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Manage forum threads and discussions</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search threads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-dark-700 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm sm:text-base"
            />
          </form>
          <button 
            onClick={() => navigate('/admin/threads/create')}
            className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-[#f97315] hover:bg-[#ea580c] text-white rounded-lg font-medium transition-colors text-sm sm:text-base"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Create Thread</span>
            <span className="sm:hidden">Create</span>
          </button>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-dark-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Replies
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-dark-700">
              {threads && threads.length > 0 ? (
                threads.map((thread) => (
                  <tr key={thread.threadId} className="hover:bg-gray-50 dark:hover:bg-dark-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <div className="max-w-xs truncate" title={thread.title}>
                        {thread.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {thread.author?.userName || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {thread.category?.name || 'Uncategorized'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {thread.adminApproved ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded-full">
                          <Check className="h-3 w-3" />
                          Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 rounded-full">
                          <Clock className="h-3 w-3" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {thread.views || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {thread.replies || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {new Date(thread.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => window.open(`/threads/${thread.slug}`, '_blank')}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="View thread"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        {!thread.adminApproved && (
                          <>
                            <button 
                              onClick={() => handleApprove(thread)}
                              disabled={approvingThreadId === thread.threadId}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50"
                              title="Approve thread"
                            >
                              {approvingThreadId === thread.threadId ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                            </button>
                            <button 
                              onClick={() => openRejectModal(thread)}
                              disabled={rejectingThreadId === thread.threadId}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                              title="Reject thread"
                            >
                              {rejectingThreadId === thread.threadId ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                              ) : (
                                <X className="h-4 w-4" />
                              )}
                            </button>
                          </>
                        )}
                        
                        <button 
                          onClick={() => navigate(`/admin/threads/edit/${thread.threadId}`)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                          title="Edit thread"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(thread)}
                          disabled={deleteLoading}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                          title="Delete thread"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No threads found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-3">
        {threads && threads.length > 0 ? (
          threads.map((thread) => (
            <div key={thread.threadId} className="bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700 p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate mb-1">
                    {thread.title}
                  </h3>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    by {thread.author?.userName || 'Unknown'}
                  </div>
                </div>
                <div className="ml-3">
                  {thread.adminApproved ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded-full">
                      <Check className="h-3 w-3" />
                      <span className="hidden sm:inline">Approved</span>
                      <span className="sm:hidden">OK</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 rounded-full">
                      <Clock className="h-3 w-3" />
                      <span className="hidden sm:inline">Pending</span>
                      <span className="sm:hidden">Wait</span>
                    </span>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3 mb-3 text-xs">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Category:</span>
                  <span className="ml-1 text-gray-900 dark:text-white font-medium">
                    {thread.category?.name || 'Uncategorized'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Views:</span>
                  <span className="ml-1 text-gray-900 dark:text-white font-medium">
                    {thread.views || 0}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Replies:</span>
                  <span className="ml-1 text-gray-900 dark:text-white font-medium">
                    {thread.replies || 0}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(thread.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => window.open(`/threads/${thread.slug}`, '_blank')}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                    title="View thread"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  
                  {!thread.adminApproved && (
                    <>
                      <button 
                        onClick={() => handleApprove(thread)}
                        disabled={approvingThreadId === thread.threadId}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50 p-1"
                        title="Approve thread"
                      >
                        {approvingThreadId === thread.threadId ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </button>
                      <button 
                        onClick={() => openRejectModal(thread)}
                        disabled={rejectingThreadId === thread.threadId}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 p-1"
                        title="Reject thread"
                      >
                        {rejectingThreadId === thread.threadId ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </button>
                    </>
                  )}
                  
                  <button 
                    onClick={() => navigate(`/admin/threads/edit/${thread.threadId}`)}
                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 p-1"
                    title="Edit thread"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(thread)}
                    disabled={deleteLoading}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 p-1"
                    title="Delete thread"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700 p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">No threads found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {threadsPagination && threadsPagination.totalPages > 1 && (
        <div className="bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700 px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
          <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
            Showing {((threadsPagination.currentPage - 1) * 10) + 1} to {Math.min(threadsPagination.currentPage * 10, threadsPagination.total)} of {threadsPagination.total} results
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={threadsPagination.currentPage === 1}
              className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
              {threadsPagination.currentPage} of {threadsPagination.totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, threadsPagination.totalPages))}
              disabled={threadsPagination.currentPage === threadsPagination.totalPages}
              className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-dark-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Reject Thread
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Please provide a reason for rejecting this thread. This helps maintain content quality.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-[#f97315] focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
              rows="3"
            />
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={closeRejectModal}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(threads.find(t => t.threadId === rejectingThreadId), rejectReason)}
                disabled={!rejectReason.trim() || rejectingThreadId === null}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reject Thread
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreadsView;
