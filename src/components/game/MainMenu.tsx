import React from 'react';

interface MainMenuProps {
  onStart: () => void;
  onHome?: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStart, onHome }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 font-pixel text-white p-4">
      <h1 className="text-3xl md:text-4xl text-issy-accent drop-shadow-[4px_4px_0_#FFF] mb-2 text-center">
        Fruit Slash
      </h1>
      <p className="text-sm text-gray-400 mb-6 text-center">
        Slice fruits, avoid bombs. Build combos and fill the Frenzy bar!
      </p>
      <button
        type="button"
        onClick={onStart}
        className="px-8 py-4 bg-issy-pink border-4 border-white rounded-lg font-bold shadow-[4px_4px_0_#FFF] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#FFF] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all"
      >
        PLAY
      </button>
      {onHome && (
        <button
          type="button"
          onClick={onHome}
          className="mt-4 px-6 py-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          Back to intro
        </button>
      )}
    </div>
  );
};

export default MainMenu;
