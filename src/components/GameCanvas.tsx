/**
 * GameCanvas: React wrapper for the game. Owns canvas, assets, and input;
 * delegates loop and game logic to GameEngine.
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { GameEngine } from '../game/core/GameEngine';
import { getCanvasCoords } from '../game/input/InputManager';
import type { RenderAssets } from '../game/rendering/Renderer';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  FRUIT_IMAGE_NAMES,
  BOMB_IMAGE_NAME,
  BOMB_EXPLOSION_IMAGE_NAME,
  FRENZY_IMAGE_NAME,
} from '../game/constants';

export type ScoreUpdatePayload = {
  score: number;
  lives: number;
  combo: number;
  frenzyProgress: number;
  isFrenzy: boolean;
};

interface GameCanvasProps {
  gameState: 'MENU' | 'PLAYING' | 'GAME_OVER';
  setGameState: (state: 'MENU' | 'PLAYING' | 'GAME_OVER') => void;
  onScoreUpdate?: (config: ScoreUpdatePayload) => void;
  onBombHit?: () => void;
  isPaused?: boolean;
}

const GameCanvas: React.FC<GameCanvasProps> = ({
  gameState,
  setGameState: _setGameState,
  onScoreUpdate,
  onBombHit,
  isPaused = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const assetsRef = useRef<RenderAssets>({
    fruitImages: [],
    bombImage: null,
    bombExplosionImage: null,
    frenzyImage: null,
  });
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const fruitImages = FRUIT_IMAGE_NAMES.map((name) => {
      const img = new Image();
      img.src = `/fruits/${encodeURIComponent(name)}`;
      return img;
    });
    const bombImg = new Image();
    bombImg.src = `/fruits/${encodeURIComponent(BOMB_IMAGE_NAME)}`;
    const bombExplosionImg = new Image();
    bombExplosionImg.src = `/fruits/${encodeURIComponent(BOMB_EXPLOSION_IMAGE_NAME)}`;
    const frenzyImg = new Image();
    frenzyImg.src = `/fruits/${encodeURIComponent(FRENZY_IMAGE_NAME)}`;
    assetsRef.current = {
      fruitImages,
      bombImage: bombImg,
      bombExplosionImage: bombExplosionImg,
      frenzyImage: frenzyImg,
    };
    engineRef.current = new GameEngine(
      () => assetsRef.current,
      {
        onScoreUpdate,
        onBombHit,
      }
    );
    return () => {
      engineRef.current?.stopLoop();
      engineRef.current = null;
    };
  }, [onScoreUpdate, onBombHit]);

  const prevGameStateRef = useRef<typeof gameState>(gameState);

  useEffect(() => {
    const engine = engineRef.current;
    const canvas = canvasRef.current;
    if (!engine || !canvas) return;

    const previousState = prevGameStateRef.current;
    prevGameStateRef.current = gameState;

    if (gameState !== 'PLAYING') {
      engine.stopLoop();
      engine.setContext(null);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    engine.setContext(ctx);

    const justEnteredPlaying = previousState !== 'PLAYING';
    if (justEnteredPlaying) engine.reset();

    if (isPaused) {
      engine.stopLoop();
    } else {
      engine.startLoop();
    }

    return () => {
      engine.stopLoop();
      engine.setContext(null);
    };
  }, [gameState, isPaused]);

  const toCanvas = useCallback((clientX: number, clientY: number) => {
    return getCanvasCoords(clientX, clientY, canvasRef.current);
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (gameState !== 'PLAYING') return;
      const p = toCanvas(e.clientX, e.clientY);
      lastPointRef.current = p;
      engineRef.current?.addTrailPoint(p.x, p.y);
    },
    [gameState, toCanvas]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!lastPointRef.current || !(e.buttons === 1 || e.pointerType === 'touch'))
        return;
      const p = toCanvas(e.clientX, e.clientY);
      engineRef.current?.handleSwipe(lastPointRef.current, p);
      engineRef.current?.addTrailPoint(p.x, p.y);
      lastPointRef.current = p;
    },
    [toCanvas]
  );

  const handlePointerUp = useCallback(() => {
    lastPointRef.current = null;
    engineRef.current?.clearTrail();
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      if (e.touches.length > 0) {
        const p = toCanvas(e.touches[0].clientX, e.touches[0].clientY);
        if (lastPointRef.current) {
          engineRef.current?.handleSwipe(lastPointRef.current, p);
          engineRef.current?.addTrailPoint(p.x, p.y);
        }
        lastPointRef.current = p;
      }
    },
    [toCanvas]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (gameState !== 'PLAYING' || e.touches.length === 0) return;
      const p = toCanvas(e.touches[0].clientX, e.touches[0].clientY);
      lastPointRef.current = p;
      engineRef.current?.addTrailPoint(p.x, p.y);
    },
    [gameState, toCanvas]
  );

  return (
    <div className="absolute inset-0 w-full h-full bg-white">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="block w-full h-full object-cover touch-none cursor-crosshair"
        style={{ touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handlePointerUp}
      />
    </div>
  );
};

export default GameCanvas;
