import { motion, AnimatePresence } from 'motion/react';
import { BlockInstance } from '../../types';
import { Block } from './Block';
import { useState } from 'react';

interface DraggableBlockProps {
  block: BlockInstance;
  onDragEnd: (block: BlockInstance, x: number, y: number) => void;
  gridSize: number;
  disabled?: boolean;
}

export function DraggableBlock({ block, onDragEnd, disabled }: DraggableBlockProps) {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <motion.div
      drag={!disabled}
      dragSnapToOrigin
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(_, info) => {
        setIsDragging(false);
        onDragEnd(block, info.point.x, info.point.y);
      }}
      whileHover={!disabled ? { scale: 1.1 } : {}}
      whileDrag={{ scale: 1.2, zIndex: 50 }}
      animate={{ scale: 1, opacity: 1 }}
      initial={{ scale: 0, opacity: 0 }}
      exit={{ scale: 0, opacity: 0 }}
      className="cursor-grab active:cursor-grabbing p-2"
    >
      <Block shape={block.shape} color={block.color} size={24} />
      {isDragging && (
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-50 blur-[2px]">
            <Block shape={block.shape} color={block.color} size={24} />
         </div>
      )}
    </motion.div>
  );
}
