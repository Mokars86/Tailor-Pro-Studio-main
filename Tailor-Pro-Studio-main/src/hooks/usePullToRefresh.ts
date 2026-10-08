import { useState, useEffect, useRef, useCallback } from 'react';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  maxPull?: number;
  disabled?: boolean;
}

export function usePullToRefresh({
  onRefresh,
  threshold = 70,
  maxPull = 120,
  disabled = false
}: UsePullToRefreshOptions) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startYRef = useRef(0);
  const isPullingRef = useRef(false);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (disabled || isRefreshing) return;
      // Only trigger if at the top of the page
      if (window.scrollY === 0) {
        startYRef.current = e.touches[0].clientY;
        isPullingRef.current = true;
      }
    },
    [disabled, isRefreshing]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isPullingRef.current || disabled || isRefreshing) return;
      if (window.scrollY > 0) {
        isPullingRef.current = false;
        setPullDistance(0);
        return;
      }

      const currentY = e.touches[0].clientY;
      const diff = currentY - startYRef.current;

      if (diff > 0) {
        // Apply friction damping curve
        const dampened = Math.min(maxPull, diff * 0.45);
        setPullDistance(dampened);
        if (dampened > 10 && e.cancelable) {
          e.preventDefault();
        }
      } else {
        setPullDistance(0);
      }
    },
    [disabled, isRefreshing, maxPull]
  );

  const handleTouchEnd = useCallback(async () => {
    if (!isPullingRef.current || disabled || isRefreshing) return;
    isPullingRef.current = false;

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      setPullDistance(threshold * 0.75); // Hold at refreshing spinner position
      try {
        await Promise.resolve(onRefresh());
      } finally {
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
        }, 600);
      }
    } else {
      setPullDistance(0);
    }
  }, [disabled, isRefreshing, pullDistance, threshold, onRefresh]);

  useEffect(() => {
    if (disabled) return;
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [disabled, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    pullDistance,
    isRefreshing,
    progress: Math.min(1, pullDistance / threshold)
  };
}
