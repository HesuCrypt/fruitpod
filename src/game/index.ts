/**
 * Game module public API.
 */

export { GameEngine } from './core/GameEngine';
export type { ScoreUpdatePayload } from './core/GameEngine';
export { getCanvasCoords } from './input/InputManager';
export type { Point } from './input/InputManager';
export * from './constants';
