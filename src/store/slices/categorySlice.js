import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { categoriesAPI } from '../../utils/api';

const initialState = {
  category: null,
  threads: [],
  blogs: [],
  articles: [],
  counts: {
    threads: 0,
    blogs: 0,
    articles: 0,
    totalViews: 0
  },
  userLikes: {
    threads: [],
    blogs: [],
    articles: []
  },
  pagination: {
    currentPage: 1,
    limit: 20,
    hasNext: false,
    hasPrev: false
  },
  loading: false,
  error: null,
};

// Async thunk for fetching category data
export const fetchCategoryData = createAsyncThunk(
  'category/fetchCategoryData',
  async ({ categorySlug, page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const data = await categoriesAPI.getCategoryData(categorySlug, { page, limit });
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    clearCategoryData: (state) => {
      state.category = null;
      state.threads = [];
      state.blogs = [];
      state.articles = [];
      state.counts = {
        threads: 0,
        blogs: 0,
        articles: 0,
        totalViews: 0
      };
      state.userLikes = {
        threads: [],
        blogs: [],
        articles: []
      };
      state.pagination = {
        currentPage: 1,
        limit: 20,
        hasNext: false,
        hasPrev: false
      };
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch category data
      .addCase(fetchCategoryData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryData.fulfilled, (state, action) => {
        state.loading = false;
        state.category = action.payload.category;
        state.threads = action.payload.threads || [];
        state.blogs = action.payload.blogs || [];
        state.articles = action.payload.articles || [];
        state.counts = action.payload.counts || {
          threads: 0,
          blogs: 0,
          articles: 0,
          totalViews: 0
        };
        state.userLikes = action.payload.userLikes || {
          threads: [],
          blogs: [],
          articles: []
        };
        state.pagination = action.payload.pagination || {
          currentPage: 1,
          limit: 20,
          hasNext: false,
          hasPrev: false
        };
      })
      .addCase(fetchCategoryData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCategoryData, clearError } = categorySlice.actions;
export default categorySlice.reducer;
