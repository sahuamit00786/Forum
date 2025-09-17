import React, { useState } from 'react';
import { Upload, Download, FileText, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useSelector } from 'react-redux';
import  { API_BASE_URL } from '../../utils/api';

const BulkUpload = () => {
  const { user } = useSelector((state) => state.auth);
  const [contentType, setContentType] = useState('blogs');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);

  // Check if user is admin
  if (!user || user.roleId !== 1) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  // Helper function to make API requests
  const apiRequest = async (endpoint, options = {}) => {
    const baseURL = `${API_BASE_URL}/bulk-upload`;
    
    const defaultOptions = {
      headers: {
        ...options.headers
      }
    };

    const response = await fetch(`${baseURL}${endpoint}`, {
      ...defaultOptions,
      ...options
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Request failed');
    }

    return response;
  };

  // Helper function for file downloads
  const downloadFile = async (endpoint, filename) => {
    const baseURL = `${API_BASE_URL}/bulk-upload`;
    
    const response = await fetch(`${baseURL}${endpoint}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Request failed');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // Download CSV template
  const downloadTemplate = async () => {
    try {
      setError(null);
      console.log('Downloading template for:', contentType);
      
      await downloadFile(`/${contentType}/template`, `${contentType}_template.csv`);
      console.log('Template downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      setError(`Failed to download template: ${error.message}`);
    }
  };

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file);
        setError(null);
      } else {
        setError('Please select a valid CSV file');
        setSelectedFile(null);
      }
    }
  };

  // Upload CSV file
  const uploadFile = async () => {
    if (!selectedFile) {
      setError('Please select a CSV file to upload');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setUploadResult(null);

      const formData = new FormData();
      formData.append('csvFile', selectedFile);

      const response = await apiRequest(`/${contentType}/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type header, let browser set it with boundary
        }
      });

      const result = await response.json();
      setUploadResult(result);
      setSelectedFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('csvFile');
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      setError(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Bulk Upload {contentType === 'blogs' ? 'Blogs' : 'Articles'}
        </h1>

        {/* Content Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Content Type
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="blogs"
                checked={contentType === 'blogs'}
                onChange={(e) => setContentType(e.target.value)}
                className="mr-2"
              />
              <span className="text-gray-700 dark:text-gray-300">Blogs</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="articles"
                checked={contentType === 'articles'}
                onChange={(e) => setContentType(e.target.value)}
                className="mr-2"
              />
              <span className="text-gray-700 dark:text-gray-300">Articles</span>
            </label>
          </div>
        </div>

        {/* Download Template */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Step 1: Download Template
          </h3>
          <p className="text-blue-700 dark:text-blue-300 mb-4">
            Download the CSV template to see the required format and fill in your data.
          </p>
          <button
            onClick={downloadTemplate}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Download {contentType === 'blogs' ? 'Blog' : 'Article'} Template
          </button>
        </div>

        {/* Upload Section */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
            Step 2: Upload CSV File
          </h3>
          <p className="text-green-700 dark:text-green-300 mb-4">
            Select your filled CSV file and upload it to create {contentType} in bulk.
          </p>
          
          <div className="space-y-4">
            <div>
              <input
                type="file"
                id="csvFile"
                accept=".csv"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/20 dark:file:text-blue-300"
              />
            </div>
            
            {selectedFile && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <FileText className="w-4 h-4 mr-2" />
                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </div>
            )}
            
            <button
              onClick={uploadFile}
              disabled={!selectedFile || uploading}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload {contentType === 'blogs' ? 'Blogs' : 'Articles'}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700 dark:text-red-300">{error}</span>
            </div>
          </div>
        )}

        {/* Upload Result */}
        {uploadResult && (
          <div className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Upload Results
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{uploadResult.successCount}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Successful</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{uploadResult.errorCount}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{uploadResult.successCount + uploadResult.errorCount}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
              </div>
            </div>

            {uploadResult.errors && uploadResult.errors.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Errors:</h4>
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded p-3 max-h-40 overflow-y-auto">
                  {uploadResult.errors.map((error, index) => (
                    <div key={index} className="text-sm text-red-700 dark:text-red-300 mb-1">
                      {error}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 flex items-center">
              {uploadResult.errorCount === 0 ? (
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
              )}
              <span className="text-gray-700 dark:text-gray-300">
                {uploadResult.message}
              </span>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
            Instructions
          </h3>
          <ul className="text-yellow-700 dark:text-yellow-300 space-y-1 text-sm">
            <li>• Download the template first to see the required format</li>
            <li>• Fill in all required fields (title, slug, categoryId, content, userId)</li>
            <li>• categoryId must be an existing category ID in the system</li>
            <li>• userId must be an existing user ID in the system</li>
            <li>• metaDescription, image, imageAlt are optional</li>
            <li>• Boolean fields (isActive, isDeleted, isImported, isAiGenerated): use "1" for true, "0" for false</li>
            <li>• views: numeric value (default 0)</li>
            <li>• Maximum file size: 5MB</li>
            <li>• Only CSV files are accepted</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BulkUpload;
