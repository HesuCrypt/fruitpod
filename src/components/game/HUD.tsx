import React from 'react';
import type { ScoreUpdatePayload } from '../GameCanvas';
import { UI_ESSENCE_BAR_ART } from '../../game/constants';

interface HUDProps {
  scoreConfig: ScoreUpdatePayload;
  isPaused: boolean;
  onPause: () => void;
  onOpenSettings: () => void;
}


function formatScore(score: number): string {
  return score.toLocaleString();
}

/** Pixel-art heart — improved look with outline and shine */
function PixelHeart({ filled }: { filled: boolean }) {
  const c = filled ? '#c33c65' : '#6b7280';
  const stroke = '#3f2832';
  return (
    <svg viewBox="0 0 9 8" className="w-full h-full drop-shadow-sm" style={{ imageRendering: 'pixelated' }}>
      <path fill={stroke} d="M2,0 h2 v1 h-2 z M5,0 h2 v1 h-2 z M1,1 h1 v1 h-1 z M4,1 h1 v1 h-1 z M7,1 h1 v1 h-1 z M0,2 h1 v2 h-1 z M8,2 h1 v2 h-1 z M1,4 h1 v1 h-1 z M7,4 h1 v1 h-1 z M2,5 h1 v1 h-1 z M6,5 h1 v1 h-1 z M3,6 h1 v1 h-1 z M5,6 h1 v1 h-1 z M4,7 h1 v1 h-1 z" />
      <path fill={c} d="M2,1 h2 v1 h-2 z M5,1 h2 v1 h-2 z M1,2 h7 v2 h-7 z M2,4 h5 v1 h-5 z M3,5 h3 v1 h-3 z M4,6 h1 v1 h-1 z" />
      {filled && <rect x="2" y="2" width="1" height="1" fill="#fdb8c5" />}
    </svg>
  );
}

const HUD: React.FC<HUDProps> = ({ scoreConfig, isPaused, onPause, onOpenSettings }) => {
  const { score, lives, combo, isFrenzy } = scoreConfig;

  return (
    <div
      className="absolute inset-0 z-10 flex flex-col justify-between font-pixel box-border pointer-events-none"
      style={{
        paddingTop: 'clamp(28px, 10vw, 64px)',
        paddingRight: 'clamp(12px, 4vw, 24px)',
        paddingBottom: 'clamp(8px, 2.5vw, 20px)',
        paddingLeft: 'clamp(12px, 4vw, 24px)',
      }}
    >
      {isFrenzy && (
        <div className="absolute top-0 left-0 right-0 flex justify-center z-20 pt-[clamp(4px,1.5vw,12px)] pointer-events-none">
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

      {/* Top: score left, hearts + controls right */}
      <div className="flex justify-between items-start w-full gap-4 flex-nowrap flex-shrink-0">
        <div className="flex flex-col justify-start items-start min-w-0 flex-1 pointer-events-none gap-0.5">
          <div
            className="font-bold tabular-nums uppercase leading-none"
            style={{
              fontSize: 'clamp(26px, 7.5vw, 48px)',
            }}
          >
            <span style={{ color: '#db8cb5' }}>SCORE: </span>
            <span style={{ color: '#db584a' }}>{formatScore(score)}</span>
          </div>
          <div
            className="font-bold uppercase leading-none"
            style={{
              fontSize: 'clamp(20px, 5.5vw, 36px)',
              visibility: combo > 0 ? 'visible' : 'hidden',
              color: '#f9ed32',
            }}
          >
            {combo}X COMBO
          </div>
        </div>

        {/* Right: hearts with vertical Settings / Pause controls below (static, non-interactive) */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <div className="flex items-center gap-1 pointer-events-none">
            {[1, 2, 3].map((i) => (
              <span
                key={i}
                className={`inline-block flex-shrink-0 ${i <= lives ? 'opacity-100' : 'opacity-40'}`}
                style={{
                  width: 'clamp(22px, 6vw, 40px)',
                  height: 'clamp(22px, 6vw, 40px)',
                }}
                aria-hidden
              >
                <PixelHeart filled={i <= lives} />
              </span>
            ))}
          </div>

          {/* Settings / Pause — manually coded red/pink bg, dark border, white icon */}
          <div className="flex flex-col gap-2 mt-2 pointer-events-auto">
            <button
              onClick={onOpenSettings}
              className="flex items-center justify-center rounded-lg text-white font-bold cursor-pointer hover:scale-105 active:scale-95 transition-transform"
              style={{
                width: 'clamp(36px, 8vw, 48px)',
                height: 'clamp(36px, 8vw, 48px)',
                fontSize: 'clamp(18px, 5vw, 24px)',
                backgroundColor: '#e85d7a',
                border: '3px solid #8b3a4a',
                boxShadow: '0 4px 0 #8b3a4a',
                paddingBottom: '2px', // visually center text given the box-shadow
              }}
              aria-label="Settings"
            >
              ⚙
            </button>
            <button
              onClick={onPause}
              className="flex items-center justify-center rounded-lg text-white font-bold cursor-pointer hover:scale-105 active:scale-95 transition-transform"
              style={{
                width: 'clamp(36px, 8vw, 48px)',
                height: 'clamp(36px, 8vw, 48px)',
                fontSize: 'clamp(16px, 4.5vw, 22px)',
                backgroundColor: '#e85d7a',
                border: '3px solid #8b3a4a',
                boxShadow: '0 4px 0 #8b3a4a',
                paddingBottom: '2px',
              }}
              aria-label={isPaused ? "Resume" : "Pause"}
            >
              II
            </button>
          </div>
        </div>
      </div>

      {/* ESSENCE BAR ART — placement (see line numbers in this comment)
        • Line 135: outer wrapper — vertical position
          - pb-[clamp(8px,2.5vw,20px)] = space from bottom (increase to move bar higher)
          - pt-3 = space above bar (e.g. pt-6 = more gap)
        • Line 136: inner wrapper — size and horizontal position
          - w-[140%] = width (e.g. 160% = bigger, 100% = screen width)
          - -mx-[20%] = centers when w>100% (e.g. w-[160%] use -mx-[30%])
          - Add -ml-4 or mr-4 to nudge left/right
      */}
      <div className="w-full flex flex-col items-center flex-shrink-0 min-h-0 pb-[clamp(12px,3vw,20px)] pt-1 pointer-events-none">
        <div className="relative w-[120%] max-w-[none] -mx-[20%] flex flex-col items-center gap-1">
          <img
            src={`/fruits/${encodeURIComponent(UI_ESSENCE_BAR_ART)}`}
            alt=""
            className="w-full h-auto object-contain z-10"
          />
          {/* Progress Bar (50,000 points) */}
          <div
            className="rounded-full bg-white overflow-hidden shadow-sm"
            style={{
              border: '2px solid #c33c65',
              position: 'relative',
              top: '-75px',
              left: '-45px',
              width: '240px',   // adjust the length here
              height: '18px',   // adjust the thickness here
            }}
          >
            <div
              className="h-full transition-all duration-300 ease-out"
              style={{
                width: `${Math.min(100, (score / 50000) * 100)}%`,
                backgroundColor: '#c33c65',
              }}
            />
          </div>
        </div>
      </div>

    </div>
  );
};

export default HUD;
