import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Save, Pin } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { createThread, updateThread, fetchThreadById, fetchThreadCategories, fetchThreadFroms, fetchCategoriesByForum } from '../../store/slices/forumSlice';

const CreateThread = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useDispatch();
  const { categories, threadFroms, forumCategories } = useSelector((state) => state.forum);
  const isEditMode = !!id;
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    fromId: '',
    categoryId: '',
    isPinned: false
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchThreadCategories());
    dispatch(fetchThreadFroms());
    
    if (isEditMode && id) {
      dispatch(fetchThreadById(id)).then((result) => {
        if (result.payload) {
          const thread = result.payload;
          setFormData({
            title: thread.title || '',
            slug: thread.slug || '',
            description: thread.description || '',
            fromId: thread.fromId?.toString() || '',
            categoryId: thread.categoryId?.toString() || '',
            isPinned: thread.isPinned || false
          });
          
          // If thread has a fromId, fetch its categories
          if (thread.fromId) {
            dispatch(fetchCategoriesByForum(thread.fromId));
          }
        }
      });
    }
  }, [dispatch, isEditMode, id]);



  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleForumChange = (e) => {
    const fromId = e.target.value;
    setFormData(prev => ({
      ...prev,
      fromId,
      categoryId: '' // Reset category when forum changes
    }));
    
    // Fetch categories for the selected forum
    if (fromId) {
      dispatch(fetchCategoriesByForum(fromId));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.fromId) {
      alert('Please select a forum');
      return;
    }
    
    if (!formData.categoryId) {
      alert('Please select a forum category');
      return;
    }
    
    setLoading(true);
    
    try {
      if (isEditMode) {
        await dispatch(updateThread({ id, ...formData })).unwrap();
        navigate('/admin');
      } else {
        const result = await dispatch(createThread(formData)).unwrap();
        
        // Check if thread needs approval (for non-admin users)
        if (result.needsApproval) {
          // Show approval popup for users
          const showApprovalPopup = window.confirm(
            'Your thread has been submitted successfully! 🎉\n\n' +
            'It will be reviewed by our admin team and approved shortly.\n\n' +
            'Why does it need approval?\n' +
            '• To ensure content quality and community guidelines\n' +
            '• To prevent spam and inappropriate content\n' +
            '• To maintain a positive forum environment\n\n' +
            'You will be notified once your thread is approved.\n\n' +
            'Click OK to continue or Cancel to stay on this page.'
          );
          
          if (showApprovalPopup) {
            navigate('/admin');
          }
        } else {
          // Admin threads are auto-approved
          navigate('/admin');
        }
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} thread:`, error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Admin
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-3 py-2 bg-[#f97315] hover:bg-[#ea580c] text-white rounded-lg font-medium transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Go to Site
            </button>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEditMode ? 'Edit Thread' : 'Create New Thread'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isEditMode ? 'Update the thread' : 'Start a new discussion by selecting a forum and category'}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-[#f97315] focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
              placeholder="Enter thread title"
            />
          </div>

          {/* Slug */}
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Slug *
            </label>
            <input
              type="text"
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-[#f97315] focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
              placeholder="thread-url-slug"
            />
          </div>

          {/* Forum */}
          <div>
            <label htmlFor="fromId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Forum *
            </label>
            <select
              id="fromId"
              name="fromId"
              value={formData.fromId || ''}
              onChange={handleForumChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-[#f97315] focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
            >
              <option value="">Select a forum</option>
              {threadFroms && threadFroms.length > 0 ? (
                threadFroms.map((forum) => (
                  <option key={forum.fromId} value={forum.fromId.toString()}>
                    {forum.name}
                  </option>
                ))
              ) : (
                <option value="" disabled>Loading forums...</option>
              )}
            </select>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Choose the main forum section for this thread
            </p>
          </div>

          {/* Forum Category */}
          <div>
            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Forum Category *
            </label>
            <select
              id="categoryId"
              name="categoryId"
              value={formData.categoryId || ''}
              onChange={handleInputChange}
              required
              disabled={!formData.fromId}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-[#f97315] focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">
                {!formData.fromId ? 'Select a forum first' : 'Select a category'}
              </option>
              {formData.fromId && forumCategories[formData.fromId] ? (
                forumCategories[formData.fromId].map((category) => (
                  <option key={category.categoryId} value={category.categoryId.toString()}>
                    {category.name}
                  </option>
                ))
              ) : formData.fromId ? (
                <option value="" disabled>Loading categories...</option>
              ) : null}
            </select>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {!formData.fromId 
                ? 'Select a forum first to see available categories' 
                : formData.fromId && forumCategories[formData.fromId] 
                  ? `Available categories in ${threadFroms.find(f => f.fromId.toString() === formData.fromId)?.name || 'this forum'}`
                  : 'Loading categories...'
              }
            </p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description *
            </label>
            <ReactQuill
              value={formData.description}
              onChange={(description) => setFormData(prev => ({ ...prev, description }))}
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, 3, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ 'color': [] }, { 'background': [] }],
                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                  [{ 'align': [] }],
                  ['link', 'image'],
                  ['clean']
                ]
              }}
              placeholder="Write your thread description here..."
              style={{ height: '200px', marginBottom: '50px' }}
            />
          </div>

          {/* Options */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isPinned"
                  checked={formData.isPinned}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 dark:border-dark-600 text-[#f97315] focus:ring-[#f97315]"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Pin this thread</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200 dark:border-dark-700">
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-[#f97315] hover:bg-[#ea580c] text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {isEditMode ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {isEditMode ? 'Update Thread' : 'Create Thread'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateThread;
