import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { articlesAPI, categoriesAPI } from '../../utils/api';

const initialState = {
  articles: [],
  categories: [],
  currentArticle: null,
  loading: false,
  error: null,
  // Add cache tracking
  articlesLoaded: false,
  categoriesLoaded: false,
  // Add user likes tracking
  userLikes: [],
  // Add pagination
  articlesPagination: {
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
export const fetchArticles = createAsyncThunk(
  'article/fetchArticles',
  async (_, { rejectWithValue }) => {
    try {
      const articles = await articlesAPI.getAll();
      return articles;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Add Amazon-style paginated articles
export const fetchArticlesPaginated = createAsyncThunk(
  'article/fetchArticlesPaginated',
  async ({ page = 1, limit = 20, append = true } = {}, { rejectWithValue }) => {
    try {
      console.log('🚀 fetchArticlesPaginated called:', { page, limit, append });
      const response = await articlesAPI.getAll({ page, limit });
      console.log('📡 Articles API Response:', {
        hasArticles: !!response.articles,
        articlesLength: response.articles?.length,
        hasPagination: !!response.pagination,
        pagination: response.pagination
      });
      
      const result = { 
        articles: response.articles || response, 
        pagination: response.pagination || { currentPage: page, limit },
        append 
      };
      
      console.log('📤 Articles Returning:', {
        articlesLength: result.articles.length,
        pagination: result.pagination,
        append: result.append
      });
      
      return result;
    } catch (error) {
      console.error('❌ fetchArticlesPaginated error:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchArticleCategories = createAsyncThunk(
  'article/fetchArticleCategories',
  async (_, { rejectWithValue }) => {
    try {
      const categories = await categoriesAPI.getArticleCategories();
      return categories;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchArticleById = createAsyncThunk(
  'article/fetchArticleById',
  async (identifier, { rejectWithValue }) => {
    try {
      const article = await articlesAPI.getById(identifier);
      return article;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);



export const createArticle = createAsyncThunk(
  'article/createArticle',
  async (articleData, { rejectWithValue }) => {
    try {
      const article = await articlesAPI.create(articleData);
      return article;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateArticle = createAsyncThunk(
  'article/updateArticle',
  async ({ articleId, articleData }, { rejectWithValue }) => {
    try {
      const article = await articlesAPI.update(articleId, articleData);
      return article;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteArticle = createAsyncThunk(
  'article/deleteArticle',
  async (articleId, { rejectWithValue }) => {
    try {
      await articlesAPI.delete(articleId);
      return articleId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Comprehensive API call for articles
export const fetchArticlesWithAllData = createAsyncThunk(
  'article/fetchArticlesWithAllData',
  async ({ page = 1, limit = 20, append = false } = {}, { rejectWithValue, getState }) => {
    try {
      const response = await articlesAPI.getAllWithData({ page, limit });
      return { 
        articles: response.articles || response, 
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


const articleSlice = createSlice({
  name: 'article',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentArticle: (state) => {
      state.currentArticle = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch articles
      .addCase(fetchArticles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchArticles.fulfilled, (state, action) => {
        state.loading = false;
        state.articles = action.payload;
      })
      .addCase(fetchArticles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch paginated articles (Amazon-style)
      .addCase(fetchArticlesPaginated.pending, (state, action) => {
        if (action.meta.arg?.append) {
          state.loadingMore = true;
        } else {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchArticlesPaginated.fulfilled, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        
        // Amazon-style: accumulate data instead of replacing
        if (action.payload.append) {
          // Append new articles to existing ones (avoid duplicates)
          const existingIds = new Set(state.articles.map(a => a.articleId));
          const newArticles = action.payload.articles.filter(a => !existingIds.has(a.articleId));
          
          console.log('📊 Article accumulation:', {
            existingCount: state.articles.length,
            newArticlesCount: action.payload.articles.length,
            filteredNewCount: newArticles.length
          });
          
          state.articles = [...state.articles, ...newArticles];
          
          console.log('✅ Final articles count after append:', state.articles.length);
        } else {
          // Replace articles (for refresh)
          console.log('🔄 Replacing articles:', action.payload.articles.length);
          state.articles = action.payload.articles;
          
          console.log('✅ Final articles count after replace:', state.articles.length);
        }
        
        // Update pagination
        if (action.payload.pagination) {
          state.articlesPagination = {
            ...state.articlesPagination,
            ...action.payload.pagination
          };
        }
        
        state.articlesLoaded = true;
      })
      .addCase(fetchArticlesPaginated.rejected, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.error = action.payload;
      })
      // Fetch categories
      .addCase(fetchArticleCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      // Fetch article by ID
      .addCase(fetchArticleById.fulfilled, (state, action) => {
        state.currentArticle = action.payload;
      })

      // Create article
      .addCase(createArticle.fulfilled, (state, action) => {
        state.articles.unshift(action.payload);
      })
      // Update article
      .addCase(updateArticle.fulfilled, (state, action) => {
        const index = state.articles.findIndex(article => article.articleId === action.payload.articleId);
        if (index !== -1) {
          state.articles[index] = action.payload;
        }
        if (state.currentArticle?.articleId === action.payload.articleId) {
          state.currentArticle = action.payload;
        }
      })
      // Delete article
      .addCase(deleteArticle.fulfilled, (state, action) => {
        state.articles = state.articles.filter(article => article.articleId !== action.payload);
        if (state.currentArticle?.articleId === action.payload) {
          state.currentArticle = null;
        }
      })
      // Comprehensive articles with all data
      .addCase(fetchArticlesWithAllData.pending, (state, action) => {
        if (action.meta.arg.append) {
          state.loadingMore = true;
        } else {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchArticlesWithAllData.fulfilled, (state, action) => {
        const { articles, categories, userLikes, pagination, append } = action.payload;
        
        console.log('Articles API Response:', {
          articles: articles?.length || 0,
          categories: categories?.length || 0,
          userLikes: userLikes?.length || 0,
          pagination,
          append
        });
        
        if (append) {
          // Append new articles to existing ones
          state.articles = [...state.articles, ...articles];
          state.loadingMore = false;
        } else {
          // Replace articles with new data
          state.articles = articles;
          state.loading = false;
          state.articlesLoaded = true;
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
          state.articlesPagination = {
            ...state.articlesPagination,
            ...pagination
          };
        }
      })
      .addCase(fetchArticlesWithAllData.rejected, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentArticle } = articleSlice.actions;
export default articleSlice.reducer;