
export const API_BASE_URL = "https://api.marinersforum.com/api";
// export const API_BASE_URL = "http://localhost:30003/api";
// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem("token");
};

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const fullUrl = `${API_BASE_URL}${endpoint}`;

  const config = {
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(fullUrl, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("API request failed:", error.message);
    throw error;
  }
};

// Auth API
export const authAPI = {
  login: (credentials) =>
    apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  register: (userData) =>
    apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  getProfile: () => apiRequest("/auth/profile"),
};

// Users API
export const usersAPI = {
  getProfile: () => apiRequest("/users/profile"),
  updateProfile: (profileData) =>
    apiRequest("/users/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    }),
};

// Blogs API
export const blogsAPI = {
  getAll: () => apiRequest("/blogs"),

  // Comprehensive endpoint - get all data in one call
  getAllWithData: (params = {}) => {
    const queryParams = new URLSearchParams(params);
    return apiRequest(`/blogs/all-data?${queryParams}`);
  },

  // Comprehensive blog detail endpoint - get blog, comments, likes, user data
  getDetailWithAllData: (blogSlug) => {
    return apiRequest(`/blogs/detail/${encodeURIComponent(blogSlug)}`);
  },

  getById: (identifier) =>
    apiRequest(`/blogs/${encodeURIComponent(identifier)}`),

  create: (blogData) =>
    apiRequest("/blogs", {
      method: "POST",
      body: JSON.stringify(blogData),
    }),

  update: (blogId, blogData) =>
    apiRequest(`/blogs/${encodeURIComponent(blogId)}`, {
      method: "PUT",
      body: JSON.stringify(blogData),
    }),

  delete: (blogId) =>
    apiRequest(`/blogs/${encodeURIComponent(blogId)}`, {
      method: "DELETE",
    }),

  getComments: (blogId) =>
    apiRequest(`/blogs/${encodeURIComponent(blogId)}/comments`),

  addComment: (blogId, commentData) =>
    apiRequest(`/blogs/${encodeURIComponent(blogId)}/comments`, {
      method: "POST",
      body: JSON.stringify(commentData),
    }),

  getRelatedBlogs: (blogId, limit = 4) =>
    apiRequest(`/blogs/${encodeURIComponent(blogId)}/related?limit=${limit}`),
};

// Articles API
export const articlesAPI = {
  getAll: () => apiRequest("/articles"),

  // Comprehensive endpoint - get all data in one call
  getAllWithData: (params = {}) => {
    const queryParams = new URLSearchParams(params);
    return apiRequest(`/articles/all-data?${queryParams}`);
  },

  // Comprehensive article detail endpoint - get article, likes, user data
  getDetailWithAllData: (articleSlug) => {
    return apiRequest(`/articles/detail/${encodeURIComponent(articleSlug)}`);
  },

  getById: (identifier) =>
    apiRequest(`/articles/${encodeURIComponent(identifier)}`),

  create: (articleData) =>
    apiRequest("/articles", {
      method: "POST",
      body: JSON.stringify(articleData),
    }),

  update: (articleId, articleData) =>
    apiRequest(`/articles/${encodeURIComponent(articleId)}`, {
      method: "PUT",
      body: JSON.stringify(articleData),
    }),

  delete: (articleId) =>
    apiRequest(`/articles/${encodeURIComponent(articleId)}`, {
      method: "DELETE",
    }),
};

// Threads API
export const threadsAPI = {
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams(params);
    return apiRequest(`/threads?${queryParams}`);
  },

  // Comprehensive endpoint - get all data in one call
  getAllWithData: (params = {}) => {
    const queryParams = new URLSearchParams(params);
    return apiRequest(`/threads/all-data?${queryParams}`);
  },

  // Comprehensive thread detail endpoint - get thread, comments, likes, user data
  getDetailWithAllData: (threadSlug) => {
    return apiRequest(`/threads/detail/${encodeURIComponent(threadSlug)}`);
  },

  getById: (identifier) =>
    apiRequest(`/threads/${encodeURIComponent(identifier)}`),

  create: (threadData) =>
    apiRequest("/threads", {
      method: "POST",
      body: JSON.stringify(threadData),
    }),

  update: (threadId, threadData) =>
    apiRequest(`/threads/${encodeURIComponent(threadId)}`, {
      method: "PUT",
      body: JSON.stringify(threadData),
    }),

  delete: (threadId) =>
    apiRequest(`/threads/${encodeURIComponent(threadId)}`, {
      method: "DELETE",
    }),

  getComments: (threadId) =>
    apiRequest(`/threads/${encodeURIComponent(threadId)}/comments`),

  addComment: (threadId, commentData) =>
    apiRequest(`/threads/${encodeURIComponent(threadId)}/comments`, {
      method: "POST",
      body: JSON.stringify(commentData),
    }),

  getRelatedThreads: (threadId, limit = 5) =>
    apiRequest(
      `/threads/${encodeURIComponent(threadId)}/related?limit=${limit}`
    ),

  // Admin methods for pending threads
  getPending: (params = {}) => {
    const queryParams = new URLSearchParams(params);
    return apiRequest(`/threads/admin/pending?${queryParams}`);
  },

  approve: (threadId) =>
    apiRequest(`/threads/admin/${encodeURIComponent(threadId)}/approve`, {
      method: "POST",
    }),

  reject: (threadId, reason) =>
    apiRequest(`/threads/admin/${encodeURIComponent(threadId)}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),
};

// Likes API
export const likesAPI = {
  toggle: (entityType, entityId) =>
    apiRequest("/likes/toggle", {
      method: "POST",
      body: JSON.stringify({ entityType, entityId }),
    }),

  getStatus: (entityType, entityId) =>
    apiRequest(`/likes/status/${entityType}/${entityId}`),

  getCount: (entityType, entityId) =>
    apiRequest(`/likes/count/${entityType}/${entityId}`),
};

// Views API
export const viewsAPI = {
  increment: (entityType, entityId) =>
    apiRequest(`/views/increment/${entityType}/${entityId}`, {
      method: "POST",
    }),

  getCount: (entityType, entityId) =>
    apiRequest(`/views/count/${entityType}/${entityId}`),
};

// Admin API
export const adminAPI = {
  getAnalytics: () => apiRequest("/admin/analytics"),
  getUsers: (params = {}) => {
    const queryParams = new URLSearchParams(params);
    return apiRequest(`/admin/users?${queryParams}`);
  },

  deleteUser: (userId) =>
    apiRequest(`/admin/users/${userId}`, { method: "DELETE" }),
  getThreads: (params = {}) => {
    const queryParams = new URLSearchParams(params);
    return apiRequest(`/admin/threads?${queryParams}`);
  },
  deleteThread: (threadId) =>
    apiRequest(`/admin/threads/${threadId}`, { method: "DELETE" }),
  getBlogs: (params = {}) => {
    const queryParams = new URLSearchParams(params);
    return apiRequest(`/admin/blogs?${queryParams}`);
  },
  deleteBlog: (blogId) =>
    apiRequest(`/admin/blogs/${blogId}`, { method: "DELETE" }),
  getArticles: (params = {}) => {
    const queryParams = new URLSearchParams(params);
    return apiRequest(`/admin/articles?${queryParams}`);
  },
  deleteArticle: (articleId) =>
    apiRequest(`/admin/articles/${articleId}`, { method: "DELETE" }),
  generateSitemap: () =>
    apiRequest("/admin/sitemap/generate", { method: "POST" }),
  downloadSitemap: () => apiRequest("/admin/sitemap/download"),
  getSitemapStats: () => apiRequest("/admin/sitemap/stats"),
};

// Categories API
export const categoriesAPI = {
  getThreadCategories: () => apiRequest("/categories/threads"),
  getBlogCategories: () => apiRequest("/categories/blogs"),
  getArticleCategories: () => apiRequest("/categories/articles"),

  // Quick category info endpoint - for fast loading
  getCategoryInfo: (categorySlug) => {
    return apiRequest(`/categories/${encodeURIComponent(categorySlug)}/info`);
  },

  // Comprehensive endpoint - get all data for a specific category
  getCategoryData: (categorySlug, params = {}) => {
    const queryParams = new URLSearchParams(params);
    return apiRequest(
      `/categories/${encodeURIComponent(categorySlug)}?${queryParams}`
    );
  },
};

// ThreadFrom API
export const threadFromsAPI = {
  getAll: () => apiRequest("/thread-froms"),
  getById: (fromId) => apiRequest(`/thread-froms/${fromId}`),
  getCategories: (fromId) => apiRequest(`/thread-froms/${fromId}/categories`),
};

// Home API
export const homeAPI = {
  getData: (page = 1, limit = 20) =>
    apiRequest(`/home/data?page=${page}&limit=${limit}`),
  getHomeData: (params = {}) => {
    const queryParams = new URLSearchParams(params);
    return apiRequest(`/home/data?${queryParams}`);
  },
};

// Notifications API
export const notificationsAPI = {
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams(params);
    return apiRequest(`/notifications?${queryParams}`);
  },

  getUnreadCount: () => apiRequest("/notifications/unread-count"),

  markAsRead: (notificationId) =>
    apiRequest(`/notifications/${notificationId}/read`, {
      method: "PUT",
    }),

  markAllAsRead: () =>
    apiRequest("/notifications/mark-all-read", {
      method: "PUT",
    }),

  delete: (notificationId) =>
    apiRequest(`/notifications/${notificationId}`, {
      method: "DELETE",
    }),
};

// Search API
export const searchAPI = {
  // Search across all content
  search: (query, options = {}) => {
    const { filters, ...otherOptions } = options;
    const params = new URLSearchParams({ query, ...otherOptions });

    // Handle filters separately if they exist
    if (filters && typeof filters === "object") {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(`filters[${key}]`, value.toString());
        }
      });
    }

    return apiRequest(`/search?${params}`);
  },

  // Search with grouped results
  searchGrouped: (query, options = {}) => {
    const { filters, ...otherOptions } = options;
    const params = new URLSearchParams({ query, ...otherOptions });

    // Handle filters separately if they exist
    if (filters && typeof filters === "object") {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(`filters[${key}]`, value.toString());
        }
      });
    }

    return apiRequest(`/search/grouped?${params}`);
  },

  // Get search suggestions
  getSuggestions: (prefix, limit = 10) => {
    const params = new URLSearchParams({ prefix, limit: limit.toString() });
    console.log("searchAPI.getSuggestions called with:", { prefix, limit });
    console.log("API URL:", `/search/suggest?${params}`);
    return apiRequest(`/search/suggest?${params}`);
  },

  // Get similar content
  getSimilar: (id, limit = 5) => {
    const params = new URLSearchParams({ limit: limit.toString() });
    return apiRequest(`/search/similar/${encodeURIComponent(id)}?${params}`);
  },

  // Index all content (admin only)
  indexAllContent: () =>
    apiRequest("/search/index", {
      method: "POST",
    }),

  // Get search statistics (admin only)
  getStats: () => apiRequest("/search/stats"),
};

export default {
  auth: authAPI,
  blogs: blogsAPI,
  articles: articlesAPI,
  threads: threadsAPI,
  likes: likesAPI,
  admin: adminAPI,
  categories: categoriesAPI,
  search: searchAPI,
};
