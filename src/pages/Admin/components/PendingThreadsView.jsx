import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Check, X, Eye, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { fetchPendingThreads, approveThread, rejectThread } from '../../../store/slices/forumSlice';

const PendingThreadsView = () => {
  const dispatch = useDispatch();
  const { pendingThreads, pendingThreadsPagination, loading } = useSelector((state) => state.forum);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingThreadId, setRejectingThreadId] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedThreadId, setExpandedThreadId] = useState(null);

  useEffect(() => {
    console.log('PendingThreadsView: Fetching pending threads for page:', currentPage);
    dispatch(fetchPendingThreads({ page: currentPage, limit: 10 }));
  }, [dispatch, currentPage]);

  const handleApprove = async (threadId) => {
    try {
      await dispatch(approveThread(threadId)).unwrap();
      // Refresh current page data
      dispatch(fetchPendingThreads({ page: currentPage, limit: 10 }));
      // Show success message
      alert('Thread approved successfully!');
    } catch (error) {
      console.error('Error approving thread:', error);
      alert('Failed to approve thread: ' + error.message);
    }
  };

  const handleViewThread = (threadId) => {
    setExpandedThreadId(expandedThreadId === threadId ? null : threadId);
  };

  const handleReject = async (threadId, reason) => {
    try {
      await dispatch(rejectThread({ threadId, reason })).unwrap();
      setShowRejectModal(false);
      setRejectReason('');
      setRejectingThreadId(null);
      // Refresh current page data
      dispatch(fetchPendingThreads({ page: currentPage, limit: 10 }));
      // Show success message
      alert('Thread rejected successfully!');
    } catch (error) {
      console.error('Error rejecting thread:', error);
      alert('Failed to reject thread: ' + error.message);
    }
  };

  const openRejectModal = (threadId) => {
    setRejectingThreadId(threadId);
    setShowRejectModal(true);
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setRejectReason('');
    setRejectingThreadId(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f97315]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-3" >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Pending Threads
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Review and approve threads submitted by users
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Clock className="h-4 w-4" />
          <span>{pendingThreadsPagination.total || pendingThreads.length} threads pending approval</span>
        </div>
      </div>

      {/* Threads List */}
      {pendingThreads.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No pending threads
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            All threads have been reviewed and approved.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-700">
              <thead className="bg-gray-50 dark:bg-dark-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Thread
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-dark-700">
                {pendingThreads.map((thread) => (
                  <React.Fragment key={thread.threadId}>
                    <tr className="hover:bg-gray-50 dark:hover:bg-dark-700">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-[#f97315] flex items-center justify-center">
                              <span className="text-white font-medium text-xs">
                                {thread.title.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900 dark:text-white max-w-xs truncate">
                              {thread.title}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {thread.from?.name || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {thread.author?.userName || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {thread.category?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(thread.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleApprove(thread.threadId)}
                            className="p-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors"
                            title="Approve thread"
                          >
                            <Check className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => openRejectModal(thread.threadId)}
                            className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors"
                            title="Reject thread"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleViewThread(thread.threadId)}
                            className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
                            title="View details"
                          >
                            {expandedThreadId === thread.threadId ? (
                              <ChevronUp className="h-3 w-3" />
                            ) : (
                              <ChevronDown className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Expanded Details */}
                    {expandedThreadId === thread.threadId && (
                      <tr className="bg-gray-50 dark:bg-dark-700">
                        <td colSpan="5" className="px-6 py-4">
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                  Thread Details
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div>
                                    <span className="text-gray-600 dark:text-gray-400">Title:</span>
                                    <span className="ml-2 text-gray-900 dark:text-white">{thread.title}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600 dark:text-gray-400">Slug:</span>
                                    <span className="ml-2 text-gray-900 dark:text-white">{thread.slug}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600 dark:text-gray-400">Forum:</span>
                                    <span className="ml-2 text-gray-900 dark:text-white">{thread.from?.name || 'N/A'}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600 dark:text-gray-400">Category:</span>
                                    <span className="ml-2 text-gray-900 dark:text-white">{thread.category?.name || 'N/A'}</span>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                  Author Information
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div>
                                    <span className="text-gray-600 dark:text-gray-400">Username:</span>
                                    <span className="ml-2 text-gray-900 dark:text-white">{thread.author?.userName || 'Unknown'}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600 dark:text-gray-400">Email:</span>
                                    <span className="ml-2 text-gray-900 dark:text-white">{thread.author?.userEmail || 'N/A'}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600 dark:text-gray-400">Joined:</span>
                                    <span className="ml-2 text-gray-900 dark:text-white">
                                      {thread.author?.createdAt ? formatDate(thread.author.createdAt) : 'N/A'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                Thread Content
                              </h4>
                              <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 rounded-lg p-3">
                                <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                                  {thread.description || 'No content available'}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-dark-600">
                              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <span>Submitted: {formatDate(thread.createdAt)}</span>
                                {thread.updatedAt && thread.updatedAt !== thread.createdAt && (
                                  <span>• Updated: {formatDate(thread.updatedAt)}</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => window.open(`/threads/${thread.slug}`, '_blank')}
                                  className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs transition-colors"
                                >
                                  Open in New Tab
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {pendingThreadsPagination.totalPages > 1 && (
            <div className="px-6 py-3 border-t border-gray-200 dark:border-dark-700 flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing {((pendingThreadsPagination.currentPage - 1) * pendingThreadsPagination.limit) + 1} to {Math.min(pendingThreadsPagination.currentPage * pendingThreadsPagination.limit, pendingThreadsPagination.total)} of {pendingThreadsPagination.total} results
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={pendingThreadsPagination.currentPage === 1}
                  className="px-3 py-1 text-sm bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                  {pendingThreadsPagination.currentPage} of {pendingThreadsPagination.totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, pendingThreadsPagination.totalPages))}
                  disabled={pendingThreadsPagination.currentPage === pendingThreadsPagination.totalPages}
                  className="px-3 py-1 text-sm bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
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
                onClick={() => handleReject(rejectingThreadId, rejectReason)}
                disabled={!rejectReason.trim()}
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

export default PendingThreadsView;
