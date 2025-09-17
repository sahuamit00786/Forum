import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { threadsAPI, categoriesAPI, threadFromsAPI } from '../../utils/api';

const initialState = {
  threads: [],
  categories: [],
  threadFroms: [],
  forumCategories: {}, // Store categories by forum ID
  pendingThreads: [],
  pendingThreadsPagination: {
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10,
    hasNext: false,
    hasPrev: false
  },
  // Add pagination for threads
  threadsPagination: {
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 20, // Load 20 threads per page
    hasNext: false,
    hasPrev: false
  },
  currentThread: null,
  comments: [],
  loading: false,
  loadingMore: false, // Separate loading state for pagination
  error: null,
  // Add cache tracking
  threadsLoaded: false,
  categoriesLoaded: false,
  // Add user likes tracking
  userLikes: [],
};

// Async thunks
export const fetchThreadsWithAllData = createAsyncThunk(
  'forum/fetchThreadsWithAllData',
  async ({ page = 1, limit = 20, append = false } = {}, { rejectWithValue, getState }) => {
    try {
      // Check if we already have data and this is not a refresh
      const state = getState();
      if (state.forum.threadsLoaded && !append && page === 1) {
        return { 
          threads: state.forum.threads, 
          categories: state.forum.categories,
          threadFroms: state.forum.threadFroms,
          userLikes: state.forum.userLikes,
          pagination: state.forum.threadsPagination, 
          append: false 
        };
      }
      
      const response = await threadsAPI.getAllWithData({ page, limit });
      return { 
        threads: response.threads || response, 
        categories: response.categories || [],
        threadFroms: response.threadFroms || [],
        userLikes: response.userLikes || [],
        pagination: response.pagination || { currentPage: page, limit },
        append 
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Add new async thunk for paginated threads (Amazon-style)
export const fetchThreadsPaginated = createAsyncThunk(
  'forum/fetchThreadsPaginated',
  async ({ page = 1, limit = 20, append = true } = {}, { rejectWithValue, getState }) => {
    try {
      console.log('🚀 fetchThreadsPaginated called:', { page, limit, append });
      const response = await threadsAPI.getAll({ page, limit });
      console.log('📡 API Response:', {
        hasThreads: !!response.threads,
        threadsLength: response.threads?.length,
        hasPagination: !!response.pagination,
        pagination: response.pagination
      });
      
      const result = { 
        threads: response.threads || response, 
        pagination: response.pagination || { currentPage: page, limit },
        append 
      };
      
      console.log('📤 Returning:', {
        threadsLength: result.threads.length,
        pagination: result.pagination,
        append: result.append
      });
      
      return result;
    } catch (error) {
      console.error('❌ fetchThreadsPaginated error:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchThreadCategories = createAsyncThunk(
  'forum/fetchThreadCategories',
  async (_, { rejectWithValue, getState }) => {
    try {
      // Check if categories are already loaded
      const state = getState();
      if (state.forum.categoriesLoaded) {
        return state.forum.categories;
      }
      
      const categories = await categoriesAPI.getThreadCategories();
      return categories;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchThreadFroms = createAsyncThunk(
  'forum/fetchThreadFroms',
  async (_, { rejectWithValue }) => {
    try {
      const froms = await threadFromsAPI.getAll();
      return froms;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCategoriesByForum = createAsyncThunk(
  'forum/fetchCategoriesByForum',
  async (fromId, { rejectWithValue }) => {
    try {
      const categories = await threadFromsAPI.getCategories(fromId);
      return { fromId, categories };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchThreadById = createAsyncThunk(
  'forum/fetchThreadById',
  async (identifier, { rejectWithValue }) => {
    try {
      const thread = await threadsAPI.getById(identifier);
      return thread;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchThreadComments = createAsyncThunk(
  'forum/fetchThreadComments',
  async (threadId, { rejectWithValue }) => {
    try {
      const comments = await threadsAPI.getComments(threadId);
      return comments;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createThread = createAsyncThunk(
  'forum/createThread',
  async (threadData, { rejectWithValue }) => {
    try {
      const thread = await threadsAPI.create(threadData);
      return thread;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateThread = createAsyncThunk(
  'forum/updateThread',
  async ({ threadId, threadData }, { rejectWithValue }) => {
    try {
      const thread = await threadsAPI.update(threadId, threadData);
      return thread;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteThread = createAsyncThunk(
  'forum/deleteThread',
  async (threadId, { rejectWithValue }) => {
    try {
      await threadsAPI.delete(threadId);
      return threadId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addThreadComment = createAsyncThunk(
  'forum/addThreadComment',
  async ({ threadId, commentData }, { rejectWithValue }) => {
    try {
      const comment = await threadsAPI.addComment(threadId, commentData);
      return comment;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Admin approval actions
export const fetchPendingThreads = createAsyncThunk(
  'forum/fetchPendingThreads',
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await threadsAPI.getPending({ page, limit });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const approveThread = createAsyncThunk(
  'forum/approveThread',
  async (threadId, { rejectWithValue }) => {
    try {
      const result = await threadsAPI.approve(threadId);
      return { threadId, ...result };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const rejectThread = createAsyncThunk(
  'forum/rejectThread',
  async ({ threadId, reason }, { rejectWithValue }) => {
    try {
      const result = await threadsAPI.reject(threadId, reason);
      return { threadId, reason, ...result };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
const forumSlice = createSlice({
  name: 'forum',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch threads
      .addCase(fetchThreadsWithAllData.pending, (state, action) => {
        if (action.meta.arg?.append) {
          state.loadingMore = true;
        } else {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchThreadsWithAllData.fulfilled, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.threads = action.payload.append ? [...state.threads, ...action.payload.threads] : action.payload.threads;
        
        // Update pagination properly
        if (action.payload.pagination) {
          state.threadsPagination = {
            ...state.threadsPagination,
            ...action.payload.pagination
          };
        }
        
        state.threadsLoaded = true;
        state.categories = action.payload.categories;
        state.threadFroms = action.payload.threadFroms;
        state.userLikes = action.payload.userLikes;
      })
      .addCase(fetchThreadsWithAllData.rejected, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.error = action.payload;
      })
      // Fetch paginated threads (Amazon-style)
      .addCase(fetchThreadsPaginated.pending, (state, action) => {
        if (action.meta.arg?.append) {
          state.loadingMore = true;
        } else {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchThreadsPaginated.fulfilled, (state, action) => {
        console.log('🔍 fetchThreadsPaginated.fulfilled:', {
          payload: action.payload,
          currentThreadsCount: state.threads.length,
          append: action.payload.append
        });
        
        state.loading = false;
        state.loadingMore = false;
        
        // Amazon-style: accumulate data instead of replacing
        if (action.payload.append) {
          // Append new threads to existing ones (avoid duplicates)
          const existingIds = new Set(state.threads.map(t => t.threadId));
          const newThreads = action.payload.threads.filter(t => !existingIds.has(t.threadId));
          
          console.log('📊 Thread accumulation:', {
            existingCount: state.threads.length,
            newThreadsCount: action.payload.threads.length,
            filteredNewCount: newThreads.length,
            existingIds: Array.from(existingIds).slice(0, 5),
            newIds: action.payload.threads.map(t => t.threadId).slice(0, 5)
          });
          
          state.threads = [...state.threads, ...newThreads];
          
          console.log('✅ Final threads count after append:', state.threads.length);
        } else {
          // Replace threads (for refresh)
          console.log('🔄 Replacing threads:', action.payload.threads.length);
          state.threads = action.payload.threads;
          
          console.log('✅ Final threads count after replace:', state.threads.length);
        }
        
        // Update pagination
        if (action.payload.pagination) {
          state.threadsPagination = {
            ...state.threadsPagination,
            ...action.payload.pagination
          };
        }
        
        console.log('✅ Final state:', {
          totalThreads: state.threads.length,
          pagination: state.threadsPagination
        });
        
        state.threadsLoaded = true;
      })
      .addCase(fetchThreadsPaginated.rejected, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.error = action.payload;
      })
      // Fetch categories
      .addCase(fetchThreadCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
        state.categoriesLoaded = true;
      })
      // Fetch thread froms
      .addCase(fetchThreadFroms.fulfilled, (state, action) => {
        state.threadFroms = action.payload;
      })
      // Fetch categories by forum
      .addCase(fetchCategoriesByForum.fulfilled, (state, action) => {
        state.forumCategories[action.payload.fromId] = action.payload.categories;
      })
      // Fetch thread by ID
      .addCase(fetchThreadById.fulfilled, (state, action) => {
        state.currentThread = action.payload;
      })
      // Fetch comments
      .addCase(fetchThreadComments.fulfilled, (state, action) => {
        state.comments = action.payload;
      })
      // Create thread
      .addCase(createThread.fulfilled, (state, action) => {
        // Only add to threads list if it's approved (for non-admin users)
        // Admin users will see all threads in admin panel
        if (action.payload.adminApproved) {
          state.threads.unshift(action.payload);
        }
      })
      // Update thread
      .addCase(updateThread.fulfilled, (state, action) => {
        const index = state.threads.findIndex(thread => thread.threadId === action.payload.threadId);
        if (index !== -1) {
          state.threads[index] = action.payload;
        }
        if (state.currentThread?.threadId === action.payload.threadId) {
          state.currentThread = action.payload;
        }
      })
      // Delete thread
      .addCase(deleteThread.fulfilled, (state, action) => {
        state.threads = state.threads.filter(thread => thread.threadId !== action.payload);
        if (state.currentThread?.threadId === action.payload) {
          state.currentThread = null;
        }
      })
      // Add comment
      .addCase(addThreadComment.fulfilled, (state, action) => {
        state.comments.push(action.payload);
      })
      // Fetch pending threads
      .addCase(fetchPendingThreads.fulfilled, (state, action) => {
        state.pendingThreads = action.payload.threads || [];
        state.pendingThreadsPagination = action.payload.pagination || {
          total: 0,
          totalPages: 0,
          currentPage: 1,
          limit: 10,
          hasNext: false,
          hasPrev: false
        };
      })
      // Approve thread
      .addCase(approveThread.fulfilled, (state, action) => {
        // Remove from pending threads
        state.pendingThreads = state.pendingThreads.filter(thread => thread.threadId !== action.payload.threadId);
        // Add to approved threads
        state.threads.unshift(action.payload.thread);
      })
      // Reject thread
      .addCase(rejectThread.fulfilled, (state, action) => {
        // Remove from pending threads
        state.pendingThreads = state.pendingThreads.filter(thread => thread.threadId !== action.payload.threadId);
      });
  },
});

export const { clearError } = forumSlice.actions;
export default forumSlice.reducer;