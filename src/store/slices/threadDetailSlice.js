import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { threadsAPI } from '../../utils/api';

const initialState = {
  thread: null,
  comments: [],
  relatedThreads: [],
  userLikes: {
    thread: false,
    comments: []
  },
  loading: false,
  error: null,
};

// Async thunk for fetching thread detail data
export const fetchThreadDetailData = createAsyncThunk(
  'threadDetail/fetchThreadDetailData',
  async (threadSlug, { rejectWithValue }) => {
    try {
      const data = await threadsAPI.getDetailWithAllData(threadSlug);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for adding a comment
export const addComment = createAsyncThunk(
  'threadDetail/addComment',
  async ({ threadId, commentData }, { rejectWithValue, getState }) => {
    try {
      const response = await threadsAPI.addComment(threadId, commentData);
      
      // Get current user from auth state
      const state = getState();
      const currentUser = state.auth.user;
      
      // Create the new comment object with user data
      const newComment = {
        ...response,
        author: {
          userId: currentUser?.userId,
          userName: currentUser?.userName,
          userEmail: currentUser?.userEmail
        },
        likeCount: 0,
        isLiked: false,
        replies: []
      };
      
      return newComment;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const threadDetailSlice = createSlice({
  name: 'threadDetail',
  initialState,
  reducers: {
    clearThreadDetailData: (state) => {
      state.thread = null;
      state.comments = [];
      state.relatedThreads = [];
      state.userLikes = {
        thread: false,
        comments: []
      };
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateThreadLike: (state, action) => {
      if (state.thread) {
        state.thread.isLiked = action.payload.isLiked;
        state.thread.likes = action.payload.likes;
      }
    },
    updateCommentLike: (state, action) => {
      const { commentId, isLiked, likeCount } = action.payload;
      const comment = state.comments.find(c => c.commentId === commentId);
      if (comment) {
        comment.isLiked = isLiked;
        comment.likeCount = likeCount;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch thread detail data
      .addCase(fetchThreadDetailData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchThreadDetailData.fulfilled, (state, action) => {
        state.loading = false;
        state.thread = action.payload.thread;
        state.comments = action.payload.comments || [];
        state.relatedThreads = action.payload.relatedThreads || [];
        state.userLikes = action.payload.userLikes || {
          thread: false,
          comments: []
        };
      })
      .addCase(fetchThreadDetailData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add comment
      .addCase(addComment.fulfilled, (state, action) => {
        const newComment = action.payload;
        
        // If it's a reply, add it to the parent comment's replies
        if (newComment.parentId) {
          const parentComment = state.comments.find(c => c.commentId === newComment.parentId);
          if (parentComment) {
            if (!parentComment.replies) {
              parentComment.replies = [];
            }
            parentComment.replies.push(newComment);
          }
        } else {
          // If it's a top-level comment, add it to the main comments array
          state.comments.push(newComment);
        }
      })
      .addCase(addComment.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { 
  clearThreadDetailData, 
  clearError, 
  updateThreadLike, 
  updateCommentLike 
} = threadDetailSlice.actions;
export default threadDetailSlice.reducer;
