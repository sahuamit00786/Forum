import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { toggleLike } from '../store/slices/likesSlice';
import { addComment } from '../store/slices/threadDetailSlice';
import { addComment as addBlogComment } from '../store/slices/blogDetailSlice';

export const useLikeReply = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [isLiking, setIsLiking] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [likingItemId, setLikingItemId] = useState(null);

  // Handle like action
  const handleLike = async (contentType, contentId, currentLikes, isLiked) => {
    if (!isAuthenticated) {
      // Store current page for redirect after login
      const currentPath = location.pathname + location.search;
      localStorage.setItem('redirectAfterLogin', currentPath);
      
      alert('Please login to like this content');
      
      // Force navigation to login
      window.location.href = '/login';
      return false;
    }

    try {
      setIsLiking(true);
      setLikingItemId(contentId); // Track which item is being liked
      
      // Call the actual like API
      const result = await dispatch(toggleLike({ 
        entityType: contentType, 
        entityId: contentId 
      })).unwrap();
      
      // Return the new state for the component to update
      return {
        success: true,
        newLikeCount: result.likeCount,
        isLiked: result.likeStatus,
        previousLikes: currentLikes,
        wasLiked: isLiked
      };
      
    } catch (error) {
      console.error('Like error:', error);
      alert('Failed to update like. Please try again.');
      return { success: false };
    } finally {
      setIsLiking(false);
      setLikingItemId(null); // Clear the tracking
    }
  };

  // Handle reply action
  const handleReply = async (contentType, contentId, replyText, parentId = null) => {
    if (!isAuthenticated) {
      // Store current page for redirect after login
      const currentPath = location.pathname + location.search;
      localStorage.setItem('redirectAfterLogin', currentPath);
      
      alert('Please login to reply to this content');
      
      // Force navigation to login
      window.location.href = '/login';
      return false;
    }

    try {
      setIsReplying(true);
      
      // Call the actual reply API based on content type
      let result;
      if (contentType === 'thread') {
        result = await dispatch(addComment({
          threadId: contentId,
          commentData: {
            content: replyText,
            parentId: parentId
          }
        })).unwrap();
      } else if (contentType === 'blog') {
        result = await dispatch(addBlogComment({
          blogId: contentId,
          commentData: {
            content: replyText,
            parentId: parentId
          }
        })).unwrap();
      }
      
      return { success: true, comment: result };
      
    } catch (error) {
      console.error('Reply error:', error);
      alert('Failed to post reply. Please try again.');
      return { success: false };
    } finally {
      setIsReplying(false);
    }
  };

  return {
    handleLike,
    handleReply,
    isLiking,
    isReplying,
    likingItemId
  };
};
