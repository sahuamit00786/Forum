import { useEffect, useCallback, useRef, useState } from 'react';

const useInfiniteScroll = (callback, hasMore, loading, loadingMore, dataLength) => {
  const observer = useRef();
  const callbackRef = useRef(callback);
  const lastCallTimeRef = useRef(0);
  const [isDataLoaded, setIsDataLoaded] = useState(true);
  const minTimeBetweenCalls = 2000; // 2 seconds minimum between calls
  
  // Keep callback ref up to date
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  // Track when data is loaded and visible
  useEffect(() => {
    if (loadingMore) {
      setIsDataLoaded(false);
    } else {
      // Set a small delay to ensure DOM is updated
      const timer = setTimeout(() => {
        setIsDataLoaded(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loadingMore, dataLength]);
  
  const lastElementRef = useCallback(node => {
    // Don't set up observer if already loading or loading more
    if (loading || loadingMore || !isDataLoaded) return;
    
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallTimeRef.current;
      
      console.log('IntersectionObserver triggered:', {
        isIntersecting: entries[0].isIntersecting,
        hasMore,
        loading,
        loadingMore,
        isDataLoaded,
        timeSinceLastCall,
        dataLength
      });
      
      // Only call if:
      // 1. Element is intersecting
      // 2. Has more data
      // 3. Not currently loading
      // 4. Not loading more
      // 5. Data is loaded and visible
      // 6. Enough time has passed since last call
      if (entries[0].isIntersecting && hasMore && !loading && !loadingMore && isDataLoaded && timeSinceLastCall > minTimeBetweenCalls) {
        console.log('IntersectionObserver: Triggering loadMore - All conditions met');
        lastCallTimeRef.current = now;
        setIsDataLoaded(false); // Set to false immediately to prevent multiple calls
        callbackRef.current();
      }
    }, {
      threshold: 0.1,
      rootMargin: '100px' // Only trigger when user is near the bottom
    });
    
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore, isDataLoaded, dataLength]);

  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []);

  return lastElementRef;
};

export default useInfiniteScroll;
