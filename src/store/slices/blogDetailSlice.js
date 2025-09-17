import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { blogsAPI } from '../../utils/api';

const initialState = {
  blog: null,
  comments: [],
  relatedBlogs: [],
  userLikes: {
    blog: false,
    comments: []
  },
  loading: false,
  error: null,
};

// Async thunk for fetching blog detail data
export const fetchBlogDetailData = createAsyncThunk(
  'blogDetail/fetchBlogDetailData',
  async (blogSlug, { rejectWithValue }) => {
    try {
      const data = await blogsAPI.getDetailWithAllData(blogSlug);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for adding a comment
export const addComment = createAsyncThunk(
  'blogDetail/addComment',
  async ({ blogId, commentData }, { rejectWithValue, getState }) => {
    try {
      const response = await blogsAPI.addComment(blogId, commentData);
      
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

const blogDetailSlice = createSlice({
  name: 'blogDetail',
  initialState,
  reducers: {
    clearBlogDetailData: (state) => {
      state.blog = null;
      state.comments = [];
      state.relatedBlogs = [];
      state.userLikes = {
        blog: false,
        comments: []
      };
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateBlogLike: (state, action) => {
      if (state.blog) {
        state.blog.isLiked = action.payload.isLiked;
        state.blog.likes = action.payload.likes;
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
      // Fetch blog detail data
      .addCase(fetchBlogDetailData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlogDetailData.fulfilled, (state, action) => {
        state.loading = false;
        state.blog = action.payload.blog;
        state.comments = action.payload.comments || [];
        state.relatedBlogs = action.payload.relatedBlogs || [];
        state.userLikes = action.payload.userLikes || {
          blog: false,
          comments: []
        };
      })
      .addCase(fetchBlogDetailData.rejected, (state, action) => {
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
  clearBlogDetailData, 
  clearError, 
  updateBlogLike, 
  updateCommentLike 
} = blogDetailSlice.actions;
export default blogDetailSlice.reducer;
