import React from 'react';
import type { ScoreUpdatePayload } from '../GameCanvas';

interface HUDProps {
  scoreConfig: ScoreUpdatePayload;
}

const SCORE_GOAL = 100_000;

/** Pixel-art heart (8×8 style) for lives display. */
function PixelHeart({ filled }: { filled: boolean }) {
  const color = filled ? '#ef4444' : '#6b7280';
  return (
    <svg
      viewBox="0 0 8 8"
      className="w-full h-full"
      style={{ imageRendering: 'pixelated' }}
    >
      <rect x="1" y="0" width="2" height="2" fill={color} />
      <rect x="5" y="0" width="2" height="2" fill={color} />
      <rect x="0" y="2" width="2" height="2" fill={color} />
      <rect x="2" y="2" width="2" height="2" fill={color} />
      <rect x="4" y="2" width="2" height="2" fill={color} />
      <rect x="6" y="2" width="2" height="2" fill={color} />
      <rect x="0" y="4" width="8" height="2" fill={color} />
      <rect x="2" y="6" width="4" height="2" fill={color} />
    </svg>
  );
}

const HUD: React.FC<HUDProps> = ({ scoreConfig }) => {
  const { score, lives, combo, isFrenzy } = scoreConfig;
  const scoreProgressPct = Math.min(100, (score / SCORE_GOAL) * 100);

  return (
    <div
      className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between font-pixel box-border"
      style={{
        padding: 'clamp(8px, 2.5vw, 20px) clamp(12px, 4vw, 24px)',
      }}
    >
      {isFrenzy && (
        <div className="absolute top-0 left-0 right-0 flex justify-center z-20 pt-[clamp(4px,1.5vw,12px)]">
          <span
            className="frenzy-banner frenzy-banner-pulse px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-pink-400/95 text-black font-bold border-2 border-pink-200 uppercase tracking-wide"
            style={{
              fontFamily: "var(--font-pixel), 'Acknowledge TT', cursive",
              fontSize: 'clamp(0.75rem, 3.5vw, 1.25rem)',
            }}
          >
            ★ FRENZY MODE ★
          </span>
        </div>
      )}
      <div className="flex justify-between items-start w-full gap-2 min-h-0 flex-shrink-0">
        <div className="flex flex-col items-start min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-1 sm:gap-2 drop-shadow-[1px_1px_0_rgba(255,255,255,0.5)]">
            <span
              className="uppercase text-gray-400 flex-shrink-0"
              style={{ fontSize: 'clamp(0.65rem, 2.5vw, 0.95rem)' }}
            >
              Score
            </span>
            <span
              className="font-bold text-black tabular-nums"
              style={{
                fontSize: 'clamp(1.5rem, 8vw, 3.5rem)',
                lineHeight: 1.1,
              }}
            >
              {String(score).padStart(5, '0')}
            </span>
          </div>
          {combo > 0 && (
            <div
              className="mt-1 sm:mt-2 text-green-400 font-bold drop-shadow-[1px_1px_0_#FFF]"
              style={{ fontSize: 'clamp(0.8rem, 4vw, 1.5rem)' }}
            >
              {combo}x COMBO
            </div>
          )}
        </div>
        <div className="flex gap-0.5 sm:gap-1 items-center flex-shrink-0">
          {[1, 2, 3].map((i) => (
            <span
              key={i}
              className={`inline-block ${i <= lives ? 'opacity-100' : 'opacity-40'}`}
              style={{ width: 'clamp(20px, 6vw, 40px)', height: 'clamp(20px, 6vw, 40px)' }}
              aria-hidden
            >
              <PixelHeart filled={i <= lives} />
            </span>
          ))}
        </div>
      </div>

      <div className="w-full flex flex-col items-center flex-shrink-0 min-h-0 pb-[clamp(6px,2vw,16px)] pt-2">
        <div className="w-full max-w-[min(32rem,100%)] px-0.5">
          <div className="flex justify-between items-end mb-1 sm:mb-2 gap-1">
            <span
              className="font-bold text-gray-400 truncate"
              style={{ fontSize: 'clamp(0.6rem, 2.2vw, 0.9rem)' }}
            >
              Score goal: 100,000
            </span>
            <span
              className="text-gray-400 flex-shrink-0 tabular-nums"
              style={{ fontSize: 'clamp(0.6rem, 2.2vw, 0.9rem)' }}
            >
              {Math.floor(scoreProgressPct)}%
            </span>
          </div>
          <div
            className="w-full bg-neutral-800 border-2 border-white/30 rounded-full overflow-hidden"
            style={{
              minHeight: 'clamp(14px, 3.5vw, 28px)',
              height: 'clamp(14px, 3.5vw, 28px)',
            }}
          >
            <div
              className="h-full bg-gradient-to-r from-issy-pink to-issy-accent transition-all duration-150 rounded-full"
              style={{ width: `${scoreProgressPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HUD;
