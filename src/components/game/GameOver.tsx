import React from 'react';

interface GameOverProps {
  score: number;
  onRestart: () => void;
  onHome: () => void;
}

const GameOver: React.FC<GameOverProps> = ({
  score,
  onRestart,
  onHome,
}) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-50 font-pixel text-white backdrop-blur-sm p-4">
      <h2 className="text-4xl text-issy-accent mb-4 drop-shadow-[4px_4px_0_#FFF]">
        GAME OVER
      </h2>
      <div className="bg-neutral-800 text-white p-6 border-4 border-issy-pink rounded-lg shadow-lg mb-8 text-center w-full max-w-sm">
        <p className="text-sm mb-2 uppercase text-gray-400">Final Score</p>
        <p className="text-5xl text-white drop-shadow-[2px_2px_0_#FF69B4]">
          {score}
        </p>
      </div>
      <div className="flex gap-4">
        <button
          type="button"
          onClick={onHome}
          className="px-6 py-3 bg-neutral-700 border-2 border-white rounded-lg hover:bg-neutral-600 transition-colors"
        >
          Home
        </button>
        <button
          type="button"
          onClick={onRestart}
          className="px-8 py-3 bg-green-600 border-2 border-white rounded-lg hover:bg-green-500 transition-colors font-bold"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

export default GameOver;
