/**
 * GameEngine: main loop, systems orchestration, and state.
 * Runs requestAnimationFrame loop when playing; processes swipe and applies systems.
 */

import { EntityType } from '../../utils/gameUtils';
import {
  createGameState,
  resetGameState,
  activateFrenzy,
  type GameState,
} from './GameStateManager';
import { trySpawn } from '../systems/SpawnSystem';
import * as Physics from '../systems/PhysicsSystem';
import { processSwipe } from '../systems/SliceSystem';
import { tickCombo, frenzyProgress } from '../systems/ScoreSystem';
import { render, type RenderAssets } from '../rendering/Renderer';
import {
  TARGET_FPS,
  TRAIL_MAX_LIFE,
  SCORE_UPDATE_INTERVAL,
  MAX_ENTITIES,
  FRENZY_SPAWN_INTERVAL_BASE,
} from '../constants';
import type { Point } from '../input/InputManager';

export interface ScoreUpdatePayload {
  score: number;
  lives: number;
  combo: number;
  frenzyProgress: number;
  isFrenzy: boolean;
}

export interface GameEngineCallbacks {
  onScoreUpdate?: (payload: ScoreUpdatePayload) => void;
  onBombHit?: () => void;
}

export class GameEngine {
  private state: GameState;
  private callbacks: GameEngineCallbacks;
  private getAssets: () => RenderAssets;
  private ctx: CanvasRenderingContext2D | null = null;
  private rafId: number = 0;
  private lastFrameTime: number = 0;

  constructor(getAssets: () => RenderAssets, callbacks: GameEngineCallbacks) {
    this.state = createGameState();
    this.callbacks = callbacks;
    this.getAssets = getAssets;
  }

  setContext(ctx: CanvasRenderingContext2D | null): void {
    this.ctx = ctx;
  }

  reset(): void {
    resetGameState(this.state);
  }

  startLoop(): void {
    this.lastFrameTime = 0;
    const loop = (timestamp: number) => {
      this.tick(timestamp);
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  stopLoop(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
  }

  tick(timestamp: number): void {
    if (!this.ctx) return;

    const now = timestamp;
    const last = this.lastFrameTime || now;
    this.lastFrameTime = now;
    const dtSec = (now - last) / 1000;
    const scale = Math.min(dtSec * TARGET_FPS, 2.5);

    const s = this.state;
    s.time += scale;
    const nowMs = Date.now();
    const isFrenzy = nowMs < s.frenzyEndTime;

    if (s.gameOverFreezeUntil > 0 && nowMs >= s.gameOverFreezeUntil) {
      s.isGameOverProcessing = false;
      s.gameOverFreezeUntil = 0;
    }

    const spawnResult = trySpawn(
      s.time,
      s.spawn,
      s.entities.length,
      isFrenzy
    );
    if (spawnResult) {
      s.entities.push(spawnResult.entity);
      s.spawn.nextSpawnTime = spawnResult.nextSpawnTime;
      if (spawnResult.lastCremeCheekSpawnTime !== undefined) {
        s.spawn.lastCremeCheekSpawnTime = spawnResult.lastCremeCheekSpawnTime;
      }
      if (spawnResult.entity.type === EntityType.FRENZY_POWERUP) {
        s.spawn.nextSpawnTime = s.time + FRENZY_SPAWN_INTERVAL_BASE;
      }
    }

    tickCombo(s.combo, scale);

    const offScreen = Physics.updateEntities(s.entities, scale);
    for (let i = offScreen.length - 1; i >= 0; i--) {
      s.entities.splice(offScreen[i], 1);
    }

    Physics.updateSlicedParts(s.slicedParts, scale);
    Physics.filterSlicedPartsOffScreen(s.slicedParts);

    Physics.updateParticles(s.particles, scale);
    Physics.filterParticlesAlive(s.particles);

    Physics.updateTrail(s.trail, scale);
    Physics.filterTrailAlive(s.trail);

    Physics.updateFloatingTexts(s.floatingTexts, scale);
    Physics.filterFloatingTextsAlive(s.floatingTexts);

    s.shake = Physics.decayShake(s.shake, scale);

    if (Math.floor(s.time) % SCORE_UPDATE_INTERVAL === 0 && this.callbacks.onScoreUpdate) {
      this.callbacks.onScoreUpdate({
        score: s.score,
        lives: s.lives,
        combo: s.combo.count,
        frenzyProgress: frenzyProgress(isFrenzy, s.frenzyEndTime, s.frenzyCharge),
        isFrenzy,
      });
    }

    render(this.ctx, {
      entities: s.entities,
      slicedParts: s.slicedParts,
      particles: s.particles,
      trail: s.trail,
      floatingTexts: s.floatingTexts,
      shake: s.shake,
      frenzyEndTime: s.frenzyEndTime,
      frenzyActivationTime: s.frenzyActivationTime,
    }, this.getAssets());

  }

  handleSwipe(p1: Point, p2: Point): void {
    if (this.state.isGameOverProcessing) return;

    const sliceState = {
      score: this.state.score,
      comboCount: this.state.combo.count,
      comboTimer: this.state.combo.timer,
      lives: this.state.lives,
      frenzyCharge: this.state.frenzyCharge,
      frenzyEndTime: this.state.frenzyEndTime,
      time: this.state.time,
    };

    const result = processSwipe(p1, p2, this.state.entities, sliceState);

    for (let i = result.toRemove.length - 1; i >= 0; i--) {
      this.state.entities.splice(result.toRemove[i], 1);
    }
    this.state.slicedParts.push(...result.slicedParts);
    this.state.particles.push(...result.particles);
    this.state.floatingTexts.push(...result.floatingTexts);
    this.state.shake = result.shake;
    this.state.lives = Math.max(0, this.state.lives + result.livesDelta);
    this.state.score += result.scoreDelta;
    this.state.combo.count = result.comboCount;
    this.state.combo.timer = result.comboTimer;
    this.state.frenzyCharge = result.frenzyCharge;

    if (result.activateFrenzy) {
      activateFrenzy(this.state);
      for (let i = 0; i < result.spawnExtraFruits.length && this.state.entities.length < MAX_ENTITIES; i++) {
        this.state.entities.push(result.spawnExtraFruits[i]);
      }
      this.state.spawn.nextSpawnTime = this.state.time + FRENZY_SPAWN_INTERVAL_BASE;
    }

    if (result.gameOver) {
      this.state.isGameOverProcessing = true;
      this.callbacks.onBombHit?.();
    } else if (result.freezeInputMs > 0) {
      this.state.isGameOverProcessing = true;
      this.state.gameOverFreezeUntil = Date.now() + result.freezeInputMs;
    }
  }

  addTrailPoint(x: number, y: number): void {
    this.state.trail.push({ x, y, life: TRAIL_MAX_LIFE });
  }

  clearTrail(): void {
    this.state.trail.length = 0;
  }

  getState(): Readonly<GameState> {
    return this.state;
  }
}
