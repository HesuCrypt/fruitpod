/**
 * PhysicsSystem: gravity, velocity, movement, and screen bounds.
 * Mutates entities, sliced parts, particles, trail, floating texts in place.
 */

import type { GameEntity, SlicedPart, Particle } from '../../utils/gameUtils';
import type { TrailPoint, FloatingText } from '../entities/types';
import {
  GRAVITY,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  MISSED_Y_THRESHOLD,
  EDGE_INSET,
  TRAIL_DECAY,
  PARTICLE_LIFE_DECAY,
  FLOATING_TEXT_LIFE_DECAY,
  SHAKE_DECAY,
} from '../constants';

export function updateEntities(
  entities: GameEntity[],
  scale: number
): number[] {
  const offScreen: number[] = [];
  for (let i = 0; i < entities.length; i++) {
    const e = entities[i];
    e.x += e.vx * scale;
    e.y += e.vy * scale;
    e.vy += GRAVITY * scale;
    e.rotation += e.rotationSpeed * scale;
    e.x = Math.max(
      e.radius + EDGE_INSET,
      Math.min(CANVAS_WIDTH - e.radius - EDGE_INSET, e.x)
    );
    e.y = Math.min(CANVAS_HEIGHT + e.radius, e.y);
    if (e.y > MISSED_Y_THRESHOLD) offScreen.push(i);
  }
  return offScreen;
}

export function updateSlicedParts(parts: SlicedPart[], scale: number): void {
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    p.x += p.vx * scale;
    p.y += p.vy * scale;
    p.vy += GRAVITY * scale;
    p.rotation += p.rotationSpeed * scale;
  }
}

const SLICED_PART_MARGIN = 60;

export function filterSlicedPartsOffScreen(parts: SlicedPart[]): void {
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i];
    const offBottom = p.y > CANVAS_HEIGHT + p.radius + SLICED_PART_MARGIN;
    const offLeft = p.x < -p.radius - SLICED_PART_MARGIN;
    const offRight = p.x > CANVAS_WIDTH + p.radius + SLICED_PART_MARGIN;
    if (offBottom || offLeft || offRight) parts.splice(i, 1);
  }
}

export function updateParticles(particles: Particle[], scale: number): void {
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    p.vy += p.gravity * scale;
    p.vx *= Math.pow(p.drag, scale);
    p.vy *= Math.pow(p.drag, scale);
    p.x += p.vx * scale;
    p.y += p.vy * scale;
    p.life -= PARTICLE_LIFE_DECAY * scale;
  }
}

export function filterParticlesAlive(particles: Particle[]): void {
  for (let i = particles.length - 1; i >= 0; i--) {
    if (particles[i].life <= 0) particles.splice(i, 1);
  }
}

export function updateTrail(trail: TrailPoint[], scale: number): void {
  for (let i = 0; i < trail.length; i++) trail[i].life -= TRAIL_DECAY * scale;
}

export function filterTrailAlive(trail: TrailPoint[]): void {
  for (let i = trail.length - 1; i >= 0; i--) {
    if (trail[i].life <= 0) trail.splice(i, 1);
  }
}

export function updateFloatingTexts(texts: FloatingText[], scale: number): void {
  for (let i = 0; i < texts.length; i++) {
    const ft = texts[i];
    ft.y += ft.vy * scale;
    ft.vy *= Math.pow(0.95, scale);
    ft.life -= FLOATING_TEXT_LIFE_DECAY * scale;
  }
}

export function filterFloatingTextsAlive(texts: FloatingText[]): void {
  for (let i = texts.length - 1; i >= 0; i--) {
    if (texts[i].life <= 0) texts.splice(i, 1);
  }
}

export function decayShake(shake: number, scale: number): number {
  return Math.max(0, shake - SHAKE_DECAY * scale);
}
