import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gift, Coins, Star, Check } from 'lucide-react';

export default function DailyRewards({ onClaim }: { onClaim: (coins: number, stars: number) => void }) {
  const [claimed, setClaimed] = useState(false);

  const handleClaim = () => {
    setClaimed(true);
    onClaim(100, 5); // Example reward
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="glass-panel w-full max-w-sm rounded-[40px] overflow-hidden p-8 flex flex-col items-center text-center shadow-2xl"
      >
        <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
          <Gift size={48} className="text-white" />
        </div>
        
        <h2 className="text-3xl font-black mb-2 uppercase tracking-tight">Daily Reward</h2>
        <p className="text-white/40 font-bold uppercase tracking-widest text-xs mb-8">Come back every day for bonuses!</p>

        <div className="grid grid-cols-2 gap-4 w-full mb-8">
           <div className="bg-white/5 rounded-3xl p-4 border border-white/10">
              <Coins className="text-yellow-400 mx-auto mb-2" size={32} />
              <div className="text-2xl font-black">100</div>
              <div className="text-[10px] uppercase font-bold opacity-30 tracking-widest">Coins</div>
           </div>
           <div className="bg-white/5 rounded-3xl p-4 border border-white/10">
              <Star className="text-pink-400 mx-auto mb-2" size={32} />
              <div className="text-2xl font-black">5</div>
              <div className="text-[10px] uppercase font-bold opacity-30 tracking-widest">Stars</div>
           </div>
        </div>

        <button 
          onClick={handleClaim}
          disabled={claimed}
          className={`w-full py-4 rounded-2xl font-black text-xl transition-all ${claimed ? 'bg-green-500/20 text-green-500' : 'bg-purple-500 hover:scale-105 active:scale-95'}`}
        >
          {claimed ? (
            <div className="flex items-center justify-center gap-2"><Check size={24} /> CLAIMED</div>
          ) : 'CLAIM REWARD'}
        </button>
      </motion.div>
    </motion.div>
  );
}
