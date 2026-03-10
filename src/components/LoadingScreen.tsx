import React from 'react';

interface LoadingScreenProps {
  loaded: number;
  total: number;
}

/**
 * Full-screen loading screen with progress bar. Shown until all videos
 * and assets are ready. Uses safe-area for notches/home indicator.
 */
const LoadingScreen: React.FC<LoadingScreenProps> = ({ loaded, total }) => {
  const percent = total > 0 ? Math.min(100, Math.round((loaded / total) * 100)) : 0;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-issy-pink font-pixel text-issy-accent"
      style={{
        minHeight: '100dvh',
        padding: 'env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)',
      }}
      aria-live="polite"
      aria-label={`Loading ${percent}%`}
    >
      <div className="w-10 h-10 border-4 border-issy-accent border-t-transparent rounded-full animate-spin" />
      <p className="mt-4 text-lg uppercase tracking-wide">Loading...</p>
      <div className="mt-3 w-48 h-2 bg-white/30 rounded-full overflow-hidden">
        <div
          className="h-full bg-issy-accent transition-all duration-300 ease-out rounded-full"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-2 text-sm text-issy-accent/90">
        {loaded} / {total} ready
      </p>
    </div>
  );
};

export default LoadingScreen;
