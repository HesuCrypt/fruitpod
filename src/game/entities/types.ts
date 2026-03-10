/**
 * Entity and effect types. Re-exports from game utils for game module use.
 */

export {
  EntityType,
  type GameEntity,
  type SlicedPart,
  type Particle,
} from '../../utils/gameUtils';

export interface TrailPoint {
  x: number;
  y: number;
  life: number;
}

export interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  vy: number;
  size?: number;
}
