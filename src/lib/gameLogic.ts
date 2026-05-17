import { BlockInstance, SHAPES, COLORS } from '../types';

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const getRandomColor = () => {
  const keys = Object.keys(COLORS) as (keyof typeof COLORS)[];
  return COLORS[keys[Math.floor(Math.random() * keys.length)]];
};

export const getRandomShape = (mode?: string) => {
  const shapeKeys = Object.keys(SHAPES);
  // Kids mode might prefer easier shapes
  if (mode === 'kids') {
    const easyShapes = ['SQUARE_1', 'SQUARE_4', 'LINE_2', 'LINE_3', 'C_SHAPE'];
    return SHAPES[easyShapes[Math.floor(Math.random() * easyShapes.length)]];
  }
  return SHAPES[shapeKeys[Math.floor(Math.random() * shapeKeys.length)]];
};

export const createNewBlock = (mode?: string): BlockInstance => {
  return {
    id: generateId(),
    shape: getRandomShape(mode),
    color: getRandomColor(),
  };
};

export const canPlaceBlock = (
  grid: (string | null)[][],
  shape: number[][],
  row: number,
  col: number,
  gridSize: number
) => {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c] === 1) {
        const targetR = row + r;
        const targetC = col + c;
        if (
          targetR < 0 ||
          targetR >= gridSize ||
          targetC < 0 ||
          targetC >= gridSize ||
          grid[targetR][targetC] !== null
        ) {
          return false;
        }
      }
    }
  }
  return true;
};

export const checkLines = (grid: (string | null)[][], gridSize: number) => {
  const fullRows: number[] = [];
  const fullCols: number[] = [];

  // Check rows
  for (let r = 0; r < gridSize; r++) {
    if (grid[r].every((cell) => cell !== null)) {
      fullRows.push(r);
    }
  }

  // Check columns
  for (let c = 0; c < gridSize; c++) {
    let full = true;
    for (let r = 0; r < gridSize; r++) {
      if (grid[r][c] === null) {
        full = false;
        break;
      }
    }
    if (full) {
      fullCols.push(c);
    }
  }

  return { fullRows, fullCols };
};

export const isGameOver = (
  grid: (string | null)[][],
  availableBlocks: BlockInstance[],
  gridSize: number
) => {
  if (availableBlocks.length === 0) return false;
  
  for (const block of availableBlocks) {
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (canPlaceBlock(grid, block.shape, r, c, gridSize)) {
          return false;
        }
      }
    }
  }
  return true;
};
