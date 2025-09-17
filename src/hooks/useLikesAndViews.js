import { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleLike, getLikeStatus, getLikeCount, markEntityAsViewed } from '../store/slices/likesSlice';
import { viewsAPI } from '../utils/api';

export const useLikesAndViews = (entityType, entityId) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { likeStatuses, likeCounts, viewedEntities, loading } = useSelector((state) => state.likes);

  const key = `${entityType}-${entityId}`;
  const isLiked = likeStatuses[key] || false;
  const likeCount = likeCounts[key] || 0;
  const hasBeenViewed = viewedEntities[key] || false;

  // Load initial like status and count when component mounts
  useEffect(() => {
    if (entityId) {
      // Get like count (public endpoint)
      dispatch(getLikeCount({ entityType, entityId }));

      // Get like status (requires authentication)
      if (isAuthenticated) {
        dispatch(getLikeStatus({ entityType, entityId }));
      }
    }
  }, [dispatch, entityType, entityId, isAuthenticated]);

  // Handle like toggle
  const handleLike = async () => {
    if (!isAuthenticated) {
      alert('Please log in to like this content');
      return;
    }

    try {
      await dispatch(toggleLike({ entityType, entityId })).unwrap();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  // Handle view increment - only once per entity per session
  const handleView = useCallback(async () => {
    if (!entityId) {
      console.log(`View skipped for ${entityType} - no entity ID`);
      return;
    }

    // Check if we've already viewed this entity in this session
    if (hasBeenViewed) {
      console.log(`View already tracked for ${entityType} ${entityId}`);
      return;
    }

    try {
      console.log(`🔄 Incrementing view for ${entityType} ${entityId}`);
      const response = await viewsAPI.increment(entityType, entityId);
      
      // Mark as viewed in Redux state
      dispatch(markEntityAsViewed({ entityType, entityId }));
      
      console.log(`✅ View incremented for ${entityType} ${entityId} - New count: ${response.views}`);
    } catch (error) {
      console.error('❌ Error incrementing view:', error);
    }
  }, [entityType, entityId, hasBeenViewed, dispatch]);

  return {
    isLiked,
    likeCount,
    loading,
    handleLike,
    handleView,
  };
};
