/**
 * SpawnSystem: controls when and what to spawn (fruits, bombs, Creme Cheek).
 * Enforces Creme Cheek 60s cooldown and max entities.
 */

import { spawnEntity } from '../../utils/gameUtils';
import type { GameEntity } from '../../utils/gameUtils';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  MAX_ENTITIES,
  SPAWN_INTERVAL_BASE,
  SPAWN_INTERVAL_VARIANCE,
  FRENZY_SPAWN_INTERVAL_BASE,
  FRENZY_SPAWN_VARIANCE,
  CREME_CHEEK_COOLDOWN_MS,
} from '../constants';
import { EntityType } from '../../utils/gameUtils';

export interface SpawnState {
  nextSpawnTime: number;
  lastCremeCheekSpawnTime: number;
}

export function createSpawnState(): SpawnState {
  return {
    nextSpawnTime: 8,
    lastCremeCheekSpawnTime: Date.now(),
  };
}

export function resetSpawnState(state: SpawnState): void {
  state.nextSpawnTime = 8;
  state.lastCremeCheekSpawnTime = Date.now();
}

/**
 * Returns a new entity to spawn, or null if no spawn this frame.
 * gameTime: current game time (accumulated scale).
 */
export function trySpawn(
  gameTime: number,
  spawnState: SpawnState,
  entityCount: number,
  isFrenzy: boolean
): { entity: GameEntity; nextSpawnTime: number; lastCremeCheekSpawnTime?: number } | null {
  if (entityCount >= MAX_ENTITIES) return null;
  if (gameTime < spawnState.nextSpawnTime) return null;

  const nowMs = Date.now();
  const allowCremeCheek =
    !isFrenzy && nowMs - spawnState.lastCremeCheekSpawnTime >= CREME_CHEEK_COOLDOWN_MS;
  const entity = spawnEntity(CANVAS_WIDTH, CANVAS_HEIGHT, isFrenzy, allowCremeCheek);

  const baseInterval = isFrenzy ? FRENZY_SPAWN_INTERVAL_BASE : SPAWN_INTERVAL_BASE;
  const variance = isFrenzy ? FRENZY_SPAWN_VARIANCE : SPAWN_INTERVAL_VARIANCE;
  const nextSpawnTime =
    gameTime + baseInterval + (Math.random() * 2 - 1) * variance;

  const result: {
    entity: GameEntity;
    nextSpawnTime: number;
    lastCremeCheekSpawnTime?: number;
  } = { entity, nextSpawnTime };
  if (entity.type === EntityType.FRENZY_POWERUP) {
    result.lastCremeCheekSpawnTime = nowMs;
  }
  return result;
}
