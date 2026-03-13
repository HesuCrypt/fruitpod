import React from 'react';
import type { LeaderboardEntry } from '../../lib/leaderboard';

const GAME_OVER_BG = '/fruits/Fruit Jam GAME OVER BG.png';

interface GameOverProps {
  score: number;
  leaderboardEntries: LeaderboardEntry[];
  onRestart: () => void;
  onHome: () => void;
  onOpenLeaderboard: () => void;
  onOpenSettings: () => void;
}

const GameOver: React.FC<GameOverProps> = ({
  score,
  leaderboardEntries,
  onRestart,
  onOpenLeaderboard,
  onOpenSettings,
}) => {
  const topFive = leaderboardEntries.slice(0, 5);

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-between overflow-hidden font-pixel pointer-events-none">
      {/* Background image (text like "GAME OVER", "YOUR SCORE", score is already on the image) */}
      <img
        src={GAME_OVER_BG}
        alt=""
        className="absolute inset-0 w-full h-full object-cover pointer-events-none pixelated"
      />

      {/* Only overlay: leaderboard at top, then buttons below */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-lg mx-auto flex-1 pt-[clamp(200px,65vw,65px)] pb-6 px-4 pointer-events-auto">
        {/* Your score — outside and above the leaderboard (sizes match reference image) */}
        <div className="w-full text-center flex-shrink-0 mb-3 leading-none">
          <p className="uppercase font-bold text-pink-600 mb-0" style={{ fontSize: 'clamp(2rem, 5vw, 1.5rem)' }}>
            Your score is:
          </p>
          <p className="font-bold tabular-nums text-pink-700 -mt-7" style={{ fontSize: 'clamp(6rem, 12vw, 3.5rem)' }}>
            {score.toLocaleString()}
          </p>
        </div>

        {/* Top 5 leaderboard — upper top */}
        <div
          className="w-full rounded-2xl overflow-hidden flex-shrink-0 mb-6"
          style={{
            backgroundColor: 'rgba(219, 140, 181, 0.95)',
          }}
        >
          <div className="py-2 px-2 space-y-1">
            {topFive.map((e) => (
              <div
                key={e.rank}
                className="flex items-center gap-3 rounded-xl px-3 py-2"
                style={{ backgroundColor: '#db8cb5' }}
              >
                <div
                  className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-bold"
                  style={{
                    backgroundColor: '#eac6c5',
                    fontSize: 'clamp(0.7rem, 3vw, 0.9rem)',
                    color: '#333',
                  }}
                >
                  {e.rank}
                </div>
                <span className="flex-1 text-gray-800 uppercase truncate font-bold" style={{ fontSize: 'clamp(0.7rem, 3vw, 0.9rem)' }}>
                  {e.username}
                </span>
                <span className="flex-shrink-0 text-gray-800 font-bold tabular-nums" style={{ fontSize: 'clamp(0.7rem, 3vw, 0.9rem)' }}>
                  {e.score.toLocaleString()}PTS
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons below leaderboard: Trophy | PLAY AGAIN | Gear */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 flex-shrink-0">
          <button
            type="button"
            onClick={onOpenLeaderboard}
            className="flex items-center justify-center rounded-full w-14 h-14 sm:w-16 sm:h-16 touch-manipulation active:scale-95 transition-transform"
            style={{ backgroundColor: '#E03D72' }}
            aria-label="Leaderboard"
          >
            <svg viewBox="0 0 24 24" className="w-15 h-20 sm:w-15 sm:h-20 text-white" fill="currentColor" aria-hidden>
              <path d="M12 2C10.9 2 10 2.9 10 4v1H6c-1.1 0-2 .9-2 2v2c0 2.2 1.8 4 4 4 .6 1.2 1.5 2.1 2.5 1.2-.9 2.2-2.1 2.7-3.5.4.6.9 1.1 1.5 1.5-.5 1.4-1.5 2.6-2.7 3.5 1-.9 1.9-2.1 2.5-3.5 1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2h-4V4c0-1.1-.9-2-2-2zm-2 6h4v2h-4V8zm0 4h4v2h-4v-2zm-2 6h2v2H8v-2zm6 0h2v2h-2v-2z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onRestart}
            className="flex items-center justify-center rounded-full px-6 py-3 min-w-[120px] touch-manipulation active:scale-95 transition-transform font-bold text-white uppercase"
            style={{
              backgroundColor: '#E03D72',
              fontSize: 'clamp(0.85rem, 4vw, 1.1rem)',
            }}
          >
            Play Again
          </button>
          <button
            type="button"
            onClick={onOpenSettings}
            className="flex items-center justify-center rounded-full w-14 h-14 sm:w-16 sm:h-16 touch-manipulation active:scale-95 transition-transform"
            style={{ backgroundColor: '#E03D72' }}
            aria-label="Settings"
          >
            <svg viewBox="0 0 24 24" className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="currentColor" aria-hidden>
              <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOver;
