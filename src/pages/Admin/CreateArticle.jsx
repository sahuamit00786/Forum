import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Save, Upload, Plus } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { createArticle, updateArticle, fetchArticleById, fetchArticleCategories } from '../../store/slices/articleSlice';
import CreateCategoryModal from '../../components/CreateCategoryModal';

const CreateArticle = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useDispatch();
  const { categories } = useSelector((state) => state.article);
  const { user } = useSelector((state) => state.auth);
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    metaDescription: '',
    content: '',
    categoryId: '',
    h1Tag: '',
    image: '',
    imageAlt: '',
    isAiGenerated: false,
    isImported: false
  });
  const [loading, setLoading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Check if user is admin
  const isAdmin = user?.roleId === 1;

  useEffect(() => {
    dispatch(fetchArticleCategories());
    
    if (isEditMode && id) {
      dispatch(fetchArticleById(id)).then((result) => {
        if (result.payload) {
          const article = result.payload;
          setFormData({
            title: article.title || '',
            slug: article.slug || '',
            metaDescription: article.metaDescription || '',
            content: article.content || '',
            h1Tag: article.h1Tag || '',
            categoryId: article.categoryId?.toString() || '',
            image: article.image || '',
            imageAlt: article.imageAlt || '',
            isAiGenerated: article.isAiGenerated || false
          });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isEditMode) {
        await dispatch(updateArticle({ id, ...formData })).unwrap();
      } else {
        await dispatch(createArticle(formData)).unwrap();
      }
      navigate('/admin');
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} article:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryCreated = (newCategory) => {
    // Refresh categories and select the new one
    dispatch(fetchArticleCategories()).then(() => {
      setFormData(prev => ({ ...prev, categoryId: newCategory.categoryId.toString() }));
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
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
              {isEditMode ? 'Edit Article' : 'Create New Article'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isEditMode ? 'Update the article' : 'Add a new article to your forum'}
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
              placeholder="Enter article title"
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
              placeholder="article-url-slug"
            />
          </div>

          {/* H1 Tag */}
          <div>
            <label htmlFor="h1Tag" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              H1 Tag
            </label>
            <input
              type="text"
              id="h1Tag"
              name="h1Tag"
              value={formData.h1Tag}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-[#f97315] focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
              placeholder="Main heading for SEO"
            />
          </div>

          {/* Meta Description */}
          <div>
            <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Meta Description
            </label>
            <textarea
              id="metaDescription"
              name="metaDescription"
              value={formData.metaDescription}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-[#f97315] focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
              placeholder="Brief description for SEO"
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              id="categoryId"
              name="categoryId"
              value={formData.categoryId || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-[#f97315] focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
            >
              <option value="">Select a category</option>
              {categories && categories.length > 0 ? (
                categories.map((category) => (
                  <option key={category.categoryId} value={category.categoryId.toString()}>
                    {category.name}
                  </option>
                ))
              ) : (
                <option value="" disabled>Loading categories...</option>
              )}
            </select>
            {isAdmin && (
              <button
                type="button"
                onClick={() => setShowCategoryModal(true)}
                className="mt-2 flex items-center gap-1 px-3 py-1 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-dark-700 rounded-md hover:bg-gray-200 dark:hover:bg-dark-600"
              >
                <Plus className="h-4 w-4" />
                Create New Category
              </button>
            )}
          </div>

          {/* Image */}
          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Featured Image URL
            </label>
            <input
              type="url"
              id="image"
              name="image"
              value={formData.image}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-[#f97315] focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* Image Alt */}
          <div>
            <label htmlFor="imageAlt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Image Alt Text
            </label>
            <input
              type="text"
              id="imageAlt"
              name="imageAlt"
              value={formData.imageAlt}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-[#f97315] focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
              placeholder="Description of the image"
            />
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content *
            </label>
            <ReactQuill
              value={formData.content}
              onChange={(content) => setFormData(prev => ({ ...prev, content }))}
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
              placeholder="Write your article content here..."
              style={{ height: '300px', marginBottom: '50px' }}
            />
          </div>

          {/* Options */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isAiGenerated"
                  checked={formData.isAiGenerated}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 dark:border-dark-600 text-[#f97315] focus:ring-[#f97315]"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">AI Generated</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isImported"
                  checked={formData.isImported}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 dark:border-dark-600 text-[#f97315] focus:ring-[#f97315]"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Imported</span>
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
                  {isEditMode ? 'Update Article' : 'Create Article'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {showCategoryModal && (
        <CreateCategoryModal
          isOpen={showCategoryModal}
          onClose={() => setShowCategoryModal(false)}
          onCategoryCreated={handleCategoryCreated}
          categoryType="article"
        />
      )}
    </div>
  );
};

export default CreateArticle;
