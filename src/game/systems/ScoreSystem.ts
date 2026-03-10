/**
 * ScoreSystem: combo timer, points calculation, frenzy charge.
 * No Frenzy activation from bar (Creme Cheek only); charge is for display only.
 */

import {
  BASE_SCORE,
  FRENZY_CHARGE_PER_SLICE,
  FRENZY_CHARGE_BONUS_COMBO,
  FRENZY_MAX_CHARGE,
  FRENZY_DURATION_MS,
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

export function addFrenzyCharge(
  charge: number,
  comboCount: number
): number {
  return Math.min(
    FRENZY_MAX_CHARGE,
    charge +
      FRENZY_CHARGE_PER_SLICE +
      (comboCount >= 3 ? FRENZY_CHARGE_BONUS_COMBO : 0)
  );
}

export function frenzyProgress(
  isFrenzy: boolean,
  frenzyEndTime: number,
  frenzyCharge: number
): number {
  if (isFrenzy) return (frenzyEndTime - Date.now()) / FRENZY_DURATION_MS;
  return frenzyCharge / FRENZY_MAX_CHARGE;
}
