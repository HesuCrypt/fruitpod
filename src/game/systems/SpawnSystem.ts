/**
 * SpawnSystem: controls when and what to spawn (fruits, bombs, Creme Cheek).
 * Double fruit spawn, double bomb spawn; frenzy: double spam + fruit from top.
 */

import { spawnEntity, spawnEntityFromTop, spawnBomb } from '../../utils/gameUtils';
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
 * Returns entities to spawn (1 or 2; frenzy may add from-top fruit), or null if no spawn this frame.
 */
export function trySpawn(
  gameTime: number,
  spawnState: SpawnState,
  entityCount: number,
  isFrenzy: boolean
): { entities: GameEntity[]; nextSpawnTime: number; lastCremeCheekSpawnTime?: number } | null {
  if (entityCount >= MAX_ENTITIES) return null;
  if (gameTime < spawnState.nextSpawnTime) return null;

  const nowMs = Date.now();
  const allowCremeCheek =
    !isFrenzy && nowMs - spawnState.lastCremeCheekSpawnTime >= CREME_CHEEK_COOLDOWN_MS;
  const entity = spawnEntity(CANVAS_WIDTH, CANVAS_HEIGHT, isFrenzy, allowCremeCheek);

  const entities: GameEntity[] = [entity];
  if (entity.type === EntityType.FRUIT && entityCount + 1 < MAX_ENTITIES) {
    entities.push(spawnEntity(CANVAS_WIDTH, CANVAS_HEIGHT, isFrenzy, false));
  }
  if (entity.type === EntityType.BOMB && entityCount + entities.length < MAX_ENTITIES) {
    entities.push(spawnBomb(CANVAS_WIDTH, CANVAS_HEIGHT));
  }
  if (isFrenzy && entity.type === EntityType.FRUIT && entityCount + entities.length < MAX_ENTITIES) {
    entities.push(spawnEntityFromTop(CANVAS_WIDTH, CANVAS_HEIGHT));
  }

  const baseInterval = isFrenzy ? FRENZY_SPAWN_INTERVAL_BASE : SPAWN_INTERVAL_BASE;
  const variance = isFrenzy ? FRENZY_SPAWN_VARIANCE : SPAWN_INTERVAL_VARIANCE;
  const nextSpawnTime =
    gameTime + baseInterval + (Math.random() * 2 - 1) * variance;

  const result: {
    entities: GameEntity[];
    nextSpawnTime: number;
    lastCremeCheekSpawnTime?: number;
  } = { entities, nextSpawnTime };
  if (entity.type === EntityType.FRENZY_POWERUP) {
    result.lastCremeCheekSpawnTime = nowMs;
  }
  return result;
}
