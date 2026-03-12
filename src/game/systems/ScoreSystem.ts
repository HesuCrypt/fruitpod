/**
 * ScoreSystem: combo timer, points calculation, frenzy charge.
 * No Frenzy activation from bar (Creme Cheek only); charge is for display only.
 */

import {
  BASE_SCORE,
  FRENZY_MAX_CHARGE,
  FRENZY_DURATION_MS,
  FRENZY_POINTS_TO_FULL,
} from '../constants';

export interface ComboState {
  count: number;
  timer: number;
}

export function createComboState(): ComboState {
  return { count: 0, timer: 60 };
}

export function tickCombo(state: ComboState, scale: number): void {
  state.timer -= scale;
  if (state.timer <= 0) state.count = 0;
}

export function addCombo(state: ComboState): void {
  state.count += 1;
  state.timer = 60;
}

export function computePoints(
  comboCount: number,
  isFrenzy: boolean
): number {
  const multiplier = Math.max(
    1,
    1 + Math.floor((comboCount - 1) / 3)
  );
  return BASE_SCORE * multiplier * (isFrenzy ? 2 : 1);
}

/** Progress bar fills at 10,000 points. Each slice adds (pointsEarned / 100) to charge (0–100). */
export function addFrenzyCharge(charge: number, pointsEarned: number): number {
  const add = (pointsEarned / FRENZY_POINTS_TO_FULL) * FRENZY_MAX_CHARGE;
  return Math.min(FRENZY_MAX_CHARGE, charge + add);
}

export function frenzyProgress(
  isFrenzy: boolean,
  frenzyEndTime: number,
  frenzyCharge: number
): number {
  if (isFrenzy) return (frenzyEndTime - Date.now()) / FRENZY_DURATION_MS;
  return frenzyCharge / FRENZY_MAX_CHARGE;
}
