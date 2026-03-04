import React, { useState, useRef, useEffect, useCallback } from 'react';

import grapesImg from '../assets/fruits/GRAPES FULL.png';
import peachImg from '../assets/fruits/NEW PEACH.png';
import watermelonImg from '../assets/fruits/WATERMELON FULL.png';
import strawberryImg from '../assets/fruits/STRAWBERRY.png';
import figImg from '../assets/fruits/FIG FULL.png';

const FRUIT_IMAGES = [grapesImg, peachImg, watermelonImg, strawberryImg, figImg];
const POINTS_PER_FRUIT = 10;
const ESSENCE_PER_SLICE = 8;
const MAX_ESSENCE = 100;
const COMBO_TIMEOUT_MS = 1500;
const SPAWN_INTERVAL_MS = 1200;
const INITIAL_LIVES = 3;
const GAME_BG = '#fcfcfc';

type Fruit = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  image: string;
  angle: number;
  rotSpeed: number;
};

type SliceParticle = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
};

type SliceFlash = {
  id: number;
  x: number;
  y: number;
  life: number;
};

const MIN_SLASH_DIST = 14;

function smoothPath(points: Array<{ x: number; y: number }>): Array<{ x: number; y: number }> {
  if (points.length <= 2) return points;
  const out: Array<{ x: number; y: number }> = [{ ...points[0] }];
  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];
    out.push({
      x: prev.x * 0.2 + curr.x * 0.6 + next.x * 0.2,
      y: prev.y * 0.2 + curr.y * 0.6 + next.y * 0.2,
    });
  }
  out.push({ ...points[points.length - 1] });
  return out;
}

function lineSegmentIntersectsCircle(
  x1: number, y1: number, x2: number, y2: number,
  cx: number, cy: number, r: number
): boolean {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len === 0) return Math.hypot(cx - x1, cy - y1) <= r;
  const t = Math.max(0, Math.min(1, ((cx - x1) * dx + (cy - y1) * dy) / (len * len)));
  const px = x1 + t * dx;
  const py = y1 + t * dy;
  return Math.hypot(cx - px, cy - py) <= r;
}

interface FruitSliceGameProps {
  onGameOver?: () => void;
}

const FruitSliceGame: React.FC<FruitSliceGameProps> = ({ onGameOver }) => {
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lives, setLives] = useState(INITIAL_LIVES);
  const [fruityEssence, setFruityEssence] = useState(0);
  const [fruits, setFruits] = useState<Fruit[]>([]);
  const [popups, setPopups] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [sliceParticles, setSliceParticles] = useState<SliceParticle[]>([]);
  const [sliceFlashes, setSliceFlashes] = useState<SliceFlash[]>([]);
  const [slashPath, setSlashPath] = useState<Array<{ x: number; y: number }>>([]);

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<Array<{ x: number; y: number }>>([]);
  const particleIdRef = useRef(0);
  const flashIdRef = useRef(0);
  const lastSlicedAtRef = useRef(0);
  const fruitIdRef = useRef(0);
  const popupIdRef = useRef(0);
  const gameOverRef = useRef(false);

  const addFruit = useCallback(() => {
    const area = gameAreaRef.current;
    if (!area || gameOverRef.current) return;
    const rect = area.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    const radius = 48 + Math.random() * 24;
    const x = radius + Math.random() * (w - radius * 2);
    const y = h + radius;
    const vx = (Math.random() - 0.5) * 140;
    const vy = -580 - Math.random() * 220;
    const image = FRUIT_IMAGES[Math.floor(Math.random() * FRUIT_IMAGES.length)];
    const rotSpeed = (Math.random() - 0.5) * 12;
    fruitIdRef.current += 1;
    setFruits((prev) => [...prev, { id: fruitIdRef.current, x, y, vx, vy, radius, image, angle: 0, rotSpeed }]);
  }, []);

  const gameLoop = useCallback(() => {
    const area = gameAreaRef.current;
    if (!area) return;
    const rect = area.getBoundingClientRect();
    const h = rect.height;
    const dt = 1 / 60;

    const GRAVITY = 260;
    setFruits((prev) => {
      const next: Fruit[] = [];
      let exitCount = 0;
      prev.forEach((f) => {
        let nx = f.x + f.vx * dt;
        let ny = f.y + f.vy * dt;
        const nvy = f.vy + GRAVITY * dt;
        const nangle = f.angle + f.rotSpeed * dt;
        if (ny > h + f.radius) {
          exitCount += 1;
          return;
        }
        if (nx < f.radius) { nx = f.radius; }
        if (nx > rect.width - f.radius) { nx = rect.width - f.radius; }
        const nvx = nx <= f.radius || nx >= rect.width - f.radius ? f.vx * -0.6 : f.vx;
        next.push({ ...f, x: nx, y: ny, vx: nvx, vy: nvy, angle: nangle });
      });
      if (exitCount > 0) {
        setLives((l) => {
          const nextLives = Math.max(0, l - exitCount);
          if (nextLives <= 0) gameOverRef.current = true;
          return nextLives;
        });
      }
      return next;
    });

    setSliceParticles((prev) => {
      const next = prev
        .map((p) => ({
          ...p,
          x: p.x + p.vx * dt,
          y: p.y + p.vy * dt,
          vy: p.vy + 400 * dt,
          life: p.life - dt * 2.2,
        }))
        .filter((p) => p.life > 0);
      return next;
    });

    setSliceFlashes((prev) =>
      prev
        .map((f) => ({ ...f, life: f.life - dt * 4 }))
        .filter((f) => f.life > 0)
    );
  }, []);

  useEffect(() => {
    let rafId: number;
    const tick = () => {
      gameLoop();
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [gameLoop]);

  useEffect(() => {
    const t = setInterval(addFruit, SPAWN_INTERVAL_MS);
    return () => clearInterval(t);
  }, [addFruit]);

  useEffect(() => {
    if (lives <= 0 && onGameOver) {
      const id = setTimeout(onGameOver, 1500);
      return () => clearTimeout(id);
    }
  }, [lives, onGameOver]);

  const getLocalPoint = useCallback((clientX: number, clientY: number) => {
    const area = gameAreaRef.current;
    if (!area) return null;
    const rect = area.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  }, []);

  const checkSlice = useCallback(() => {
    const path = pathRef.current;
    if (path.length < 2) return;
    const now = Date.now();
    const comboActive = now - lastSlicedAtRef.current < COMBO_TIMEOUT_MS;

    setFruits((prev) => {
      const toRemove = new Set<number>();
      path.forEach((p, i) => {
        if (i === 0) return;
        const p0 = path[i - 1];
        prev.forEach((f) => {
          if (toRemove.has(f.id)) return;
          if (lineSegmentIntersectsCircle(p0.x, p0.y, p.x, p.y, f.x, f.y, f.radius)) {
            toRemove.add(f.id);
            const mult = comboActive ? 2 : 1;
            setScore((s) => s + POINTS_PER_FRUIT * mult);
            setCombo((c) => (comboActive ? c + 1 : 1));
            lastSlicedAtRef.current = now;
            setFruityEssence((e) => Math.min(MAX_ESSENCE, e + ESSENCE_PER_SLICE));
            popupIdRef.current += 1;
            const popupId = popupIdRef.current;
            setPopups((pop) => [...pop, { id: popupId, x: f.x, y: f.y }]);
            setTimeout(() => setPopups((p) => p.filter((x) => x.id !== popupId)), 600);
            const colors = ['#f472b6', '#fb923c', '#facc15', '#a78bfa', '#f87171'];
            flashIdRef.current += 1;
            setSliceFlashes((prev) => [
              ...prev,
              { id: flashIdRef.current, x: f.x, y: f.y, life: 1 },
            ]);
            const newParticles: SliceParticle[] = [];
            for (let i = 0; i < 18; i++) {
              const angle = (i / 18) * Math.PI * 2 + Math.random() * 0.5;
              const speed = 100 + Math.random() * 140;
              particleIdRef.current += 1;
              newParticles.push({
                id: particleIdRef.current,
                x: f.x,
                y: f.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 80,
                life: 1,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: 10 + Math.random() * 8,
              });
            }
            setSliceParticles((prev) => [...prev, ...newParticles]);
          }
        });
      });
      return prev.filter((f) => !toRemove.has(f.id));
    });
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pathRef.current = [];
    const pt = getLocalPoint(e.clientX, e.clientY);
    if (pt) {
      pathRef.current.push(pt);
      setSlashPath([pt]);
    }
  }, [getLocalPoint]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (e.buttons !== 1 && (e as unknown as { pressure?: number }).pressure === undefined) return;
    const pt = getLocalPoint(e.clientX, e.clientY);
    if (!pt) return;
    const path = pathRef.current;
    if (path.length === 0) {
      pathRef.current = [pt];
      setSlashPath([pt]);
      return;
    }
    const last = path[path.length - 1];
    const dist = Math.hypot(pt.x - last.x, pt.y - last.y);
    if (dist >= MIN_SLASH_DIST) {
      pathRef.current = [...path, pt];
      setSlashPath(smoothPath(pathRef.current));
    }
  }, [getLocalPoint]);

  const handlePointerUp = useCallback(() => {
    checkSlice();
    pathRef.current = [];
    setSlashPath([]);
  }, [checkSlice]);

  useEffect(() => {
    const onUp = () => {
      checkSlice();
      pathRef.current = [];
      setSlashPath([]);
    };
    window.addEventListener('pointerup', onUp);
    return () => window.removeEventListener('pointerup', onUp);
  }, [checkSlice]);

  return (
    <div
      className="w-full h-full flex flex-col overflow-hidden"
      style={{ backgroundColor: GAME_BG }}
    >
      {/* Top UI */}
      <div className="flex-shrink-0 flex items-start justify-between px-4 pt-4 pb-2">
        <div className="flex flex-col">
          <div className="font-pixel text-sm uppercase flex items-baseline gap-1">
            <span className="text-issy-accent">Score:</span>
            <span className="text-cyan-300">{score.toLocaleString()}</span>
          </div>
          {combo > 0 && (
            <div className="font-pixel text-xs text-orange-500 uppercase mt-0.5">
              {combo + 1}x combo
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          {Array.from({ length: INITIAL_LIVES }).map((_, i) => (
            <div
              key={i}
              className="w-6 h-6 rounded-full border-2 border-red-600 flex items-center justify-center"
              style={{
                backgroundColor: i < lives ? '#dc2626' : 'transparent',
              }}
            >
              {i < lives && <span className="text-white text-[10px]">♥</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Game area */}
      <div
        ref={gameAreaRef}
        className="flex-1 relative min-h-0 w-full touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {fruits.map((f) => (
          <div
            key={f.id}
            className="absolute pointer-events-none pixelated origin-center"
            style={{
              left: f.x - f.radius,
              top: f.y - f.radius,
              width: f.radius * 2,
              height: f.radius * 2,
              transform: `rotate(${(f.angle * 180) / Math.PI}deg)`,
            }}
          >
            <img
              src={f.image}
              alt=""
              className="w-full h-full object-contain"
              draggable={false}
            />
          </div>
        ))}
        {sliceFlashes.map((flash) => (
          <div
            key={flash.id}
            className="absolute pointer-events-none rounded-full border-2 border-white"
            style={{
              left: flash.x - 40,
              top: flash.y - 40,
              width: 80,
              height: 80,
              opacity: flash.life,
              transform: `scale(${1.2 - flash.life * 0.4})`,
              backgroundColor: 'rgba(255,200,220,0.4)',
              boxShadow: '0 0 24px rgba(255,180,200,0.8)',
            }}
          />
        ))}
        {sliceParticles.map((p) => (
          <div
            key={p.id}
            className="absolute pointer-events-none rounded-full"
            style={{
              left: p.x - (p.size || 12) / 2,
              top: p.y - (p.size || 12) / 2,
              width: p.size || 12,
              height: p.size || 12,
              backgroundColor: p.color,
              opacity: p.life,
              boxShadow: `0 0 ${(p.size || 12) * 0.8}px ${p.color}`,
              transform: `scale(${0.6 + p.life * 0.4})`,
            }}
          />
        ))}
        {slashPath.length >= 2 && (() => {
          const pts = smoothPath(slashPath);
          const d = pts.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`).join(' ');
          return (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ left: 0, top: 0 }}
            >
              <defs>
                <linearGradient id="slash-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
                  <stop offset="50%" stopColor="rgba(147,197,253,0.85)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0.9)" />
                </linearGradient>
                <filter id="slash-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <path
                d={d}
                fill="none"
                stroke="url(#slash-gradient)"
                strokeWidth="16"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#slash-glow)"
              />
              <path
                d={d}
                fill="none"
                stroke="rgba(255,255,255,0.6)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          );
        })()}
        {popups.map((p) => (
          <div
            key={p.id}
            className="absolute font-pixel text-orange-500 text-sm animate-bounce"
            style={{ left: p.x - 20, top: p.y - 30 }}
          >
            +10
          </div>
        ))}
      </div>

      {/* Bottom: Fruity Essence bar */}
      <div className="flex-shrink-0 px-4 pb-4 pt-2">
        <div className="font-pixel text-xs text-white uppercase mb-1">Fruity Essence</div>
        <div className="h-6 rounded-full border-2 border-black overflow-hidden bg-white/30">
          <div
            className="h-full rounded-full transition-all duration-150 bg-gradient-to-r from-pink-400 to-issy-accent"
            style={{ width: `${fruityEssence}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default FruitSliceGame;
