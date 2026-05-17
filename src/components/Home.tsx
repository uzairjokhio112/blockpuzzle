import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Trophy, Settings, Star, Coins, Gift, Info, Trash2, Clock, Baby, FastForward, Volume2, VolumeX } from 'lucide-react';
import { GameMode } from '../types';
import Leaderboard from './Leaderboard';
import DailyRewards from './DailyRewards';

interface HomeProps {
  onStartGame: (mode: GameMode) => void;
  userStats: { coins: number; stars: number };
}

export default function Home({ onStartGame, userStats }: HomeProps) {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showDaily, setShowDaily] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const modes = [
    { id: GameMode.CLASSIC, label: 'Classic', icon: Play, color: 'bg-blue-500', desc: 'The original puzzle experience' },
    { id: GameMode.TIMED, label: 'Timed', icon: Clock, color: 'bg-red-500', desc: 'Clear lines before time runs out' },
    { id: GameMode.DAILY, label: 'Daily', icon: Gift, color: 'bg-purple-500', desc: 'New puzzle every day' },
    { id: GameMode.RELAX, label: 'Relax', icon: Star, color: 'bg-green-500', desc: 'No timer, just zen' },
    { id: GameMode.KIDS, label: 'Kids', icon: Baby, color: 'bg-yellow-500', desc: 'Easier puzzles for little ones' },
  ];

  const handleClaimReward = (coins: number, stars: number) => {
    // Reward logic is handled in App.tsx via props or events
    // For now we just close the modal
    setTimeout(() => setShowDaily(false), 1500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-zinc-950 text-white overflow-hidden relative font-sans">
      {/* Decorative floating blocks */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [0, 1.2, 0], 
              opacity: [0, 0.1, 0],
              x: [0, Math.random() * 200 - 100],
              y: [0, Math.random() * 200 - 100],
            }}
            transition={{ 
              duration: 10 + Math.random() * 10, 
              repeat: Infinity, 
              delay: i * 2,
              ease: "easeInOut" 
            }}
            className="absolute rounded-3xl blur-[40px]"
            style={{
              width: 300,
              height: 300,
              left: `${Math.random() * 80 + 10}%`,
              top: `${Math.random() * 80 + 10}%`,
              backgroundColor: ['#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6'][i % 5],
            }}
          />
        ))}
      </div>

      <AnimatePresence>
        {showLeaderboard && <Leaderboard onClose={() => setShowLeaderboard(false)} />}
        {showDaily && <DailyRewards onClaim={handleClaimReward} />}
      </AnimatePresence>

      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="z-10 text-center mb-16"
      >
        <div className="flex items-center justify-center space-x-4 mb-4">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-3xl shadow-lg shadow-blue-500/20">C</div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter">
            Color <span className="text-blue-500">Block</span>
          </h1>
        </div>
        <p className="text-sm text-zinc-500 uppercase tracking-[0.3em] font-bold">Elegant Puzzle Experience</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 z-10 w-full max-w-5xl">
        {modes.map((mode) => (
          <motion.button
            key={mode.id}
            whileHover={{ y: -5, backgroundColor: 'rgba(39, 39, 42, 0.9)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onStartGame(mode.id)}
            className="glass-panel group flex flex-col items-center justify-center p-8 rounded-[32px] transition-all"
          >
            <div className={`p-4 rounded-2xl mb-4 transition-transform group-hover:scale-110 shadow-lg ${mode.color}`}>
              <mode.icon size={32} />
            </div>
            <span className="text-lg font-bold tracking-tight">{mode.label}</span>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1 font-bold">{mode.desc}</span>
          </motion.button>
        ))}
      </div>

      <div className="fixed bottom-12 flex gap-4 z-10">
        <div className="flex items-center glass-panel px-8 py-4 rounded-full">
          <Coins className="text-yellow-500 mr-3" size={24} />
          <span className="text-2xl font-mono font-bold">{userStats.coins.toLocaleString()}</span>
        </div>
        <div className="flex items-center glass-panel px-8 py-4 rounded-full">
          <Star className="text-blue-500 mr-3" size={24} />
          <span className="text-2xl font-mono font-bold">{userStats.stars.toLocaleString()}</span>
        </div>
      </div>

      <div className="fixed top-8 right-8 flex gap-3 z-10">
        <motion.button 
          onClick={() => setIsMuted(!isMuted)}
          className="w-12 h-12 flex items-center justify-center rounded-full glass-panel hover:bg-zinc-800 transition-colors"
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </motion.button>
        <motion.button className="w-12 h-12 flex items-center justify-center rounded-full glass-panel hover:bg-zinc-800 transition-colors">
          <Settings size={20} />
        </motion.button>
        <motion.button 
          onClick={() => setShowLeaderboard(true)}
          className="w-12 h-12 flex items-center justify-center rounded-full glass-panel hover:bg-zinc-800 transition-colors"
        >
          <Trophy size={20} />
        </motion.button>
        <motion.button 
          onClick={() => setShowDaily(true)}
          className="w-12 h-12 flex items-center justify-center rounded-full glass-panel hover:bg-zinc-800 transition-colors text-blue-500"
        >
          <Gift size={20} />
        </motion.button>
      </div>
    </div>
  );
}
