import React from 'react';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshIndicatorProps {
  pullDistance: number;
  isRefreshing: boolean;
  progress: number;
}

export const PullToRefreshIndicator: React.FC<PullToRefreshIndicatorProps> = ({
  pullDistance,
  isRefreshing,
  progress
}) => {
  if (pullDistance <= 0 && !isRefreshing) return null;

  return (
    <div
      className="fixed left-0 right-0 z-50 flex justify-center pointer-events-none transition-transform"
      style={{
        top: `max(12px, calc(10px + env(safe-area-inset-top, 0px)))`,
        transform: `translateY(${Math.min(pullDistance, 80)}px)`
      }}
    >
      <div className="bg-[#0D3B36] dark:bg-[#DCA134] text-white dark:text-[#0D3B36] px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 border-2 border-amber-400 dark:border-[#0D3B36] text-xs font-black">
        <RefreshCw
          className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
          style={{
            transform: isRefreshing ? undefined : `rotate(${progress * 360}deg)`
          }}
        />
        <span>{isRefreshing ? 'Syncing with Cloud...' : progress >= 1 ? 'Release to Refresh' : 'Pull to Refresh'}</span>
      </div>
    </div>
  );
};
