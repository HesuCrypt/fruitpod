import React, { useEffect, useRef, useCallback } from 'react';
import {
  EntityType,
  lineIntersectsCircle,
  spawnEntity,
  createSlicedParts,
  createExplosion,
  type GameEntity,
  type SlicedPart,
  type Particle,
} from '../utils/gameUtils';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 800;
const GRAVITY = 0.1;
const TRAIL_MAX_LIFE = 15;
const TRAIL_DECAY = 1;
const SCORE_UPDATE_INTERVAL = 3;
const BASE_SCORE = 10;
const PARTICLE_LIFE_DECAY = 0.018;
const FLOATING_TEXT_LIFE_DECAY = 0.006;
const SPAWN_INTERVAL_FRAMES = 70;
const FRENZY_SPAWN_INTERVAL = 12;
const FRENZY_DURATION = 300;
const FRENZY_CHARGE_PER_SLICE = 4;
const FRENZY_CHARGE_BONUS_COMBO = 2;
const FRENZY_MAX_CHARGE = 100;
const MISSED_Y_THRESHOLD = CANVAS_HEIGHT + 100;
const SHAKE_DECAY = 2;

export interface ScoreUpdatePayload {
  score: number;
  lives: number;
  combo: number;
  frenzyProgress: number;
  isFrenzy: boolean;
}

interface GameCanvasProps {
  gameState: 'MENU' | 'PLAYING' | 'GAME_OVER';
  setGameState: (state: 'MENU' | 'PLAYING' | 'GAME_OVER') => void;
  onScoreUpdate?: (config: ScoreUpdatePayload) => void;
  onBombHit?: () => void;
}

interface TrailPoint {
  x: number;
  y: number;
  life: number;
}

interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  vy: number;
  size?: number;
}

const FRUIT_COLOR = '#e85d7a';
const BOMB_COLOR = '#333';
const JUICE_COLOR = '#ff9ebb';

const FRUIT_IMAGE_NAMES = [
  'GRAPES FULL.png',
  'NEW PEACH.png',
  'WATERMELON FULL.png',
  'STRAWBERRY.png',
  'FIG FULL.png',
];
const BOMB_IMAGE_NAME = 'BOMB.png';
const FRENZY_IMAGE_NAME = 'CREME CHEEK FRENZY.png';

const GameCanvas: React.FC<GameCanvasProps> = ({
  gameState,
  setGameState,
  onScoreUpdate,
  onBombHit,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const fruitImagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const bombImageRef = useRef<HTMLImageElement | null>(null);
  const frenzyImageRef = useRef<HTMLImageElement | null>(null);

  const entitiesRef = useRef<GameEntity[]>([]);
  const slicedPartsRef = useRef<SlicedPart[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const trailRef = useRef<TrailPoint[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const scoreRef = useRef(0);
  const comboRef = useRef({ count: 0, timer: 0 });
  const livesRef = useRef(3);
  const frenzyChargeRef = useRef(0);
  const frenzyTimerRef = useRef(0);
  const isGameOverProcessingRef = useRef(false);
  const shakeRef = useRef(0);
  const lastMousePosRef = useRef<{ x: number; y: number } | null>(null);
  const timeRef = useRef(0);

  const resetGame = useCallback(() => {
    entitiesRef.current = [];
    slicedPartsRef.current = [];
    particlesRef.current = [];
    trailRef.current = [];
    floatingTextsRef.current = [];
    scoreRef.current = 0;
    comboRef.current = { count: 0, timer: 0 };
    livesRef.current = 3;
    frenzyChargeRef.current = 0;
    frenzyTimerRef.current = 0;
    isGameOverProcessingRef.current = false;
    shakeRef.current = 0;
    lastMousePosRef.current = null;
    timeRef.current = 0;
  }, []);

  useEffect(() => {
    if (gameState === 'PLAYING') {
      resetGame();
    }
  }, [gameState, resetGame]);

  useEffect(() => {
    const images = FRUIT_IMAGE_NAMES.map((name) => {
      const img = new Image();
      img.src = `/fruits/${encodeURIComponent(name)}`;
      return img;
    });
    fruitImagesRef.current = images;
    const bombImg = new Image();
    bombImg.src = `/fruits/${encodeURIComponent(BOMB_IMAGE_NAME)}`;
    bombImageRef.current = bombImg;
    const frenzyImg = new Image();
    frenzyImg.src = `/fruits/${encodeURIComponent(FRENZY_IMAGE_NAME)}`;
    frenzyImageRef.current = frenzyImg;
    return () => {
      fruitImagesRef.current = [];
      bombImageRef.current = null;
      frenzyImageRef.current = null;
    };
  }, []);

  const getCanvasCoords = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }, []);

  const handleInput = useCallback(
    (rawX: number, rawY: number) => {
      if (
        gameState !== 'PLAYING' ||
        isGameOverProcessingRef.current
      )
        return;

      const { x, y } = getCanvasCoords(rawX, rawY);
      trailRef.current.push({ x, y, life: TRAIL_MAX_LIFE });

      const last = lastMousePosRef.current;
      lastMousePosRef.current = { x, y };
      if (!last) return;

      const p1 = last;
      const p2 = { x, y };
      const toRemove: number[] = [];

      entitiesRef.current.forEach((entity, index) => {
        if (
          !lineIntersectsCircle(p1, p2, {
            x: entity.x,
            y: entity.y,
            radius: entity.radius,
          })
        )
          return;

        if (entity.type === EntityType.BOMB) {
          toRemove.push(index);
          particlesRef.current.push(
            ...createExplosion(entity.x, entity.y, '#555', 20)
          );
          shakeRef.current = 40;
          livesRef.current = Math.max(0, livesRef.current - 1);
          if (livesRef.current <= 0) {
            isGameOverProcessingRef.current = true;
            onBombHit?.();
          } else {
            isGameOverProcessingRef.current = true;
            setTimeout(() => {
              isGameOverProcessingRef.current = false;
            }, 500);
          }
          return;
        }

        if (entity.type === EntityType.FRENZY_POWERUP) {
          toRemove.push(index);
          frenzyTimerRef.current = FRENZY_DURATION;
          frenzyChargeRef.current = 0;
          const gold = '#FFD700';
          const yellow = '#FFEB3B';
          particlesRef.current.push(
            ...createExplosion(entity.x, entity.y, gold, 24),
            ...createExplosion(entity.x, entity.y, yellow, 12)
          );
          floatingTextsRef.current.push({
            x: entity.x,
            y: entity.y - 30,
            text: 'FRENZY!',
            color: gold,
            life: 1.0,
            vy: -3,
            size: 32,
          });
          floatingTextsRef.current.push({
            x: entity.x,
            y: entity.y - 70,
            text: '★ CREME CHEEK ★',
            color: yellow,
            life: 1.0,
            vy: -2.5,
            size: 18,
          });
          return;
        }

        if (entity.type === EntityType.FRUIT) {
          toRemove.push(index);
          const parts = createSlicedParts(entity);
          slicedPartsRef.current.push(...parts);
          particlesRef.current.push(
            ...createExplosion(entity.x, entity.y, JUICE_COLOR, 14)
          );

          comboRef.current.count += 1;
          comboRef.current.timer = 60;
          const multiplier = Math.max(
            1,
            1 + Math.floor((comboRef.current.count - 1) / 3)
          );
          const isFrenzy = frenzyTimerRef.current > 0;
          const points = (BASE_SCORE * multiplier) * (isFrenzy ? 2 : 1);
          scoreRef.current += points;

          frenzyChargeRef.current = Math.min(
            FRENZY_MAX_CHARGE,
            frenzyChargeRef.current +
            FRENZY_CHARGE_PER_SLICE +
            (comboRef.current.count >= 3 ? FRENZY_CHARGE_BONUS_COMBO : 0)
          );
          if (frenzyChargeRef.current >= FRENZY_MAX_CHARGE) {
            frenzyTimerRef.current = FRENZY_DURATION;
            frenzyChargeRef.current = 0;
          }

          floatingTextsRef.current.push({
            x: entity.x,
            y: entity.y - 24,
            text: `+${points}`,
            color: '#FFD700',
            life: 1.0,
            vy: -2,
            size: 20,
          });
          if (comboRef.current.count >= 3) {
            floatingTextsRef.current.push({
              x: entity.x,
              y: entity.y - 56,
              text: `${comboRef.current.count}x COMBO!`,
              color: '#77DD77',
              life: 1.0,
              vy: -3,
              size: 24,
            });
          }
        }
      });

      for (let i = toRemove.length - 1; i >= 0; i--) {
        entitiesRef.current.splice(toRemove[i], 1);
      }
    },
    [getCanvasCoords, gameState, onBombHit]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || gameState !== 'PLAYING') return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const update = () => {
      if (gameState !== 'PLAYING') return;

      timeRef.current += 1;
      const t = timeRef.current;
      const isFrenzy = frenzyTimerRef.current > 0;

      if (isFrenzy) {
        frenzyTimerRef.current--;
        if (frenzyTimerRef.current <= 0) {
          frenzyChargeRef.current = 0;
        }
      }

      const spawnInterval = isFrenzy ? FRENZY_SPAWN_INTERVAL : SPAWN_INTERVAL_FRAMES;
      if (t % spawnInterval === 0) {
        entitiesRef.current.push(
          spawnEntity(CANVAS_WIDTH, CANVAS_HEIGHT, isFrenzy)
        );
      }

      comboRef.current.timer--;
      if (comboRef.current.timer <= 0) {
        comboRef.current.count = 0;
      }

      const gravityMult = 1;

      const offScreen: number[] = [];
      entitiesRef.current.forEach((e, i) => {
        e.x += e.vx;
        e.y += e.vy;
        e.vy += GRAVITY * gravityMult;
        e.rotation += e.rotationSpeed;

        if (e.y > MISSED_Y_THRESHOLD) {
          offScreen.push(i);
        }
      });
      for (let i = offScreen.length - 1; i >= 0; i--) {
        entitiesRef.current.splice(offScreen[i], 1);
      }

      slicedPartsRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += GRAVITY * gravityMult;
        p.rotation += p.rotationSpeed;
      });
      slicedPartsRef.current = slicedPartsRef.current.filter(
        (p) => p.y < CANVAS_HEIGHT + 50
      );

      particlesRef.current.forEach((p) => {
        p.vy += p.gravity;
        p.vx *= p.drag;
        p.vy *= p.drag;
        p.x += p.vx;
        p.y += p.vy;
        p.life -= PARTICLE_LIFE_DECAY;
      });
      particlesRef.current = particlesRef.current.filter((p) => p.life > 0);

      trailRef.current.forEach((p) => {
        p.life -= TRAIL_DECAY;
      });
      trailRef.current = trailRef.current.filter((p) => p.life > 0);

      floatingTextsRef.current.forEach((ft) => {
        ft.y += ft.vy;
        ft.vy *= 0.95;
        ft.life -= FLOATING_TEXT_LIFE_DECAY;
      });
      floatingTextsRef.current = floatingTextsRef.current.filter(
        (ft) => ft.life > 0
      );

      if (shakeRef.current > 0) {
        shakeRef.current = Math.max(0, shakeRef.current - SHAKE_DECAY);
      }

      if (t % SCORE_UPDATE_INTERVAL === 0 && onScoreUpdate) {
        const frenzyProgress =
          isFrenzy
            ? frenzyTimerRef.current / FRENZY_DURATION
            : frenzyChargeRef.current / FRENZY_MAX_CHARGE;
        onScoreUpdate({
          score: scoreRef.current,
          lives: livesRef.current,
          combo: comboRef.current.count,
          frenzyProgress,
          isFrenzy,
        });
      }

      const shakeX = shakeRef.current * (Math.random() - 0.5);
      const shakeY = shakeRef.current * (Math.random() - 0.5);
      ctx.save();
      ctx.translate(shakeX, shakeY);

      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      if (isFrenzy) {
        const pulse = 0.08 + 0.04 * Math.sin(t * 0.2);
        ctx.fillStyle = `rgba(255, 215, 0, ${pulse})`;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      }
      ctx.fillStyle = '#fcfcfc';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      const fruitImgs = fruitImagesRef.current;
      const drawFruitImage = (
        img: HTMLImageElement | null,
        radius: number,
        side?: 'left' | 'right'
      ) => {
        if (!img || !img.complete || img.naturalWidth === 0) {
          ctx.fillStyle = FRUIT_COLOR;
          ctx.beginPath();
          ctx.arc(0, 0, radius, 0, Math.PI * 2);
          ctx.fill();
          return;
        }
        const d = radius * 2;
        if (side !== undefined) {
          ctx.beginPath();
          if (side === 'left') {
            ctx.rect(-radius, -radius, radius, d);
          } else {
            ctx.rect(0, -radius, radius, d);
          }
          ctx.clip();
        }
        ctx.drawImage(img, -radius, -radius, d, d);
      };

      const bombImg = bombImageRef.current;
      const frenzyImg = frenzyImageRef.current;

      entitiesRef.current.forEach((e) => {
        ctx.save();
        ctx.translate(e.x, e.y);
        ctx.rotate(e.rotation);
        if (e.type === EntityType.BOMB) {
          if (bombImg?.complete && bombImg.naturalWidth > 0) {
            const d = e.radius * 2;
            ctx.drawImage(bombImg, -e.radius, -e.radius, d, d);
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
          if (frenzyImg?.complete && frenzyImg.naturalWidth > 0) {
            const d = e.radius * 2;
            ctx.drawImage(frenzyImg, -e.radius, -e.radius, d, d);
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
          const idx = e.imageIndex ?? 0;
          const img = fruitImgs[idx] ?? null;
          drawFruitImage(img, e.radius);
        }
        ctx.restore();
      });

      slicedPartsRef.current.forEach((p) => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        const idx = p.imageIndex ?? 0;
        const img = fruitImgs[idx] ?? null;
        drawFruitImage(img, p.radius, p.side);
        ctx.restore();
      });

      particlesRef.current.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      const trail = trailRef.current;
      if (trail.length >= 2) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        for (let i = 1; i < trail.length; i++) {
          const p = trail[i];
          const width = (p.life / TRAIL_MAX_LIFE) * 14;
          const alpha = p.life / TRAIL_MAX_LIFE;
          ctx.lineWidth = Math.max(2, width);

          ctx.save();
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
          ctx.restore();
        }
        ctx.globalAlpha = 1;
      }

      floatingTextsRef.current.forEach((ft) => {
        ctx.save();
        ctx.globalAlpha = ft.life;
        ctx.fillStyle = ft.color;
        ctx.font = `bold ${ft.size ?? 14}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      });

      ctx.restore();
      requestRef.current = requestAnimationFrame(update);
    };

    requestRef.current = requestAnimationFrame(update);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState, setGameState, onScoreUpdate]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (gameState !== 'PLAYING') return;
    const { x, y } = getCanvasCoords(e.clientX, e.clientY);
    lastMousePosRef.current = { x, y };
    trailRef.current.push({ x, y, life: TRAIL_MAX_LIFE });
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (e.buttons !== 1) return;
    handleInput(e.clientX, e.clientY);
  };

  const onPointerUp = () => {
    lastMousePosRef.current = null;
    trailRef.current = [];
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleInput(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (gameState !== 'PLAYING') return;
    if (e.touches.length > 0) {
      const { x, y } = getCanvasCoords(
        e.touches[0].clientX,
        e.touches[0].clientY
      );
      lastMousePosRef.current = { x, y };
      trailRef.current.push({ x, y, life: TRAIL_MAX_LIFE });
    }
  };

  return (
    <div className="absolute inset-0 w-full h-full bg-white">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="block w-full h-full object-cover touch-none cursor-crosshair"
        style={{ touchAction: 'none' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onPointerUp}
      />
    </div>
  );
};

export default GameCanvas;
