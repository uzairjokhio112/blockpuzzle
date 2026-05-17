export enum GameMode {
  CLASSIC = 'classic',
  TIMED = 'timed',
  DAILY = 'daily',
  RELAX = 'relax',
  KIDS = 'kids',
}

export type BlockType = number[][];

export interface BlockInstance {
  id: string;
  shape: BlockType;
  color: string;
}

export interface UserStats {
  coins: number;
  stars: number;
  highScores: Record<GameMode, number>;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL: string | null;
}

export const GRID_SIZE = 10;
export const KIDS_GRID_SIZE = 6;

export const COLORS = {
  blue: 'block-vibrant-blue',
  pink: 'block-vibrant-pink',
  yellow: 'block-vibrant-amber',
  green: 'block-vibrant-green',
  purple: 'block-vibrant-purple',
};

export const SHAPES: Record<string, BlockType> = {
  SQUARE_1: [[1]],
  SQUARE_4: [[1, 1], [1, 1]],
  LINE_2: [[1, 1]],
  LINE_3: [[1, 1, 1]],
  LINE_4: [[1, 1, 1, 1]],
  LINE_5: [[1, 1, 1, 1, 1]],
  L_SHAPE: [[1, 0], [1, 0], [1, 1]],
  L_REVERSE: [[0, 1], [0, 1], [1, 1]],
  T_SHAPE: [[1, 1, 1], [0, 1, 0]],
  Z_SHAPE: [[1, 1, 0], [0, 1, 1]],
  S_SHAPE: [[0, 1, 1], [1, 1, 0]],
  T_SINGLE: [[1, 1, 1]], // Mini row
  C_SHAPE: [[1, 1], [1, 0]], // Mini L
};
