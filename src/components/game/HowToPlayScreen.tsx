import React, { useState, useRef, useEffect } from 'react';
import arrowBefore from '../../assets/Fruit Jam Arrow Files_Before Click.png';
import arrowAfter from '../../assets/Fruit Jam Arrow After Click.png';

const SKIP_TUTORIAL_KEY = 'issy_skip_how_to_play';
const FINAL_PART_B_VIDEO = encodeURI('/FINAL PART B_SLIDE 3.mp4');

interface HowToPlayScreenProps {
  onNext: (dontShowAgain: boolean) => void;
}

export function getSkipTutorial(): boolean {
  return typeof window !== 'undefined' && !!localStorage.getItem(SKIP_TUTORIAL_KEY);
}

export function setSkipTutorial(skip: boolean): void {
  if (typeof window === 'undefined') return;
  if (skip) localStorage.setItem(SKIP_TUTORIAL_KEY, '1');
  else localStorage.removeItem(SKIP_TUTORIAL_KEY);
}

const HowToPlayScreen: React.FC<HowToPlayScreenProps> = ({ onNext }) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [arrowPressed, setArrowPressed] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.play().catch(() => setVideoError(true));
  }, []);

  useEffect(() => {
    if (videoError) {
      const t = setTimeout(() => onNext(false), 800);
      return () => clearTimeout(t);
    }
  }, [videoError, onNext]);

  const handleNext = () => {
    if (dontShowAgain) setSkipTutorial(true);
    onNext(dontShowAgain);
  };

  return (
    <div className="absolute inset-0 z-20 flex flex-col overflow-hidden bg-issy-pink font-pixel">
      <video
        ref={videoRef}
        src={FINAL_PART_B_VIDEO}
        preload="auto"
        className={`absolute inset-0 w-full h-full object-cover pixelated transition-opacity duration-300 ${videoReady && !videoError ? 'opacity-100' : 'opacity-0'}`}
        playsInline
        muted
        autoPlay
        loop
        onLoadedData={() => setVideoReady(true)}
        onCanPlay={() => setVideoReady(true)}
        onError={() => setVideoError(true)}
      />

      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 pb-6 pt-8 bg-gradient-to-t from-black/60 to-transparent pointer-events-none">
        <div className="pointer-events-auto">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-5 h-5 rounded border-2 border-white accent-issy-accent"
            />
            <span className="text-xs sm:text-sm uppercase text-white drop-shadow-[1px_1px_0_rgba(0,0,0,0.8)]">
              Do not show again
            </span>
          </label>
        </div>
        <button
          type="button"
          onClick={handleNext}
          onPointerDown={() => setArrowPressed(true)}
          onPointerUp={() => setArrowPressed(false)}
          onPointerLeave={() => setArrowPressed(false)}
          className="pointer-events-auto flex-shrink-0 w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center transition-transform active:scale-95"
          aria-label="Next"
        >
          <img
            src={arrowPressed ? arrowAfter : arrowBefore}
            alt=""
            className="w-full h-full object-contain pixelated pointer-events-none select-none"
            draggable={false}
          />
        </button>
      </div>
    </div>
  );
};

export default HowToPlayScreen;
