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
};

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

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<Array<{ x: number; y: number }>>([]);
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
    const radius = 28 + Math.random() * 20;
    const x = radius + Math.random() * (w - radius * 2);
    const y = h + radius;
    const vx = (Math.random() - 0.5) * 80;
    const vy = -180 - Math.random() * 120;
    const image = FRUIT_IMAGES[Math.floor(Math.random() * FRUIT_IMAGES.length)];
    fruitIdRef.current += 1;
    setFruits((prev) => [...prev, { id: fruitIdRef.current, x, y, vx, vy, radius, image }]);
  }, []);

  const gameLoop = useCallback((time: number) => {
    const area = gameAreaRef.current;
    if (!area) return;
    const rect = area.getBoundingClientRect();
    const h = rect.height;
    const dt = 1 / 60;

    setFruits((prev) => {
      const next: Fruit[] = [];
      let exitCount = 0;
      prev.forEach((f) => {
        let nx = f.x + f.vx * dt;
        let ny = f.y + f.vy * dt;
        const nvy = f.vy + 320 * dt;
        if (ny > h + f.radius) {
          exitCount += 1;
          return;
        }
        if (nx < f.radius) { nx = f.radius; }
        if (nx > rect.width - f.radius) { nx = rect.width - f.radius; }
        const nvx = nx <= f.radius || nx >= rect.width - f.radius ? f.vx * -0.5 : f.vx;
        next.push({ ...f, x: nx, y: ny, vx: nvx, vy: nvy });
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
  }, []);

  useEffect(() => {
    let rafId: number;
    const tick = () => {
      gameLoop(performance.now());
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
          }
        });
      });
      return prev.filter((f) => !toRemove.has(f.id));
    });
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pathRef.current = [];
    const pt = getLocalPoint(e.clientX, e.clientY);
    if (pt) pathRef.current.push(pt);
  }, [getLocalPoint]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (e.buttons !== 1 && (e as unknown as { pressure?: number }).pressure === undefined) return;
    const pt = getLocalPoint(e.clientX, e.clientY);
    if (pt) pathRef.current.push(pt);
  }, [getLocalPoint]);

  const handlePointerUp = useCallback(() => {
    checkSlice();
    pathRef.current = [];
  }, [checkSlice]);

  useEffect(() => {
    const el = gameAreaRef.current;
    if (!el) return;
    const onUp = () => { checkSlice(); pathRef.current = []; };
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
            className="absolute pointer-events-none pixelated"
            style={{
              left: f.x - f.radius,
              top: f.y - f.radius,
              width: f.radius * 2,
              height: f.radius * 2,
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
