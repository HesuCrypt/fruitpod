/**
 * InputManager: canvas coordinate conversion and swipe segment from pointer/touch.
 */

export interface Point {
  x: number;
  y: number;
}

export function getCanvasCoords(
  clientX: number,
  clientY: number,
  canvas: HTMLCanvasElement | null
): Point {
  if (!canvas) return { x: 0, y: 0 };
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
  };
}

export interface SwipeSegment {
  p1: Point;
  p2: Point;
}
