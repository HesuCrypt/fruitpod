import React from 'react';
import { UI_SOUND, UI_MUTE } from '../../game/constants';

interface GameSettingsProps {
  onClose: () => void;
  soundEnabled: boolean;
  onSoundToggle: () => void;
}

const GameSettings: React.FC<GameSettingsProps> = ({
  onClose,
  soundEnabled,
  onSoundToggle,
}) => {
  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 font-pixel"
      onClick={onClose}
      role="dialog"
      aria-label="Game settings"
    >
      <div
        className="relative rounded-xl bg-white p-6 shadow-xl max-w-sm w-[90%] border-2 border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-center text-gray-800 uppercase mb-6">
          Settings
        </h2>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700 uppercase text-sm">Sound</span>
            <button
              type="button"
              onClick={onSoundToggle}
              className="w-14 h-14 flex items-center justify-center overflow-hidden bg-transparent p-0 touch-manipulation hover:opacity-90 transition-opacity"
              aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
            >
              <img
                src={`/fruits/${encodeURIComponent(soundEnabled ? UI_SOUND : UI_MUTE)}`}
                alt=""
                className="w-full h-full object-contain"
              />
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-8 w-full py-3 rounded-lg bg-issy-accent text-white font-bold uppercase text-sm hover:opacity-90 transition-opacity touch-manipulation"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default GameSettings;
