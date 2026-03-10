/**
 * Game utilities: math, spawning, collision, slicing, and dual-particle explosion.
 * All logic is pure/synchronous for use inside a requestAnimationFrame loop.
 */

export const randomRange = (min: number, max: number) =>
  Math.random() * (max - min) + min;

export const generateId = () => Math.random().toString(36).slice(2, 11);

/** Line-segment to circle: squared distance from circle center to segment. Hit if distSq < radius² */
export function lineIntersectsCircle(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  circle: { x: number; y: number; radius: number }
): boolean {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const lenSq = dx * dx + dy * dy;

  if (lenSq === 0) {
    const d = (circle.x - p1.x) ** 2 + (circle.y - p1.y) ** 2;
    return d < circle.radius * circle.radius;
  }

  const t = Math.max(
    0,
    Math.min(
      1,
      ((circle.x - p1.x) * dx + (circle.y - p1.y) * dy) / lenSq
    )
  );
  const closestX = p1.x + t * dx;
  const closestY = p1.y + t * dy;
  const distSq =
    (circle.x - closestX) ** 2 + (circle.y - closestY) ** 2;
  return distSq < circle.radius * circle.radius;
}

/**
 * Check swipe path from p1 to p2 against circle using stepped segments
 * so fast swipes don't miss. Step size ~min(radius, distance/4).
 */
export function swipeIntersectsCircle(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  circle: { x: number; y: number; radius: number },
  stepSize: number = 18
): boolean {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const len = Math.hypot(dx, dy);
  if (len <= 0) {
    return lineIntersectsCircle(p1, p2, circle);
  }
  const steps = Math.max(1, Math.ceil(len / stepSize));
  const inv = 1 / steps;
  let ax = p1.x;
  let ay = p1.y;
  for (let i = 1; i <= steps; i++) {
    const bx = p1.x + dx * (i * inv);
    const by = p1.y + dy * (i * inv);
    if (lineIntersectsCircle({ x: ax, y: ay }, { x: bx, y: by }, circle)) {
      return true;
    }
    ax = bx;
    ay = by;
  }
  return false;
}

export const EntityType = {
  FRUIT: 'fruit',
  BOMB: 'bomb',
  POWERUP: 'powerup',
  FRENZY_POWERUP: 'frenzy_powerup',
} as const;

export type EntityType = (typeof EntityType)[keyof typeof EntityType];

export interface GameEntity {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  radius: number;
  scale: number;
  type: EntityType;
  /** Index into fruit images array (0–4); only for FRUIT type */
  imageIndex?: number;
}

export interface SlicedPart {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  radius: number;
  scale: number;
  type: EntityType;
  side: 'left' | 'right';
  imageIndex?: number;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
  size: number;
  drag: number;
  gravity: number;
}

const SPLIT_SPEED = 3.5;

const BOMB_SPAWN_CHANCE = 0.12;
/** When allowCremeCheek is true, this chance is used (only one Creme Cheek per 60s in GameCanvas). */
const FRENZY_POWERUP_CHANCE = 1;

/**
 * Spawn from bottom of screen with upward velocity. Natural parabolic arc via gravity.
 * Randomize spawn angle, speed, and rotation for fluid Fruit Ninja–like movement.
 * isFrenzy: no bombs, no Creme Cheek, fruits only.
 * allowCremeCheek: when true and not isFrenzy, the next spawn may be Creme Cheek (caller enforces 60s cooldown).
 */
export function spawnEntity(
  canvasWidth: number,
  canvasHeight: number,
  isFrenzy: boolean = false,
  allowCremeCheek: boolean = false
): GameEntity {
  const radius = 48;
  const edgeInset = 28;
  const padding = radius + edgeInset;
  const x = randomRange(padding, canvasWidth - padding);
  const y = canvasHeight + randomRange(20, 60);

  const angle = -Math.PI / 2 + randomRange(-0.35, 0.35);
  const speed = randomRange(11, 16);
  const vx = Math.cos(angle) * speed * randomRange(0.06, 0.12);
  const vy = -Math.abs(Math.sin(angle) * speed);

  if (!isFrenzy && allowCremeCheek && Math.random() < FRENZY_POWERUP_CHANCE) {
    return {
      id: generateId(),
      x, y, vx, vy,
      rotation: randomRange(0, Math.PI * 2),
      rotationSpeed: randomRange(-0.15, 0.15),
      radius,
      scale: 1,
      type: EntityType.FRENZY_POWERUP,
    };
  }
  const isBomb = !isFrenzy && Math.random() < BOMB_SPAWN_CHANCE;
  const imageIndex = isBomb ? undefined : Math.floor(Math.random() * 5);

  return {
    id: generateId(),
    x, y, vx, vy,
    rotation: randomRange(0, Math.PI * 2),
    rotationSpeed: randomRange(-0.18, 0.18),
    radius,
    scale: 1,
    type: isBomb ? EntityType.BOMB : EntityType.FRUIT,
    imageIndex,
  };
}

/** Two halves for fruits only; bombs and frenzy power-up don't create sliced parts. */
export function createSlicedParts(entity: GameEntity): SlicedPart[] {
  if (entity.type === EntityType.BOMB || entity.type === EntityType.FRENZY_POWERUP) return [];
  const imageIndex = entity.imageIndex ?? 0;
  return [
    {
      id: generateId(),
      x: entity.x,
      y: entity.y,
      vx: entity.vx - SPLIT_SPEED,
      vy: entity.vy,
      rotation: entity.rotation,
      rotationSpeed: -0.2,
      radius: entity.radius,
      scale: entity.scale,
      type: entity.type,
      side: 'left',
      imageIndex,
    },
    {
      id: generateId(),
      x: entity.x,
      y: entity.y,
      vx: entity.vx + SPLIT_SPEED,
      vy: entity.vy,
      rotation: entity.rotation,
      rotationSpeed: 0.2,
      radius: entity.radius,
      scale: entity.scale,
      type: entity.type,
      side: 'right',
      imageIndex,
    },
  ];
}

/** 60% juice droplets (slower, drag 0.96, gravity 0.3), 40% sparks (faster, drag 0.90, gravity 0.1) */
export function createExplosion(
  x: number,
  y: number,
  color: string,
  count: number = 12
): Particle[] {
  const out: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const isDroplet = Math.random() < 0.6;
    const angle = randomRange(0, Math.PI * 2);
    const speed = isDroplet
      ? randomRange(2, 6)
      : randomRange(5, 12);
    out.push({
      id: generateId(),
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color,
      life: isDroplet ? randomRange(1.0, 1.5) : randomRange(0.5, 0.9),
      size: isDroplet ? randomRange(5, 9) : randomRange(3, 5),
      drag: isDroplet ? 0.96 : 0.9,
      gravity: isDroplet ? 0.3 : 0.1,
    });
  }
  return out;
}
