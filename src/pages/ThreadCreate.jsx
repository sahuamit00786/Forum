import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { createThread, fetchThreadFroms, fetchThreadCategories, fetchCategoriesByForum } from '../store/slices/forumSlice';
import { 
  ArrowLeft, 
  Plus, 
  MessageSquare, 
  AlertCircle,
  CheckCircle,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Toast from '../components/Toast';
import BackButton from '../components/BackButton';

const ThreadCreate = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { categories, threadFroms, forumCategories, loading, error } = useSelector((state) => state.forum);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fromId: '',
    categoryId: '',
    isPinned: false
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [showApprovalInfo, setShowApprovalInfo] = useState(false);
  const [showApprovalPopup, setShowApprovalPopup] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/threads/create' } });
    }
  }, [isAuthenticated, navigate]);

  // Fetch thread froms and categories
  useEffect(() => {
    dispatch(fetchThreadFroms());
    dispatch(fetchThreadCategories());
  }, [dispatch]);

  // Fetch categories for selected forum (ensures fresh, filtered list)
  useEffect(() => {
    if (formData.fromId) {
      const id = parseInt(formData.fromId);
      if (!Number.isNaN(id)) {
        dispatch(fetchCategoriesByForum(id));
      }
    }
  }, [dispatch, formData.fromId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // If fromId is changing, reset categoryId
    if (name === 'fromId') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        categoryId: '' // Reset category when from changes
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Thread title is required';
    } else if (formData.title.trim().length < 5) {
      newErrors.title = 'Thread title must be at least 5 characters long';
    } else if (formData.title.trim().length > 200) {
      newErrors.title = 'Thread title must be less than 200 characters';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Thread content is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Thread content must be at least 10 characters long';
    } else if (formData.description.trim().length > 5000) {
      newErrors.description = 'Thread content must be less than 5000 characters';
    }
    
    if (!formData.fromId) {
      newErrors.fromId = 'Please select a forum section';
    }
    
    if (!formData.categoryId) {
      newErrors.categoryId = 'Please select a category';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setApiError(null);
    setErrors({});

    try {
      const threadData = {
        ...formData,
        slug: generateSlug(formData.title)
      };

      console.log('Creating thread with data:', threadData);
      const result = await dispatch(createThread(threadData)).unwrap();
      console.log('Thread created successfully:', result);
      setSuccess(true);
      
      // Check if user is admin or if thread needs approval
      if (user?.roleId === 1) {
        // Admin - thread is auto-approved
        setToastMessage('Thread created successfully!');
        setToastType('success');
        setShowToast(true);
        
        // Redirect to the new thread after a short delay
        setTimeout(() => {
          navigate(`/threads/${encodeURIComponent(result.slug)}`);
        }, 2000);
      } else {
        // Non-admin user - thread needs approval
        setShowApprovalPopup(true);
        
        // Auto-close popup after 30 seconds
        setTimeout(() => {
          setShowApprovalPopup(false);
          navigate('/threads');
        }, 30000);
      }
    } catch (error) {
      console.error('Error creating thread:', error);
      const errorMessage = error.message || 'Failed to create thread. Please try again.';
      setApiError(errorMessage);
      setToastMessage(errorMessage);
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
          duration={3000}
        />
      )}

      {/* Thread Approval Popup */}
      {showApprovalPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-800 rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Thread Submitted Successfully!
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your thread has been submitted for review
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                  Thread Approval Process
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                  Our admin team will review your thread to ensure it meets our community guidelines. 
                  This usually takes 2-4 hours.
                </p>
                
                <button
                  type="button"
                  onClick={() => setShowApprovalInfo(!showApprovalInfo)}
                  className="inline-flex items-center gap-1 text-sm font-medium text-blue-800 dark:text-blue-200 hover:text-blue-900 dark:hover:text-blue-100 transition-colors"
                >
                  {showApprovalInfo ? (
                    <>
                      Hide Details
                      <ChevronUp className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Why does approval take time?
                      <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </button>
                
                {showApprovalInfo && (
                  <div className="mt-3 p-3 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                    <h5 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                      Why We Review Threads:
                    </h5>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• <strong>Content Quality:</strong> Ensure discussions are meaningful</li>
                      <li>• <strong>Community Safety:</strong> Prevent inappropriate content</li>
                      <li>• <strong>Spam Prevention:</strong> Keep the forum clean and relevant</li>
                      <li>• <strong>User Experience:</strong> Maintain a positive environment</li>
                    </ul>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
                      <strong>Note:</strong> Most threads are approved quickly. You'll be notified once it's live!
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>This popup will close automatically in 30 seconds</span>
                <button
                  type="button"
                  onClick={() => {
                    setShowApprovalPopup(false);
                    navigate('/threads');
                  }}
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                >
                  Close Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Back Button */}
      <div className="mb-6">
        <BackButton />
      </div>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* <button
            onClick={() => navigate('/threads')}
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Threads
          </button> */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Thread</h1>
            <p className="text-gray-600 dark:text-gray-400">Start a new discussion with the community</p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            <div>
              <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                {user?.roleId === 1 ? 'Thread Created Successfully!' : 'Thread Submitted Successfully!'}
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                {user?.roleId === 1 
                  ? 'Redirecting to your new thread...' 
                  : 'Your thread has been submitted for review. It will appear on the forum once approved by our admin team.'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {apiError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <div>
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Error Creating Thread
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300">
                {apiError}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Create Thread Form */}
      <div className="bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700">
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Thread Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter a descriptive title for your thread..."
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                  errors.title 
                    ? 'border-red-300 dark:border-red-600 focus:ring-red-500' 
                    : 'border-gray-300 dark:border-dark-600'
                }`}
                required
                maxLength={200}
              />
              <div className="mt-1 flex justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formData.title.length}/200 characters
                </p>
                {errors.title && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.title}
                  </p>
                )}
              </div>
            </div>

            {/* Forum Section (From) */}
            <div>
              <label htmlFor="fromId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Forum Section *
              </label>
              <select
                id="fromId"
                name="fromId"
                value={formData.fromId}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white ${
                  errors.fromId 
                    ? 'border-red-300 dark:border-red-600 focus:ring-red-500' 
                    : 'border-gray-300 dark:border-dark-600'
                }`}
                required
              >
                <option value="">Select a forum section</option>
                {threadFroms.map((from) => (
                  <option key={from.fromId} value={from.fromId}>
                    {from.name}
                  </option>
                ))}
              </select>
              {errors.fromId && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.fromId}
                </p>
              )}
            </div>

            {/* Category */}
            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category *
              </label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white ${
                  errors.categoryId 
                    ? 'border-red-300 dark:border-red-600 focus:ring-red-500' 
                    : 'border-gray-300 dark:border-dark-600'
                }`}
                required
                disabled={!formData.fromId}
              >
                <option value="">{formData.fromId ? 'Select a category' : 'Please select a forum section first'}</option>
                {(() => {
                  if (!formData.fromId) return null;
                  const selectedFromId = parseInt(formData.fromId);
                  const list = forumCategories[selectedFromId] || threadFroms.find(f => f.fromId === selectedFromId)?.categories || [];
                  const sorted = [...list].sort((a, b) => {
                    const aIsOthers = (a.name || '').toLowerCase() === 'others';
                    const bIsOthers = (b.name || '').toLowerCase() === 'others';
                    if (aIsOthers && !bIsOthers) return 1;
                    if (!aIsOthers && bIsOthers) return -1;
                    return (a.name || '').localeCompare(b.name || '');
                  });
                  return sorted.map((category) => (
                    <option key={category.categoryId} value={category.categoryId}>
                      {category.name}
                    </option>
                  ));
                })()}
              </select>
              {errors.categoryId && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.categoryId}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Thread Content *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Share your thoughts, questions, or start a discussion..."
                rows={8}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none ${
                  errors.description 
                    ? 'border-red-300 dark:border-red-600 focus:ring-red-500' 
                    : 'border-gray-300 dark:border-dark-600'
                }`}
                required
                maxLength={5000}
              />
              <div className="mt-1 flex justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formData.description.length}/5000 characters
                </p>
                {errors.description && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.description}
                  </p>
                )}
              </div>
            </div>

            {/* Pin Thread (Admin Only) */}
            {user?.roleId === 1 && (
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isPinned"
                  name="isPinned"
                  checked={formData.isPinned}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="isPinned" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Pin this thread to the top
                </label>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200 dark:border-dark-700">
              <button
                type="button"
                onClick={() => navigate('/threads')}
                className="px-6 py-2 border border-gray-300 dark:border-dark-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.title.trim() || !formData.description.trim() || !formData.categoryId}
                className="inline-flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Create Thread
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Guidelines */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
          Thread Creation Guidelines
        </h3>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• Be respectful and constructive in your discussions</li>
          <li>• Use clear, descriptive titles that summarize your topic</li>
          <li>• Provide relevant details and context in your content</li>
          <li>• Choose the appropriate category for your thread</li>
          <li>• Avoid duplicate threads - search before posting</li>
        </ul>
      </div>

      {/* Approval Information for Non-Admin Users */}
      {user?.roleId !== 1 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                Thread Approval Process
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Your thread will be reviewed by our admin team before appearing on the forum. 
                This ensures content quality and community guidelines. Most threads are approved within 2-4 hours.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreadCreate;
