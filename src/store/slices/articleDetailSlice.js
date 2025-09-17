import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { articlesAPI } from '../../utils/api';

const initialState = {
  article: null,
  relatedArticles: [],
  userLikes: {
    article: false
  },
  loading: false,
  error: null,
};

// Async thunk for fetching article detail data
export const fetchArticleDetailData = createAsyncThunk(
  'articleDetail/fetchArticleDetailData',
  async (articleSlug, { rejectWithValue }) => {
    try {
      const data = await articlesAPI.getDetailWithAllData(articleSlug);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const articleDetailSlice = createSlice({
  name: 'articleDetail',
  initialState,
  reducers: {
    clearArticleDetailData: (state) => {
      state.article = null;
      state.relatedArticles = [];
      state.userLikes = {
        article: false
      };
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateArticleLike: (state, action) => {
      if (state.article) {
        state.article.isLiked = action.payload.isLiked;
        state.article.likes = action.payload.likes;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch article detail data
      .addCase(fetchArticleDetailData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchArticleDetailData.fulfilled, (state, action) => {
        state.loading = false;
        state.article = action.payload.article;
        state.relatedArticles = action.payload.relatedArticles || [];
        state.userLikes = action.payload.userLikes || {
          article: false
        };
      })
      .addCase(fetchArticleDetailData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearArticleDetailData, 
  clearError, 
  updateArticleLike 
} = articleDetailSlice.actions;
export default articleDetailSlice.reducer;
