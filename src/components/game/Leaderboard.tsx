import React from 'react';
import type { LeaderboardEntry } from '../../lib/leaderboard';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  onBack: () => void;
}

const ROW_COLORS = ['#ea9894', '#e06860', '#d64553'];

function TrophyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-10 h-10 sm:w-12 sm:h-12 text-white" fill="currentColor" aria-hidden>
      <path d="M12 2C10.9 2 10 2.9 10 4v1H6c-1.1 0-2 .9-2 2v2c0 2.2 1.8 4 4 4 .6 1.2 1.5 2.1 2.5 1.2-.9 2.2-2.1 2.7-3.5.4.6.9 1.1 1.5 1.5-.5 1.4-1.5 2.6-2.7 3.5 1-.9 1.9-2.1 2.5-3.5 1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2h-4V4c0-1.1-.9-2-2-2zm-2 6h4v2h-4V8zm0 4h4v2h-4v-2zm-2 6h2v2H8v-2zm6 0h2v2h-2v-2z" />
    </svg>
  );
}

const Leaderboard: React.FC<LeaderboardProps> = ({ entries, onBack }) => {
  return (
    <div
      className="absolute inset-0 z-[60] flex flex-col font-pixel overflow-hidden"
      style={{ backgroundColor: '#F8A2A7' }}
    >
      <div className="flex flex-col items-center flex-shrink-0 pt-6 pb-4 px-4">
        <TrophyIcon />
        <h1
          className="text-white uppercase font-bold mt-2 text-center"
          style={{ fontSize: 'clamp(1.5rem, 6vw, 2.25rem)' }}
        >
          Leaderboard
        </h1>
      </div>

      <div
        className="flex-1 min-h-0 mx-4 mb-4 rounded-2xl overflow-hidden flex flex-col"
        style={{ backgroundColor: '#E8707A' }}
      >
        <div className="flex-1 overflow-y-auto overflow-x-hidden pr-1" style={{ scrollbarGutter: 'stable' }}>
          <div className="py-2 px-2 space-y-1">
            {entries.map((e) => (
              <div
                key={e.rank}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                style={{
                  backgroundColor: ROW_COLORS[(e.rank - 1) % ROW_COLORS.length],
                }}
              >
                <div
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
                  style={{
                    backgroundColor: ROW_COLORS[(e.rank - 1) % ROW_COLORS.length],
                    border: '2px solid rgba(0,0,0,0.15)',
                    fontSize: 'clamp(0.75rem, 3.5vw, 1rem)',
                  }}
                >
                  {e.rank}
                </div>
                <span className="flex-1 text-white uppercase truncate font-bold" style={{ fontSize: 'clamp(0.8rem, 3.5vw, 1rem)' }}>
                  {e.username}
                </span>
                <span className="flex-shrink-0 text-white uppercase font-bold tabular-nums" style={{ fontSize: 'clamp(0.8rem, 3.5vw, 1rem)' }}>
                  {e.score.toLocaleString()}PTS
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 flex justify-center pb-6 px-4">
        <button
          type="button"
          onClick={onBack}
          className="rounded-full px-8 py-3 text-white uppercase font-bold touch-manipulation active:scale-95 transition-transform"
          style={{
            backgroundColor: '#DA535C',
            border: '3px solid #C5484F',
            fontSize: 'clamp(0.9rem, 4vw, 1.1rem)',
          }}
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default Leaderboard;
