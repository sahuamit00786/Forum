import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { homeAPI } from '../../utils/api';

const initialState = {
  threads: [],
  blogs: [],
  articles: [],
  categories: {
    threads: [],
    blogs: [],
    articles: []
  },
  threadFroms: [],
  userLikes: {
    threads: [],
    blogs: [],
    articles: []
  },
  pagination: {
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 20,
    hasNext: false,
    hasPrev: false
  },
  loading: false,
  error: null,
  dataLoaded: false, // Track if data has been loaded
  lastFetchTime: null, // Track when data was last fetched
};

// Comprehensive API call for home page data
export const fetchHomePageData = createAsyncThunk(
  'home/fetchHomePageData',
  async ({ page = 1, limit = 20, forceRefresh = false } = {}, { rejectWithValue, getState }) => {
    try {
      console.log('Home Slice: fetchHomePageData called with:', { page, limit, forceRefresh });
      
      const state = getState();
      const homeState = state.home;
      
      console.log('Home Slice: Current state:', {
        dataLoaded: homeState.dataLoaded,
        currentPage: homeState.pagination.currentPage,
        requestedPage: page
      });
      
      // Check if we already have data and this is not a force refresh
      if (!forceRefresh && homeState.dataLoaded && homeState.pagination.currentPage === page) {
        console.log('Home Slice: Using cached data for page', page);
        return { 
          threads: homeState.threads, 
          blogs: homeState.blogs,
          articles: homeState.articles,
          categories: homeState.categories,
          threadFroms: homeState.threadFroms,
          userLikes: homeState.userLikes,
          pagination: homeState.pagination,
          fromCache: true
        };
      }
      
      console.log('Home Slice: Fetching fresh data for page', page);
      const response = await homeAPI.getHomeData({ page, limit });
      console.log('Home Slice: API response:', response);
      
      return { 
        threads: response.threads || [],
        blogs: response.blogs || [],
        articles: response.articles || [],
        categories: response.categories || {},
        threadFroms: response.threadFroms || [],
        userLikes: response.userLikes || [],
        pagination: response.pagination || { currentPage: page, limit },
        fromCache: false
      };
    } catch (error) {
      console.error('Home Slice: Error fetching data:', error);
      return rejectWithValue(error.message);
    }
  }
);

const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearHomeData: (state) => {
      state.threads = [];
      state.blogs = [];
      state.articles = [];
      state.categories = {
        threads: [],
        blogs: [],
        articles: []
      };
      state.threadFroms = [];
      state.userLikes = {
        threads: [],
        blogs: [],
        articles: []
      };
      state.dataLoaded = false;
      state.lastFetchTime = null;
    },
    clearCache: (state) => {
      // Clear cache but keep data - this will force a refresh on next load
      state.dataLoaded = false;
      state.lastFetchTime = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch home page data
      .addCase(fetchHomePageData.pending, (state) => {
        console.log('Home Slice: Reducer - fetchHomePageData.pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHomePageData.fulfilled, (state, action) => {
        console.log('Home Slice: Reducer - fetchHomePageData.fulfilled', {
          fromCache: action.payload.fromCache,
          threadsCount: action.payload.threads?.length || 0,
          blogsCount: action.payload.blogs?.length || 0,
          articlesCount: action.payload.articles?.length || 0
        });
        
        state.loading = false;
        
        // Only update state if not using cached data
        if (!action.payload.fromCache) {
          console.log('Home Slice: Updating state with fresh data');
          state.threads = action.payload.threads || [];
          state.blogs = action.payload.blogs || [];
          state.articles = action.payload.articles || [];
          state.categories = action.payload.categories || {
            threads: [],
            blogs: [],
            articles: []
          };
          state.threadFroms = action.payload.threadFroms || [];
          state.userLikes = action.payload.userLikes || {
            threads: [],
            blogs: [],
            articles: []
          };
          state.pagination = action.payload.pagination || {
            total: 0,
            totalPages: 0,
            currentPage: 1,
            limit: 20,
            hasNext: false,
            hasPrev: false
          };
          state.dataLoaded = true; // Mark data as loaded
          state.lastFetchTime = new Date().toISOString(); // Record fetch time
        } else {
          console.log('Home Slice: Using cached data, not updating state');
        }
      })
      .addCase(fetchHomePageData.rejected, (state, action) => {
        console.error('Home Slice: Reducer - fetchHomePageData.rejected', action.payload);
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearHomeData, clearCache } = homeSlice.actions;
export default homeSlice.reducer;
