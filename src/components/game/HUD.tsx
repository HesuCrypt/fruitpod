import React from 'react';
import type { ScoreUpdatePayload } from '../GameCanvas';

interface HUDProps {
  scoreConfig: ScoreUpdatePayload;
}

const HUD: React.FC<HUDProps> = ({ scoreConfig }) => {
  const { score, lives, combo, frenzyProgress, isFrenzy } = scoreConfig;
  const pct = Math.min(100, Math.max(0, frenzyProgress * 100));

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-4 font-pixel">
      <div className="flex justify-between items-start w-full">
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-2 drop-shadow-[1px_1px_0_rgba(255,255,255,0.5)]">
            <span className="text-sm sm:text-base uppercase text-gray-400">
              Score
            </span>
            <span className="text-4xl sm:text-5xl font-bold text-black">
              {String(score).padStart(5, '0')}
            </span>
          </div>
          {combo > 0 && (
            <div className="mt-2 text-green-400 text-xl sm:text-2xl font-bold drop-shadow-[1px_1px_0_#FFF]">
              {combo}x COMBO
            </div>
          )}
        </div>
        <div className="flex gap-1">
          {[1, 2, 3].map((i) => (
            <span
              key={i}
              className={`text-3xl sm:text-4xl ${i <= lives ? 'text-red-500' : 'text-gray-600'}`}
              aria-hidden
            >
              ♥
            </span>
          ))}
        </div>
      </div>

      <div className="w-full flex flex-col items-center pb-3">
        <div className="w-full max-w-lg">
          <div className="flex justify-between items-end mb-2 px-1">
            <span
              className={`text-sm sm:text-base font-bold ${isFrenzy ? 'text-yellow-400 animate-pulse' : 'text-gray-400'}`}
            >
              {isFrenzy ? '★ HYPER MODE ★' : 'Frenzy bar'}
            </span>
            <span className="text-sm sm:text-base text-gray-400">
              {Math.floor(pct)}%
            </span>
          </div>
          <div className="h-6 sm:h-7 w-full bg-neutral-800 border-2 border-white/30 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-150 ${isFrenzy ? 'bg-yellow-400' : 'bg-gradient-to-r from-issy-pink to-issy-accent'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HUD;
