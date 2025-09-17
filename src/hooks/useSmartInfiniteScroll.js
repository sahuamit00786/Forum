import { useEffect, useCallback, useRef, useState } from 'react';

const useSmartInfiniteScroll = (callback, hasMore, loading, loadingMore, dataLength) => {
  const observer = useRef();
  const callbackRef = useRef(callback);
  const lastCallTimeRef = useRef(0);
  const [canLoadMore, setCanLoadMore] = useState(true);
  const [isWaitingForData, setIsWaitingForData] = useState(false);
  const [lastDataLength, setLastDataLength] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const minTimeBetweenCalls = 2000; // 2 seconds to prevent duplicate calls
  
  // Keep callback ref up to date
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Reset state when component mounts or data changes
  useEffect(() => {
    console.log('SmartScroll: Component state reset', {
      hasMore,
      loading,
      loadingMore,
      dataLength,
      isInitialized
    });
    
    // Reset states when component mounts or data changes
    if (!loading && !loadingMore) {
      setCanLoadMore(true);
      setIsWaitingForData(false);
      setIsInitialized(true);
      console.log('SmartScroll: State reset to allow loading');
    }
  }, [hasMore, loading, loadingMore]);

  // Force reinitialize when data changes
  useEffect(() => {
    if (dataLength > 0 && hasMore && !loading && !loadingMore) {
      console.log('SmartScroll: Force reinitializing for data change');
      setCanLoadMore(true);
      setIsWaitingForData(false);
      setIsInitialized(true);
    }
  }, [dataLength, hasMore, loading, loadingMore]);
  
  // Smart state management - track data changes
  useEffect(() => {
    if (loadingMore) {
      console.log('SmartScroll: Loading more started, setting canLoadMore to false');
      setCanLoadMore(false);
      setIsWaitingForData(true);
    } else if (isWaitingForData && !loadingMore) {
      // Check if data actually changed
      if (dataLength > lastDataLength) {
        console.log('SmartScroll: Data changed, waiting for DOM update', {
          lastDataLength,
          dataLength
        });
        setLastDataLength(dataLength);
        
        // Data has been loaded, wait for DOM to update
        const timer = setTimeout(() => {
          setCanLoadMore(true);
          setIsWaitingForData(false);
          console.log('SmartScroll: Ready for next load');
        }, 1500); // 1.5 second delay to ensure DOM is updated
        return () => clearTimeout(timer);
      } else {
        console.log('SmartScroll: No data change detected, resetting state');
        setCanLoadMore(true);
        setIsWaitingForData(false);
      }
    } else if (!loadingMore && !isWaitingForData) {
      // Ensure canLoadMore is true when not loading
      if (!canLoadMore) {
        console.log('SmartScroll: Resetting canLoadMore to true');
        setCanLoadMore(true);
      }
    }
    
    // Always ensure canLoadMore is true when component is ready
    if (!loading && !loadingMore && !isWaitingForData && hasMore && !canLoadMore) {
      console.log('SmartScroll: Force resetting canLoadMore to true');
      setCanLoadMore(true);
    }
  }, [loadingMore, isWaitingForData, dataLength, lastDataLength, canLoadMore]);
  
  const lastElementRef = useCallback(node => {
    console.log('SmartScroll: lastElementRef called with node:', {
      hasNode: !!node,
      loading,
      loadingMore,
      canLoadMore,
      isWaitingForData,
      hasMore,
      dataLength
    });

    // Don't set up observer if conditions aren't met
    if (!canLoadMore || isWaitingForData || !hasMore || !isInitialized) {
      console.log('SmartScroll: Not setting up observer:', {
        loading,
        loadingMore,
        canLoadMore,
        isWaitingForData,
        hasMore,
        isInitialized,
        dataLength
      });
      return;
    }

    // Disconnect existing observer
    if (observer.current) {
      observer.current.disconnect();
    }
    
    observer.current = new IntersectionObserver(entries => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallTimeRef.current;
      
      console.log('SmartScroll: IntersectionObserver triggered:', {
        isIntersecting: entries[0].isIntersecting,
        hasMore,
        loading,
        loadingMore,
        canLoadMore,
        isWaitingForData,
        timeSinceLastCall,
        dataLength,
        minTimeBetweenCalls
      });
      
      // Only call if ALL conditions are met
      if (
        entries[0].isIntersecting && 
        hasMore && 
        canLoadMore && 
        !isWaitingForData && 
        isInitialized &&
        timeSinceLastCall > minTimeBetweenCalls
        // Removed dataLength > 0 check to allow pagination even if data array is empty
      ) {
        console.log('SmartScroll: All conditions met, triggering loadMore');
        lastCallTimeRef.current = now;
        setCanLoadMore(false); // Immediately prevent multiple calls
        callbackRef.current();
      } else {
        console.log('SmartScroll: Conditions not met, not calling loadMore:', {
          isIntersecting: entries[0].isIntersecting,
          hasMore,
          loading,
          loadingMore,
          canLoadMore,
          isWaitingForData,
          timeSinceLastCall,
          minTimeBetweenCalls,
          dataLength
        });
      }
    }, {
      threshold: 0.1,
      rootMargin: '200px' // Trigger when user is 200px from bottom for better UX
    });
    
    if (node) {
      console.log('SmartScroll: Setting up observer for node');
      observer.current.observe(node);
      console.log('SmartScroll: Observer setup complete');
    } else {
      console.log('SmartScroll: No node provided, skipping observer setup');
    }
  }, [hasMore, canLoadMore, isWaitingForData, isInitialized]);

  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []);

  return lastElementRef;
};

export default useSmartInfiniteScroll;
