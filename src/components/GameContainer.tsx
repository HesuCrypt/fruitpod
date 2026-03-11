import React, { useState, useCallback } from 'react';
import GameCanvas, { type ScoreUpdatePayload } from './GameCanvas';
import HUD from './game/HUD';
import GameOver from './game/GameOver';
import HowToPlayScreen from './game/HowToPlayScreen';
import GameSettings from './game/GameSettings';

export type GameState = 'MENU' | 'PLAYING' | 'GAME_OVER';

interface GameContainerProps {
  onDone?: () => void;
}

const initialScoreConfig: ScoreUpdatePayload = {
  score: 0,
  lives: 3,
  combo: 0,
  frenzyProgress: 0,
  isFrenzy: false,
};

const GameContainer: React.FC<GameContainerProps> = ({ onDone }) => {
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [scoreConfig, setScoreConfig] = useState<ScoreUpdatePayload>(initialScoreConfig);
  const [whiteoutActive, setWhiteoutActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const handleBombHit = useCallback(() => {
    setWhiteoutActive(true);
    setTimeout(() => {
      setGameState('GAME_OVER');
      setWhiteoutActive(false);
    }, 200);
  }, []);

  const handleRestart = useCallback(() => {
    setGameState('PLAYING');
    setScoreConfig(initialScoreConfig);
    setIsPaused(false);
  }, []);

  const handleFinalPartBNext = useCallback(() => {
    setGameState('PLAYING');
    setScoreConfig(initialScoreConfig);
    setIsPaused(false);
  }, []);

  return (
    <div className="relative w-full h-full min-h-[100dvh] overflow-hidden bg-neutral-900">
      {/* Layer 1: Canvas */}
      <div className="absolute inset-0">
        <GameCanvas
          gameState={gameState}
          setGameState={setGameState}
          onScoreUpdate={setScoreConfig}
          onBombHit={handleBombHit}
          isPaused={isPaused}
        />
      </div>

      {/* Layer 2: UI Overlays */}
      {gameState === 'MENU' && (
        <HowToPlayScreen onNext={handleFinalPartBNext} />
      )}
      {gameState === 'PLAYING' && (
        <HUD 
          scoreConfig={scoreConfig} 
          isPaused={isPaused}
          onPause={() => setIsPaused((prev) => !prev)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      )}
      {gameState === 'GAME_OVER' && (
        <GameOver
          score={scoreConfig.score}
          onRestart={handleRestart}
          onHome={onDone ?? (() => setGameState('MENU'))}
        />
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <GameSettings 
          onClose={() => setIsSettingsOpen(false)}
          soundEnabled={soundEnabled}
          onSoundToggle={() => setSoundEnabled((prev) => !prev)}
        />
      )}

      {/* Bomb whiteout flash */}
      <div
        className={`absolute inset-0 bg-white pointer-events-none z-40 transition-opacity duration-75 ${whiteoutActive ? 'opacity-100' : 'opacity-0'
          }`}
        aria-hidden
      />
    </div>
  );
};

export default GameContainer;
