import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Block({ shape, color, size = 30, className }: { shape: number[][], color: string, size?: number, className?: string }) {
  return (
    <div 
      className={cn("grid gap-1", className)}
      style={{ 
        gridTemplateColumns: `repeat(${shape[0].length}, ${size}px)`,
        gridTemplateRows: `repeat(${shape.length}, ${size}px)`,
        width: shape[0].length * size + (shape[0].length - 1) * 4,
        height: shape.length * size + (shape.length - 1) * 4,
      }}
    >
      {shape.map((row, rIdx) => 
        row.map((cell, cIdx) => (
          <div 
            key={`${rIdx}-${cIdx}`}
            className={cn(
              "rounded-[4px] transition-all duration-300",
              cell === 1 ? color : "bg-transparent"
            )}
            style={{ 
              opacity: cell === 1 ? 1 : 0 
            }}
          />
        ))
      )}
    </div>
  );
}
