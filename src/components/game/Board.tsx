import { motion } from 'motion/react';
import { cn } from './Block';

interface BoardProps {
  grid: (string | null)[][];
  activeCell: { r: number, c: number } | null;
  gridSize: number;
}

export function Board({ grid, activeCell, gridSize }: BoardProps) {
  return (
    <div 
      id="game-board"
      className="grid gap-[2px] p-2 bg-zinc-950 rounded-xl shadow-2xl self-center border border-zinc-800"
      style={{
        gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
        width: 'min(90vw, 450px)',
        aspectRatio: '1/1',
      }}
    >
      {grid.map((row, r) => 
        row.map((color, c) => (
          <motion.div
            key={`${r}-${c}`}
            whileHover={!color ? { scale: 1.05, backgroundColor: 'rgba(255,255,255,0.05)' } : {}}
            className={cn(
              "relative w-full h-full rounded-[2px] transition-all duration-200",
              color ? color : "bg-zinc-900 border border-zinc-800",
              activeCell?.r === r && activeCell?.c === c && !color && "bg-zinc-800/50 scale-105"
            )}
          >
            {color && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute inset-0 bg-white/10 opacity-30 pointer-events-none"
              />
            )}
          </motion.div>
        ))
      )}
    </div>
  );
}
