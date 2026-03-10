/**
 * GameStateManager: holds all mutable game state (refs) and reset.
 * Single place to reset when entering PLAYING.
 */

import type { GameEntity, SlicedPart, Particle } from '../../utils/gameUtils';
import type { TrailPoint, FloatingText } from '../entities/types';
import type { SpawnState } from '../systems/SpawnSystem';
import type { ComboState } from '../systems/ScoreSystem';
import { FRENZY_DURATION_MS } from '../constants';

export interface GameState {
  entities: GameEntity[];
  slicedParts: SlicedPart[];
  particles: Particle[];
  trail: TrailPoint[];
  floatingTexts: FloatingText[];
  score: number;
  combo: ComboState;
  lives: number;
  frenzyCharge: number;
  frenzyEndTime: number;
  frenzyActivationTime: number;
  spawn: SpawnState;
  time: number;
  shake: number;
  isGameOverProcessing: boolean;
  gameOverFreezeUntil: number;
}

export function createGameState(): GameState {
  const now = Date.now();
  return {
    entities: [],
    slicedParts: [],
    particles: [],
    trail: [],
    floatingTexts: [],
    score: 0,
    combo: { count: 0, timer: 60 },
    lives: 3,
    frenzyCharge: 0,
    frenzyEndTime: 0,
    frenzyActivationTime: 0,
    spawn: {
      nextSpawnTime: 15,
      lastCremeCheekSpawnTime: now,
    },
    time: 0,
    shake: 0,
    isGameOverProcessing: false,
    gameOverFreezeUntil: 0,
  };
}

export function resetGameState(state: GameState): void {
  const now = Date.now();
  state.entities.length = 0;
  state.slicedParts.length = 0;
  state.particles.length = 0;
  state.trail.length = 0;
  state.floatingTexts.length = 0;
  state.score = 0;
  state.combo.count = 0;
  state.combo.timer = 60;
  state.lives = 3;
  state.frenzyCharge = 0;
  state.frenzyEndTime = 0;
  state.frenzyActivationTime = 0;
  state.spawn.nextSpawnTime = 15;
  state.spawn.lastCremeCheekSpawnTime = now;
  state.time = 0;
  state.shake = 0;
  state.isGameOverProcessing = false;
  state.gameOverFreezeUntil = 0;
}

export function activateFrenzy(state: GameState): void {
  const now = Date.now();
  state.frenzyEndTime = now + FRENZY_DURATION_MS;
  state.frenzyActivationTime = now;
  state.frenzyCharge = 0;
}
