import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { blogsAPI, categoriesAPI } from '../../utils/api';

const initialState = {
  blogs: [],
  categories: [],
  currentBlog: null,
  comments: [],
  loading: false,
  error: null,
  // Add cache tracking
  blogsLoaded: false,
  categoriesLoaded: false,
  // Add user likes tracking
  userLikes: [],
  // Add pagination
  blogsPagination: {
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 20,
    hasNext: false,
    hasPrev: false
  },
  loadingMore: false,
};

// Async thunks
export const fetchBlogs = createAsyncThunk(
  'blog/fetchBlogs',
  async (_, { rejectWithValue }) => {
    try {
      const blogs = await blogsAPI.getAll();
      return blogs;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Add Amazon-style paginated blogs
export const fetchBlogsPaginated = createAsyncThunk(
  'blog/fetchBlogsPaginated',
  async ({ page = 1, limit = 20, append = true } = {}, { rejectWithValue }) => {
    try {
      console.log('🚀 fetchBlogsPaginated called:', { page, limit, append });
      const response = await blogsAPI.getAll({ page, limit });
      console.log('📡 Blogs API Response:', {
        hasBlogs: !!response.blogs,
        blogsLength: response.blogs?.length,
        hasPagination: !!response.pagination,
        pagination: response.pagination
      });
      
      const result = { 
        blogs: response.blogs || response, 
        pagination: response.pagination || { currentPage: page, limit },
        append 
      };
      
      console.log('📤 Blogs Returning:', {
        blogsLength: result.blogs.length,
        pagination: result.pagination,
        append: result.append
      });
      
      return result;
    } catch (error) {
      console.error('❌ fetchBlogsPaginated error:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchBlogCategories = createAsyncThunk(
  'blog/fetchBlogCategories',
  async (_, { rejectWithValue }) => {
    try {
      const categories = await categoriesAPI.getBlogCategories();
      return categories;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchBlogById = createAsyncThunk(
  'blog/fetchBlogById',
  async (identifier, { rejectWithValue }) => {
    try {
      const blog = await blogsAPI.getById(identifier);
      return blog;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createBlog = createAsyncThunk(
  'blog/createBlog',
  async (blogData, { rejectWithValue }) => {
    try {
      const blog = await blogsAPI.create(blogData);
      return blog;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateBlog = createAsyncThunk(
  'blog/updateBlog',
  async ({ blogId, blogData }, { rejectWithValue }) => {
    try {
      const blog = await blogsAPI.update(blogId, blogData);
      return blog;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteBlog = createAsyncThunk(
  'blog/deleteBlog',
  async (blogId, { rejectWithValue }) => {
    try {
      await blogsAPI.delete(blogId);
      return blogId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchBlogComments = createAsyncThunk(
  'blog/fetchBlogComments',
  async (blogId, { rejectWithValue }) => {
    try {
      const comments = await blogsAPI.getComments(blogId);
      return comments;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addBlogComment = createAsyncThunk(
  'blog/addBlogComment',
  async ({ blogId, commentData }, { rejectWithValue }) => {
    try {
      const comment = await blogsAPI.addComment(blogId, commentData);
      return comment;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchRelatedBlogs = createAsyncThunk(
  'blog/fetchRelatedBlogs',
  async ({ blogId, limit = 4 }, { rejectWithValue }) => {
    try {
      const relatedBlogs = await blogsAPI.getRelatedBlogs(blogId, limit);
      return relatedBlogs;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Comprehensive API call for blogs
export const fetchBlogsWithAllData = createAsyncThunk(
  'blog/fetchBlogsWithAllData',
  async ({ page = 1, limit = 20, append = false } = {}, { rejectWithValue, getState }) => {
    try {
      const response = await blogsAPI.getAllWithData({ page, limit });
      return { 
        blogs: response.blogs || response, 
        categories: response.categories || [],
        userLikes: response.userLikes || [],
        pagination: response.pagination || { currentPage: page, limit },
        append 
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const blogSlice = createSlice({
  name: 'blog',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentBlog: (state) => {
      state.currentBlog = null;
    },
    resetBlogsState: (state) => {
      state.blogs = [];
      state.blogsLoaded = false;
      state.blogsPagination = {
        total: 0,
        totalPages: 0,
        currentPage: 1,
        limit: 20,
        hasNext: false,
        hasPrev: false
      };
      state.loadingMore = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch blogs
      .addCase(fetchBlogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.loading = false;
        state.blogs = action.payload;
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch paginated blogs (Amazon-style)
      .addCase(fetchBlogsPaginated.pending, (state, action) => {
        if (action.meta.arg?.append) {
          state.loadingMore = true;
        } else {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchBlogsPaginated.fulfilled, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        
        // Amazon-style: accumulate data instead of replacing
        if (action.payload.append) {
          // Append new blogs to existing ones (avoid duplicates)
          const existingIds = new Set(state.blogs.map(b => b.blogId));
          const newBlogs = action.payload.blogs.filter(b => !existingIds.has(b.blogId));
          
          console.log('📊 Blog accumulation:', {
            existingCount: state.blogs.length,
            newBlogsCount: action.payload.blogs.length,
            filteredNewCount: newBlogs.length
          });
          
          state.blogs = [...state.blogs, ...newBlogs];
          
          console.log('✅ Final blogs count after append:', state.blogs.length);
        } else {
          // Replace blogs (for refresh)
          console.log('🔄 Replacing blogs:', action.payload.blogs.length);
          state.blogs = action.payload.blogs;
          
          console.log('✅ Final blogs count after replace:', state.blogs.length);
        }
        
        // Update pagination
        if (action.payload.pagination) {
          state.blogsPagination = {
            ...state.blogsPagination,
            ...action.payload.pagination
          };
        }
        
        state.blogsLoaded = true;
      })
      .addCase(fetchBlogsPaginated.rejected, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.error = action.payload;
      })
      // Fetch categories
      .addCase(fetchBlogCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      // Fetch blog by ID
      .addCase(fetchBlogById.fulfilled, (state, action) => {
        state.currentBlog = action.payload;
      })
      // Create blog
      .addCase(createBlog.fulfilled, (state, action) => {
        state.blogs.unshift(action.payload);
      })
      // Update blog
      .addCase(updateBlog.fulfilled, (state, action) => {
        const index = state.blogs.findIndex(blog => blog.blogId === action.payload.blogId);
        if (index !== -1) {
          state.blogs[index] = action.payload;
        }
        if (state.currentBlog?.blogId === action.payload.blogId) {
          state.currentBlog = action.payload;
        }
      })
      // Delete blog
      .addCase(deleteBlog.fulfilled, (state, action) => {
        state.blogs = state.blogs.filter(blog => blog.blogId !== action.payload);
        if (state.currentBlog?.blogId === action.payload) {
          state.currentBlog = null;
        }
      })
      // Fetch comments
      .addCase(fetchBlogComments.pending, (state) => {
        state.commentsLoading = true;
        state.error = null;
      })
      .addCase(fetchBlogComments.fulfilled, (state, action) => {
        state.commentsLoading = false;
        state.comments = action.payload;
      })
      .addCase(fetchBlogComments.rejected, (state, action) => {
        state.commentsLoading = false;
        state.error = action.payload;
      })
      // Add comment
      .addCase(addBlogComment.fulfilled, (state, action) => {
        state.comments.push(action.payload);
      })
      // Fetch related blogs
      .addCase(fetchRelatedBlogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRelatedBlogs.fulfilled, (state, action) => {
        state.loading = false;
        state.relatedBlogs = action.payload;
      })
      .addCase(fetchRelatedBlogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Comprehensive blogs with all data
      .addCase(fetchBlogsWithAllData.pending, (state, action) => {
        if (action.meta.arg.append) {
          state.loadingMore = true;
        } else {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchBlogsWithAllData.fulfilled, (state, action) => {
        const { blogs, categories, userLikes, pagination, append } = action.payload;
        
        console.log('Blogs API Response:', {
          blogs: blogs?.length || 0,
          categories: categories?.length || 0,
          userLikes: userLikes?.length || 0,
          pagination,
          append,
          currentState: {
            blogsCount: state.blogs.length,
            currentPage: state.blogsPagination.currentPage,
            hasNext: state.blogsPagination.hasNext
          }
        });
        
        if (append) {
          // Append new blogs to existing ones
          const newBlogs = [...state.blogs, ...blogs];
          state.blogs = newBlogs;
          state.loadingMore = false;
          console.log('Blogs: Data appended, loadingMore set to false', {
            oldCount: state.blogs.length - blogs.length,
            newCount: newBlogs.length,
            addedCount: blogs.length
          });
        } else {
          // Replace blogs with new data
          state.blogs = blogs;
          state.loading = false;
          state.blogsLoaded = true;
          console.log('Blogs: Initial data loaded, loading set to false', {
            blogsCount: blogs.length
          });
        }
        
        // Update categories if provided
        if (categories && categories.length > 0) {
          state.categories = categories;
          state.categoriesLoaded = true;
        }
        
        // Update user likes if provided
        if (userLikes) {
          state.userLikes = userLikes;
        }
        
        // Update pagination if provided
        if (pagination) {
          state.blogsPagination = {
            ...state.blogsPagination,
            ...pagination
          };
          console.log('Blogs: Pagination updated', {
            currentPage: pagination.currentPage,
            hasNext: pagination.hasNext,
            totalPages: pagination.totalPages
          });
        }
      })
      .addCase(fetchBlogsWithAllData.rejected, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentBlog, resetBlogsState } = blogSlice.actions;
export default blogSlice.reducer;