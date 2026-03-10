/**
 * Renderer: draws all game objects and effects to the canvas.
 * Optimized for single ctx and minimal state reads per frame.
 */

import { EntityType } from '../../utils/gameUtils';
import type { GameEntity, SlicedPart, Particle } from '../../utils/gameUtils';
import type { TrailPoint, FloatingText } from '../entities/types';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PIXEL_FONT,
  FRUIT_COLOR,
  BOMB_COLOR,
  FRENZY_POP_IN_DURATION_MS,
} from '../constants';

export interface RenderAssets {
  fruitImages: (HTMLImageElement | null)[];
  bombImage: HTMLImageElement | null;
  frenzyImage: HTMLImageElement | null;
}

export interface RenderState {
  entities: GameEntity[];
  slicedParts: SlicedPart[];
  particles: Particle[];
  trail: TrailPoint[];
  floatingTexts: FloatingText[];
  shake: number;
  frenzyEndTime: number;
  frenzyActivationTime: number;
}

function drawFruitImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | null,
  radius: number,
  side?: 'left' | 'right'
): void {
  if (!img?.complete || img.naturalWidth === 0) {
    ctx.fillStyle = FRUIT_COLOR;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  const d = radius * 2;
  if (side !== undefined) {
    ctx.beginPath();
    if (side === 'left') ctx.rect(-radius, -radius, radius, d);
    else ctx.rect(0, -radius, radius, d);
    ctx.clip();
  }
  ctx.drawImage(img, -radius, -radius, d, d);
}

const FRENZY_LIGHT_COLORS = [
  [255, 100, 150],   // pink
  [255, 200, 100],   // orange
  [255, 255, 120],   // yellow
  [120, 255, 180],   // mint
  [100, 200, 255],   // cyan
  [200, 150, 255],   // purple
  [255, 150, 200],   // magenta
];

function drawFrenzyOverlay(ctx: CanvasRenderingContext2D, nowMs: number): void {
  const pulse = 0.08 + 0.05 * Math.sin(nowMs * 0.003);
  const flicker = 0.02 + 0.02 * Math.sin(nowMs * 0.012);
  ctx.fillStyle = `rgba(255, 215, 0, ${pulse})`;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = `rgba(255, 255, 220, ${flicker})`;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const lightIndex = Math.floor(nowMs / 80) % FRENZY_LIGHT_COLORS.length;
  const [r, g, b] = FRENZY_LIGHT_COLORS[lightIndex];
  const flash = 0.06 + 0.04 * Math.sin(nowMs * 0.02);
  ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${flash})`;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  const cornerFlash = 0.03 * (Math.sin(nowMs * 0.015) * 0.5 + 0.5);
  ctx.fillStyle = `rgba(255, 180, 255, ${cornerFlash})`;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const borderGlow = 0.5 + 0.35 * Math.sin(nowMs * 0.005);
  ctx.shadowColor = 'rgba(255, 200, 0, 0.9)';
  ctx.shadowBlur = 20 * borderGlow;
  ctx.strokeStyle = `rgba(255, 235, 0, ${borderGlow})`;
  ctx.lineWidth = 12;
  ctx.strokeRect(6, 6, CANVAS_WIDTH - 12, CANVAS_HEIGHT - 12);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = `rgba(255, 220, 0, ${0.4 + 0.3 * Math.sin(nowMs * 0.004)})`;
  ctx.lineWidth = 6;
  ctx.strokeRect(6, 6, CANVAS_WIDTH - 12, CANVAS_HEIGHT - 12);
}

function drawFrenzyCenterText(
  ctx: CanvasRenderingContext2D,
  nowMs: number,
  frenzyActivationTime: number
): void {
  const elapsedMs = nowMs - frenzyActivationTime;
  const elapsedSec = elapsedMs / 1000;
  const popProgress = Math.min(1, elapsedSec / (FRENZY_POP_IN_DURATION_MS / 1000));
  const easeOut = 1 - (1 - popProgress) * (1 - popProgress);
  const scale = 0.25 + easeOut * 1;
  const inPopIn = elapsedMs < FRENZY_POP_IN_DURATION_MS;
  const shake = inPopIn ? (Math.random() - 0.5) * 4 : 0;
  const cx = CANVAS_WIDTH / 2 + shake;
  const cy = CANVAS_HEIGHT / 2 + (inPopIn ? (Math.random() - 0.5) * 3 : 0);
  const glowFlicker = 0.7 + 0.3 * Math.sin(nowMs * 0.008);
  const fontSize = Math.min(52, 28 + (CANVAS_HEIGHT / 800) * 24);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold ${fontSize}px ${PIXEL_FONT}`;
  ctx.shadowColor = 'rgba(255, 235, 0, 0.9)';
  ctx.shadowBlur = 16 * glowFlicker;
  ctx.fillStyle = '#FFD700';
  ctx.fillText('FRENZY MODE', 0, 0);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(255, 200, 0, 0.8)';
  ctx.lineWidth = 3;
  ctx.strokeText('FRENZY MODE', 0, 0);
  ctx.fillStyle = '#FFF8DC';
  ctx.globalAlpha = 0.5 + 0.2 * Math.sin(nowMs * 0.006);
  ctx.fillText('FRENZY MODE', 0, 0);
  ctx.globalAlpha = 1;
  ctx.restore();
}

export function render(
  ctx: CanvasRenderingContext2D,
  state: RenderState,
  assets: RenderAssets
): void {
  const nowMs = Date.now();
  const isFrenzy = nowMs < state.frenzyEndTime;
  const shakeX = state.shake * (Math.random() - 0.5);
  const shakeY = state.shake * (Math.random() - 0.5);

  ctx.save();
  ctx.translate(shakeX, shakeY);

  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  if (isFrenzy) drawFrenzyOverlay(ctx, nowMs);
  ctx.fillStyle = '#fcfcfc';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const { fruitImages, bombImage, frenzyImage } = assets;

  for (let i = 0; i < state.entities.length; i++) {
    const e = state.entities[i];
    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.rotate(e.rotation);
    if (e.type === EntityType.BOMB) {
      if (bombImage?.complete && bombImage.naturalWidth > 0) {
        const d = e.radius * 2;
        ctx.drawImage(bombImage, -e.radius, -e.radius, d, d);
      } else {
        ctx.fillStyle = BOMB_COLOR;
        ctx.beginPath();
        ctx.arc(0, 0, e.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    } else if (e.type === EntityType.FRENZY_POWERUP) {
      if (frenzyImage?.complete && frenzyImage.naturalWidth > 0) {
        const d = e.radius * 2;
        ctx.drawImage(frenzyImage, -e.radius, -e.radius, d, d);
      } else {
        ctx.fillStyle = '#FFD700';
        ctx.shadowColor = '#FFEB3B';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(0, 0, e.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    } else {
      const img = fruitImages[e.imageIndex ?? 0] ?? null;
      drawFruitImage(ctx, img, e.radius);
    }
    ctx.restore();
  }

  for (let i = 0; i < state.slicedParts.length; i++) {
    const p = state.slicedParts[i];
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    const img = fruitImages[p.imageIndex ?? 0] ?? null;
    drawFruitImage(ctx, img, p.radius, p.side);
    ctx.restore();
  }

  for (let i = 0; i < state.particles.length; i++) {
    const p = state.particles[i];
    ctx.save();
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  const trail = state.trail;
  if (trail.length >= 2) {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const TRAIL_MAX_LIFE = 15;
    for (let i = 1; i < trail.length; i++) {
      const p = trail[i];
      const width = (p.life / TRAIL_MAX_LIFE) * 14;
      const alpha = p.life / TRAIL_MAX_LIFE;
      ctx.lineWidth = Math.max(2, width);
      ctx.save();
      if (isFrenzy) {
        const hue = ((i * 25 + nowMs * 0.15) % 360);
        const mainColor = `hsl(${hue}, 85%, 65%)`;
        const glowColor = `hsla(${hue}, 100%, 70%, 0.8)`;
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 16;
        ctx.globalAlpha = alpha * 0.95;
        ctx.strokeStyle = mainColor;
        ctx.beginPath();
        ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = alpha * 0.7;
        ctx.strokeStyle = `hsla(${hue}, 60%, 95%, 0.9)`;
        ctx.lineWidth = Math.max(1, width * 0.5);
        ctx.beginPath();
        ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      } else {
        ctx.shadowColor = '#ff9ebb';
        ctx.shadowBlur = 12;
        ctx.globalAlpha = alpha * 0.9;
        ctx.strokeStyle = '#ff9ebb';
        ctx.beginPath();
        ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.lineWidth = Math.max(1, width * 0.5);
        ctx.beginPath();
        ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  for (let i = 0; i < state.floatingTexts.length; i++) {
    const ft = state.floatingTexts[i];
    ctx.save();
    ctx.globalAlpha = ft.life;
    ctx.fillStyle = ft.color;
    ctx.font = `bold ${ft.size ?? 14}px ${PIXEL_FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.restore();
  }

  if (isFrenzy) {
    drawFrenzyCenterText(ctx, nowMs, state.frenzyActivationTime);
  }

  ctx.restore();
}
