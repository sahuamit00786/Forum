import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminAPI } from '../../utils/api';

// Async thunks
export const fetchAdminAnalytics = createAsyncThunk(
  'admin/fetchAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      console.log('fetchAdminAnalytics: Making API call...');
      const response = await adminAPI.getAnalytics();
      console.log('fetchAdminAnalytics: API response:', response);
      return response;
    } catch (error) {
      console.error('fetchAdminAnalytics: Error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch analytics');
    }
  }
);

export const fetchUsers = createAsyncThunk(
  'admin/fetchUsers',
  async ({ page = 1, limit = 10, search = '' }, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getUsers({ page, limit, search });
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      await adminAPI.deleteUser(userId);
      return userId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
    }
  }
);

export const fetchThreads = createAsyncThunk(
  'admin/fetchThreads',
  async ({ page = 1, limit = 10, search = '' }, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getThreads({ page, limit, search });
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch threads');
    }
  }
);

export const deleteThread = createAsyncThunk(
  'admin/deleteThread',
  async (threadId, { rejectWithValue }) => {
    try {
      await adminAPI.deleteThread(threadId);
      return threadId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete thread');
    }
  }
);

export const fetchBlogs = createAsyncThunk(
  'admin/fetchBlogs',
  async ({ page = 1, limit = 10, search = '' }, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getBlogs({ page, limit, search });
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch blogs');
    }
  }
);

export const deleteBlog = createAsyncThunk(
  'admin/deleteBlog',
  async (blogId, { rejectWithValue }) => {
    try {
      await adminAPI.deleteBlog(blogId);
      return blogId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete blog');
    }
  }
);

export const fetchArticles = createAsyncThunk(
  'admin/fetchArticles',
  async ({ page = 1, limit = 10, search = '' }, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getArticles({ page, limit, search });
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch articles');
    }
  }
);

export const deleteArticle = createAsyncThunk(
  'admin/deleteArticle',
  async (articleId, { rejectWithValue }) => {
    try {
      await adminAPI.deleteArticle(articleId);
      return articleId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete article');
    }
  }
);

export const generateSitemap = createAsyncThunk(
  'admin/generateSitemap',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAPI.generateSitemap();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate sitemap');
    }
  }
);

export const fetchSitemapStats = createAsyncThunk(
  'admin/fetchSitemapStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getSitemapStats();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sitemap stats');
    }
  }
);

const initialState = {
  // Analytics
  analytics: {
    onlineUsers: 0,
    totalUsers: 0,
    monthlyRegistrations: 0,
    totalContent: 0,
    totalThreads: 0,
    totalBlogs: 0,
    totalArticles: 0,
    totalViews: 0,
    totalLikes: 0,
    avgEngagement: '0.0'
  },
  analyticsLoading: false,
  analyticsError: null,

  // Users
  users: [],
  usersLoading: false,
  usersError: null,
  usersPagination: {
    total: 0,
    totalPages: 0,
    currentPage: 1
  },

  // Threads
  threads: [],
  threadsLoading: false,
  threadsError: null,
  threadsPagination: {
    total: 0,
    totalPages: 0,
    currentPage: 1
  },

  // Blogs
  blogs: [],
  blogsLoading: false,
  blogsError: null,
  blogsPagination: {
    total: 0,
    totalPages: 0,
    currentPage: 1
  },

  // Articles
  articles: [],
  articlesLoading: false,
  articlesError: null,
  articlesPagination: {
    total: 0,
    totalPages: 0,
    currentPage: 1
  },

  // Sitemap
  sitemapStats: {
    totalUrls: 0,
    threads: 0,
    blogs: 0,
    articles: 0,
    categories: 0,
    lastGenerated: null
  },
  sitemapLoading: false,
  sitemapError: null,

  // General
  deleteLoading: false,
  deleteError: null
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.analyticsError = null;
      state.usersError = null;
      state.threadsError = null;
      state.blogsError = null;
      state.articlesError = null;
      state.sitemapError = null;
      state.deleteError = null;
    },
    clearDeleteError: (state) => {
      state.deleteError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Analytics
      .addCase(fetchAdminAnalytics.pending, (state) => {
        state.analyticsLoading = true;
        state.analyticsError = null;
      })
      .addCase(fetchAdminAnalytics.fulfilled, (state, action) => {
        state.analyticsLoading = false;
        console.log('AdminSlice: Analytics payload received:', action.payload);
        state.analytics = action.payload;
      })
      .addCase(fetchAdminAnalytics.rejected, (state, action) => {
        state.analyticsLoading = false;
        state.analyticsError = action.payload;
      })

      // Users
      .addCase(fetchUsers.pending, (state) => {
        state.usersLoading = true;
        state.usersError = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.users = action.payload.users || [];
        state.usersPagination = {
          total: action.payload.total || 0,
          totalPages: action.payload.totalPages || 0,
          currentPage: action.payload.currentPage || 1
        };
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.usersLoading = false;
        state.usersError = action.payload;
      })
      .addCase(deleteUser.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.users = state.users.filter(user => user.userId !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload;
      })

      // Threads
      .addCase(fetchThreads.pending, (state) => {
        state.threadsLoading = true;
        state.threadsError = null;
      })
      .addCase(fetchThreads.fulfilled, (state, action) => {
        state.threadsLoading = false;
        state.threads = action.payload.threads || [];
        state.threadsPagination = {
          total: action.payload.total || 0,
          totalPages: action.payload.totalPages || 0,
          currentPage: action.payload.currentPage || 1
        };
      })
      .addCase(fetchThreads.rejected, (state, action) => {
        state.threadsLoading = false;
        state.threadsError = action.payload;
      })
      .addCase(deleteThread.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteThread.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.threads = state.threads.filter(thread => thread.threadId !== action.payload);
      })
      .addCase(deleteThread.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload;
      })

      // Blogs
      .addCase(fetchBlogs.pending, (state) => {
        state.blogsLoading = true;
        state.blogsError = null;
      })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.blogsLoading = false;
        state.blogs = action.payload.blogs || [];
        state.blogsPagination = {
          total: action.payload.total || 0,
          totalPages: action.payload.totalPages || 0,
          currentPage: action.payload.currentPage || 1
        };
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.blogsLoading = false;
        state.blogsError = action.payload;
      })
      .addCase(deleteBlog.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteBlog.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.blogs = state.blogs.filter(blog => blog.blogId !== action.payload);
      })
      .addCase(deleteBlog.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload;
      })

      // Articles
      .addCase(fetchArticles.pending, (state) => {
        state.articlesLoading = true;
        state.articlesError = null;
      })
      .addCase(fetchArticles.fulfilled, (state, action) => {
        state.articlesLoading = false;
        state.articles = action.payload.articles || [];
        state.articlesPagination = {
          total: action.payload.total || 0,
          totalPages: action.payload.totalPages || 0,
          currentPage: action.payload.currentPage || 1
        };
      })
      .addCase(fetchArticles.rejected, (state, action) => {
        state.articlesLoading = false;
        state.articlesError = action.payload;
      })
      .addCase(deleteArticle.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteArticle.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.articles = state.articles.filter(article => article.articleId !== action.payload);
      })
      .addCase(deleteArticle.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload;
      })

      // Sitemap
      .addCase(generateSitemap.pending, (state) => {
        state.sitemapLoading = true;
        state.sitemapError = null;
      })
      .addCase(generateSitemap.fulfilled, (state, action) => {
        state.sitemapLoading = false;
        // Update sitemap stats with the generated data
        if (action.payload && action.payload.stats) {
          state.sitemapStats = {
            ...state.sitemapStats,
            ...action.payload.stats
          };
        }
      })
      .addCase(generateSitemap.rejected, (state, action) => {
        state.sitemapLoading = false;
        state.sitemapError = action.payload;
      })
      .addCase(fetchSitemapStats.pending, (state) => {
        state.sitemapLoading = true;
        state.sitemapError = null;
      })
      .addCase(fetchSitemapStats.fulfilled, (state, action) => {
        state.sitemapLoading = false;
        state.sitemapStats = action.payload || {};
      })
      .addCase(fetchSitemapStats.rejected, (state, action) => {
        state.sitemapLoading = false;
        state.sitemapError = action.payload;
      });
  }
});

export const { clearErrors, clearDeleteError } = adminSlice.actions;
export default adminSlice.reducer;