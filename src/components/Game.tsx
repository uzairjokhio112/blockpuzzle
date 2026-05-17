import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, RotateCcw, Pause, Play, Trophy, Coins, Star, Undo2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { GameMode, GRID_SIZE, KIDS_GRID_SIZE, BlockInstance } from '../types';
import { Board } from './game/Board';
import { DraggableBlock } from './game/DraggableBlock';
import { createNewBlock, canPlaceBlock, checkLines, isGameOver } from '../lib/gameLogic';

interface GameProps {
  mode: GameMode;
  onExit: () => void;
  onScoreUpdate: (score: number) => void;
  onGameOver: (score: number) => void;
}

export default function Game({ mode, onExit, onScoreUpdate, onGameOver }: GameProps) {
  const gridSize = mode === GameMode.KIDS ? KIDS_GRID_SIZE : GRID_SIZE;
  const [grid, setGrid] = useState<(string | null)[][]>(Array(gridSize).fill(null).map(() => Array(gridSize).fill(null)));
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [nextBlocks, setNextBlocks] = useState<BlockInstance[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes for timed mode
  const [history, setHistory] = useState<(string | null)[][][]>([]);

  // Sound ref would go here

  const generateNewBlocks = useCallback(() => {
    setNextBlocks([
      createNewBlock(mode),
      createNewBlock(mode),
      createNewBlock(mode),
    ]);
  }, [mode]);

  useEffect(() => {
    if (gameOver) {
      onGameOver(score);
    }
  }, [gameOver, score, onGameOver]);

  useEffect(() => {
    generateNewBlocks();
  }, [generateNewBlocks]);

  useEffect(() => {
    if (mode === GameMode.TIMED && !isPaused && !gameOver) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0) {
            setGameOver(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [mode, isPaused, gameOver]);

  const handleBlockPlacement = (block: BlockInstance, x: number, y: number) => {
    if (gameOver || isPaused) return;

    // Convert screen coordinates to grid coordinates
    const board = document.getElementById('game-board');
    if (!board) return;

    const rect = board.getBoundingClientRect();
    const cellSize = rect.width / gridSize;
    
    // Offset the target position to align with the drag point (usually top-left of the first block element)
    const gridX = Math.round((x - rect.left) / cellSize);
    const gridY = Math.round((y - rect.top) / cellSize);

    // Simple heuristic for placing: try to find the cell nearest to the drop
    // Real drag and drop would be more precise, but this works for a prototype
    if (canPlaceBlock(grid, block.shape, gridY, gridX, gridSize)) {
      // Save history for undo
      setHistory(prev => [...prev.slice(-4), JSON.parse(JSON.stringify(grid))]);

      const newGrid = [...grid.map(row => [...row])];
      for (let r = 0; r < block.shape.length; r++) {
        for (let c = 0; c < block.shape[r].length; c++) {
          if (block.shape[r][c] === 1) {
            newGrid[gridY + r][gridX + c] = block.color;
          }
        }
      }

      setNextBlocks(prev => {
        const filtered = prev.filter(b => b.id !== block.id);
        if (filtered.length === 0) {
          generateNewBlocks();
          return [];
        }
        return filtered;
      });

      // Clear lines logic
      const { fullRows, fullCols } = checkLines(newGrid, gridSize);
      const linesCleared = fullRows.length + fullCols.length;
      
      if (linesCleared > 0) {
        fullRows.forEach(r => newGrid[r].fill(null));
        fullCols.forEach(c => {
          for (let r = 0; r < gridSize; r++) {
            newGrid[r][c] = null;
          }
        });
        
        const newScore = score + (linesCleared * 100 * combo);
        setScore(newScore);
        onScoreUpdate(newScore);
        setCombo(prev => prev + 1);
        
        confetti({
          particleCount: 50 * linesCleared,
          spread: 70,
          origin: { y: 0.6 },
          colors: [block.color, '#ffffff']
        });
      } else {
        setCombo(1);
        setScore(prev => prev + 10);
        onScoreUpdate(score + 10);
      }

      setGrid(newGrid);

      // Check for Game Over after placement and potential line clear
      if (isGameOver(newGrid, nextBlocks.filter(b => b.id !== block.id).length === 0 ? [createNewBlock(mode)] : nextBlocks.filter(b => b.id !== block.id), gridSize)) {
        setGameOver(true);
      }
    }
  };

  const handleRestart = () => {
    setGrid(Array(gridSize).fill(null).map(() => Array(gridSize).fill(null)));
    setScore(0);
    setCombo(1);
    setGameOver(false);
    setTimeLeft(120);
    setHistory([]);
    generateNewBlocks();
  };

  const handleUndo = () => {
    if (history.length > 0) {
      const last = history[history.length - 1];
      setGrid(last);
      setHistory(prev => prev.slice(0, -1));
      setCombo(1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-white font-sans p-6 overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between glass-panel rounded-2xl p-4 shrink-0 mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl">C</div>
          <h1 className="text-xl font-bold tracking-tight hidden md:block">Color <span className="text-blue-500">Block</span> Puzzle</h1>
        </div>

        <div className="flex space-x-8">
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">Score</div>
            <div className="text-2xl font-mono font-bold text-white tabular-nums">{score.toLocaleString()}</div>
          </div>
          {mode === GameMode.TIMED && (
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">Time</div>
              <div className={cn("text-2xl font-mono font-bold tabular-nums", timeLeft < 30 ? "text-red-500 animate-pulse" : "text-blue-400")}>
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 glass-panel px-4 py-1.5 rounded-full border-zinc-700">
            <Star className="text-blue-500 size-4" />
            <span className="text-sm font-bold">1,250</span>
          </div>
          <button onClick={() => setIsPaused(true)} className="w-10 h-10 flex items-center justify-center rounded-full glass-panel hover:bg-zinc-800 transition-colors">
            <Pause size={18} />
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 flex space-x-4 overflow-hidden relative">
        {/* Left Sidebar (Desktop Only) */}
        <aside className="w-64 glass-panel rounded-2xl p-5 hidden lg:flex flex-col space-y-6 shrink-0">
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Active Mode</h3>
            <div className="p-3 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-between">
              <span className="capitalize font-bold">{mode}</span>
              <div className="bg-blue-500 w-2 h-2 rounded-full animate-pulse" />
            </div>
          </div>
          
          <div className="flex-1 border-t border-zinc-800 pt-6">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Combos</h3>
            <div className="flex items-center justify-center h-32 glass-panel rounded-xl">
               <div className="text-center">
                <div className="text-xs uppercase text-zinc-500 font-bold mb-1">Current</div>
                <div className="text-4xl font-black text-yellow-500">{combo}x</div>
               </div>
            </div>
          </div>
        </aside>

        {/* Board - Content Area */}
        <div className="flex-1 glass-panel rounded-2xl flex flex-col items-center justify-center relative p-4">
          <div className="relative">
            <Board grid={grid} activeCell={null} gridSize={gridSize} />
            {combo > 1 && (
              <motion.div 
                initial={{ scale: 0, y: 0 }}
                animate={{ scale: [1, 1.5, 1], y: -80 }}
                key={combo}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl font-black text-yellow-500 drop-shadow-[0_0_20px_rgba(245,158,11,0.5)] pointer-events-none z-20"
              >
                {combo}x COMBO!
              </motion.div>
            )}
          </div>

          {/* Mobile Next Blocks */}
          <div className="lg:hidden mt-8 w-full max-w-sm flex justify-around p-4 glass-panel rounded-3xl">
             <AnimatePresence mode="popLayout">
                {nextBlocks.map((block) => (
                  <DraggableBlock 
                    key={block.id} 
                    block={block} 
                    onDragEnd={handleBlockPlacement} 
                    gridSize={gridSize}
                    disabled={gameOver || isPaused}
                  />
                ))}
              </AnimatePresence>
          </div>
        </div>

        {/* Right Sidebar */}
        <aside className="w-64 hidden lg:flex flex-col space-y-4 shrink-0">
          <div className="glass-panel rounded-2xl p-6 flex flex-col items-center flex-1">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-8">Next Blocks</h3>
            <div className="flex flex-col space-y-10 items-center">
              <AnimatePresence mode="popLayout">
                {nextBlocks.map((block) => (
                  <DraggableBlock 
                    key={block.id} 
                    block={block} 
                    onDragEnd={handleBlockPlacement} 
                    gridSize={gridSize}
                    disabled={gameOver || isPaused}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
          <div className="glass-panel rounded-2xl p-5 h-32 flex flex-col justify-center text-center">
            <div className="text-blue-400 font-bold text-lg">Undo Move</div>
            <button 
              onClick={handleUndo}
              disabled={history.length === 0}
              className="mt-2 w-full glass-panel py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 disabled:opacity-30 transition-all flex items-center justify-center gap-2"
            >
              <Undo2 size={14} /> Back
            </button>
          </div>
        </aside>
      </main>

      {/* Menus Omitted for brevity but assumed present */}
      <AnimatePresence>
        {isPaused && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center"
          >
            <h2 className="text-6xl font-black mb-12">PAUSED</h2>
            <div className="flex flex-col gap-4 w-64">
              <button 
                onClick={() => setIsPaused(false)}
                className="w-full py-4 bg-blue-500 rounded-2xl font-black text-xl hover:scale-105 transition-transform flex items-center justify-center gap-2"
              >
                <Play fill="currentColor" /> RESUME
              </button>
              <button 
                onClick={handleRestart}
                className="w-full py-4 bg-white/10 rounded-2xl font-black text-xl hover:scale-105 transition-transform flex items-center justify-center gap-2"
              >
                <RotateCcw /> RESTART
              </button>
              <button 
                onClick={onExit}
                className="w-full py-4 bg-red-500/20 text-red-500 rounded-2xl font-black text-xl hover:scale-105 transition-transform"
              >
                QUIT
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over Overlay */}
      <AnimatePresence>
        {gameOver && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-50 bg-gradient-to-br from-indigo-950/95 to-purple-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center"
          >
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-5xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-yellow-500">NO MORE MOVES!</h2>
              <p className="text-xl text-white/60 mb-8 font-bold uppercase tracking-widest">Game Over</p>

              <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 mb-12 shadow-2xl">
                <div className="mb-8">
                  <span className="block text-white/40 text-sm font-bold uppercase tracking-widest mb-1">Total Score</span>
                  <span className="text-8xl font-black block tabular-nums">{score}</span>
                </div>
                
                <div className="flex justify-center gap-8 border-t border-white/5 pt-8">
                   <div className="flex flex-col items-center">
                    <Coins className="text-yellow-400 mb-1" />
                    <span className="font-black text-2xl">+{Math.floor(score/10)}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Star className="text-pink-400 mb-1" />
                    <span className="font-black text-2xl">+{Math.floor(score/100)}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 w-72 mx-auto">
                <button 
                  onClick={handleRestart}
                  className="w-full py-4 bg-white text-black rounded-3xl font-black text-2xl shadow-xl hover:scale-105 transition-transform active:scale-95"
                >
                  PLAY AGAIN
                </button>
                <button 
                  onClick={onExit}
                  className="w-full py-4 bg-white/5 rounded-3xl font-black text-xl hover:bg-white/10 transition-all border border-white/10"
                >
                  MENU
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
