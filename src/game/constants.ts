/**
 * Central game constants. Single source of truth for tuning and dimensions.
 */

export const CANVAS_WIDTH = 600;
export const CANVAS_HEIGHT = 800;

export const GRAVITY = 0.1;
export const TARGET_FPS = 60;

export const TRAIL_MAX_LIFE = 15;
export const TRAIL_DECAY = 1;
export const SCORE_UPDATE_INTERVAL = 3;
export const BASE_SCORE = 10;
export const PARTICLE_LIFE_DECAY = 0.018;
export const FLOATING_TEXT_LIFE_DECAY = 0.006;

export const SPAWN_INTERVAL_BASE = 17.5;
export const SPAWN_INTERVAL_VARIANCE = 6;
export const FRENZY_SPAWN_INTERVAL_BASE = 1.5;
export const FRENZY_SPAWN_VARIANCE = 0.5;
export const FRENZY_DURATION_MS = 10_000;
export const CREME_CHEEK_COOLDOWN_MS = 60_000;
/** Progress bar fills when frenzy points reach this (points from slicing). */
export const FRENZY_POINTS_TO_FULL = 10_000;
export const FRENZY_MAX_CHARGE = 100;
export const FRENZY_POP_IN_DURATION_MS = 400;

export const MISSED_Y_THRESHOLD = CANVAS_HEIGHT + 30;
export const EDGE_INSET = 36;
export const SHAKE_DECAY = 2;
export const MAX_ENTITIES = 18;
export const SWIPE_STEP_SIZE = 18;

export const PIXEL_FONT = "'Acknowledge TT', cursive";

export const FRUIT_COLOR = '#e85d7a';
export const BOMB_COLOR = '#333';
export const JUICE_COLOR = '#ff9ebb';

export const FRUIT_IMAGE_NAMES = [
  'GRAPES FULL.png',
  'NEW PEACH.png',
  'WATERMELON FULL.png',
  'STRAWBERRY.png',
  'FIG FULL.png',
] as const;

export const BOMB_IMAGE_NAME = 'BOMB.png';
export const BOMB_EXPLOSION_IMAGE_NAME = 'BOMB EXPLOSION 2.png';
export const BOMB_EXPLOSION_DURATION_MS = 500;
export const FRENZY_IMAGE_NAME = 'CREME CHEEK FRENZY.png';

export const UI_SETTINGS_BUTTON = 'SETTINGS BUTTON.png';
export const UI_PAUSE_BUTTON = 'PAUSE BUTTON.png';
export const UI_SOUND = 'SOUND.png';
export const UI_MUTE = 'MUTE.png';
export const UI_ESSENCE_BAR_ART = 'ESSENCE BAR ART WITH BG.png';

export const SCORE_GOAL = 100_000;
