/**
 * SliceSystem: swipe-vs-entity collision and slice effects.
 * Produces removal indices, new sliced parts, particles, floating texts, and state updates.
 */

import {
  EntityType,
  swipeIntersectsCircle,
  createSlicedParts,
  createExplosion,
} from '../../utils/gameUtils';
import type { GameEntity, SlicedPart, Particle } from '../../utils/gameUtils';
import type { FloatingText } from '../entities/types';
import { spawnEntity } from '../../utils/gameUtils';
import {
  SWIPE_STEP_SIZE,
  JUICE_COLOR,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
} from '../constants';
import { computePoints, addFrenzyCharge } from './ScoreSystem';

export interface SliceResult {
  toRemove: number[];
  slicedParts: SlicedPart[];
  particles: Particle[];
  floatingTexts: FloatingText[];
  shake: number;
  livesDelta: number;
  activateFrenzy: boolean;
  scoreDelta: number;
  comboCount: number;
  comboTimer: number;
  frenzyCharge: number;
  spawnExtraFruits: GameEntity[];
  gameOver: boolean;
  freezeInputMs: number;
  bombExplosionAt: { x: number; y: number } | null;
}

export function processSwipe(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  entities: GameEntity[],
  state: {
    score: number;
    comboCount: number;
    comboTimer: number;
    lives: number;
    frenzyCharge: number;
    frenzyEndTime: number;
    time: number;
  }
): SliceResult {
  const result: SliceResult = {
    toRemove: [],
    slicedParts: [],
    particles: [],
    floatingTexts: [],
    shake: 0,
    livesDelta: 0,
    activateFrenzy: false,
    scoreDelta: 0,
    comboCount: state.comboCount,
    comboTimer: state.comboTimer,
    frenzyCharge: state.frenzyCharge,
    spawnExtraFruits: [],
    gameOver: false,
    freezeInputMs: 0,
    bombExplosionAt: null,
  };

  const now = Date.now();
  const isFrenzy = now < state.frenzyEndTime;
  let runningCombo = state.comboCount;
  let runningCharge = state.frenzyCharge;

  for (let i = 0; i < entities.length; i++) {
    const entity = entities[i];
    if (
      !swipeIntersectsCircle(
        p1,
        p2,
        { x: entity.x, y: entity.y, radius: entity.radius },
        SWIPE_STEP_SIZE
      )
    )
      continue;

    if (entity.type === EntityType.BOMB) {
      result.toRemove.push(i);
      result.bombExplosionAt = { x: entity.x, y: entity.y };
      result.particles.push(...createExplosion(entity.x, entity.y, '#555', 20));
      result.shake = 40;
      result.livesDelta = -1;
      result.gameOver = state.lives <= 1;
      result.freezeInputMs = result.gameOver ? 0 : 500;
      return result;
    }

    if (entity.type === EntityType.FRENZY_POWERUP) {
      result.toRemove.push(i);
      result.activateFrenzy = true;
      result.particles.push(
        ...createExplosion(entity.x, entity.y, '#FFD700', 24),
        ...createExplosion(entity.x, entity.y, '#FFEB3B', 12)
      );
      result.floatingTexts.push(
        {
          x: entity.x,
          y: entity.y - 30,
          text: 'FRENZY!',
          color: '#FFD700',
          life: 1.0,
          vy: -3,
          size: 32,
        },
        {
          x: entity.x,
          y: entity.y - 70,
          text: '★ CREME CHEEK ★',
          color: '#FFEB3B',
          life: 1.0,
          vy: -2.5,
          size: 18,
        }
      );
      result.frenzyCharge = 0;
      for (let j = 0; j < 3; j++) {
        result.spawnExtraFruits.push(
          spawnEntity(CANVAS_WIDTH, CANVAS_HEIGHT, true)
        );
      }
      return result;
    }

    if (entity.type === EntityType.FRUIT) {
      result.toRemove.push(i);
      result.slicedParts.push(...createSlicedParts(entity));
      result.particles.push(
        ...createExplosion(entity.x, entity.y, JUICE_COLOR, 14)
      );
      runningCombo += 1;
      result.comboCount = runningCombo;
      result.comboTimer = 60;
      const points = computePoints(runningCombo, isFrenzy);
      result.scoreDelta += points;
      runningCharge = addFrenzyCharge(runningCharge, points);
      result.frenzyCharge = runningCharge;
      result.floatingTexts.push({
        x: entity.x,
        y: entity.y - 24,
        text: `+${points}`,
        color: '#f9ed32',
        life: 1.0,
        vy: -2,
        size: 20,
      });
      if (runningCombo >= 3) {
        result.floatingTexts.push({
          x: entity.x,
          y: entity.y - 56,
          text: `${runningCombo}x COMBO!`,
          color: '#f9ed32',
          life: 1.0,
          vy: -3,
          size: 24,
        });
      }
    }
  }

  result.toRemove.sort((a, b) => b - a);
  return result;
}
