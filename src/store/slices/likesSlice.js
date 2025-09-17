import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { likesAPI } from '../../utils/api';

const initialState = {
  likeStatuses: {},
  likeCounts: {},
  viewedEntities: {}, // Track which entities have been viewed in current session
  loading: false,
  error: null,
};

// Async thunks
export const toggleLike = createAsyncThunk(
  'likes/toggleLike',
  async ({ entityType, entityId }) => {
    const response = await likesAPI.toggle(entityType, entityId);
    return { entityType, entityId, ...response };
  }
);

export const getLikeStatus = createAsyncThunk(
  'likes/getLikeStatus',
  async ({ entityType, entityId }) => {
    const response = await likesAPI.getStatus(entityType, entityId);
    return { entityType, entityId, ...response };
  }
);

export const getLikeCount = createAsyncThunk(
  'likes/getLikeCount',
  async ({ entityType, entityId }) => {
    const response = await likesAPI.getCount(entityType, entityId);
    return { entityType, entityId, ...response };
  }
);

// Mark entity as viewed
export const markEntityAsViewed = createAsyncThunk(
  'likes/markEntityAsViewed',
  async ({ entityType, entityId }) => {
    return { entityType, entityId };
  }
);

const likesSlice = createSlice({
  name: 'likes',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearViewedEntities: (state) => {
      state.viewedEntities = {};
    },
  },
  extraReducers: (builder) => {
    builder
      // Toggle like
      .addCase(toggleLike.pending, (state) => {
        state.loading = true;
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        state.loading = false;
        const { entityType, entityId, likeStatus, likeCount } = action.payload;
        const key = `${entityType}-${entityId}`;
        state.likeStatuses[key] = likeStatus;
        if (likeCount !== undefined) {
          state.likeCounts[key] = likeCount;
        }
      })
      .addCase(toggleLike.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Get like status
      .addCase(getLikeStatus.fulfilled, (state, action) => {
        const { entityType, entityId, likeStatus } = action.payload;
        const key = `${entityType}-${entityId}`;
        state.likeStatuses[key] = likeStatus;
      })
      // Get like count
      .addCase(getLikeCount.fulfilled, (state, action) => {
        const { entityType, entityId, likeCount } = action.payload;
        const key = `${entityType}-${entityId}`;
        state.likeCounts[key] = likeCount;
      })
      // Mark entity as viewed
      .addCase(markEntityAsViewed.fulfilled, (state, action) => {
        const { entityType, entityId } = action.payload;
        const key = `${entityType}-${entityId}`;
        state.viewedEntities[key] = true;
      });
  },
});

export const { clearError, clearViewedEntities } = likesSlice.actions;
export default likesSlice.reducer;
