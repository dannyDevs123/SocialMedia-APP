import { useRef, useCallback } from 'react';

export const useInfiniteScroll = (callback, hasMore, loading) => {
  const observerRef = useRef();
  const lastElementRef = useCallback((node) => {
    if (loading) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) callback();
    });
    if (node) observerRef.current.observe(node);
  }, [loading, hasMore, callback]);
  return lastElementRef;
};
