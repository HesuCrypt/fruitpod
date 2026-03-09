import React, { useState, useCallback } from 'react';
import GameCanvas, { type ScoreUpdatePayload } from './GameCanvas';

interface GameScreenProps {
  onGameOver?: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ onGameOver }) => {
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);

  const handleScoreUpdate = useCallback((payload: ScoreUpdatePayload) => {
    setScore(payload.score);
    setCombo(payload.combo);
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col bg-white">
      <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center px-4 py-3 pointer-events-none">
        <div className="font-pixel text-sm text-gray-800">
          Score: <span className="text-issy-accent">{score}</span>
        </div>
        {combo > 0 && (
          <div className="font-pixel text-xs text-green-600">
            {combo}x COMBO
          </div>
        )}
      </div>
      {onGameOver && (
        <button
          type="button"
          onClick={onGameOver}
          className="absolute top-3 right-3 z-20 font-pixel text-xs px-2 py-1 bg-black/20 rounded pointer-events-auto"
        >
          Done
        </button>
      )}
      <GameCanvas onScoreUpdate={handleScoreUpdate} />
    </div>
  );
};

export default GameScreen;
