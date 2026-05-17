import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Medal, Trophy, User } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { GameMode } from '../types';

export default function Leaderboard({ onClose }: { onClose: () => void }) {
  const [scores, setScores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<GameMode>(GameMode.CLASSIC);

  useEffect(() => {
    async function fetchScores() {
      setLoading(true);
      const q = query(
        collection(db, 'leaderboard'),
        where('mode', '==', filter),
        orderBy('score', 'desc'),
        limit(10)
      );
      const snap = await getDocs(q);
      setScores(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }
    fetchScores();
  }, [filter]);

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
        className="glass-panel w-full max-w-lg rounded-[40px] overflow-hidden flex flex-col max-h-[80vh] shadow-2xl"
      >
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
          <div>
            <h2 className="text-3xl font-black tracking-tight flex items-center">
              <Trophy className="text-yellow-400 mr-2" /> GLOBAL RANKING
            </h2>
            <p className="text-white/40 text-sm font-bold uppercase tracking-widest mt-1">Top players this week</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex p-2 bg-black/20 gap-1 overflow-x-auto no-scrollbar">
          {Object.values(GameMode).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilter(mode)}
              className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === mode ? 'bg-white text-black' : 'hover:bg-white/5'}`}
            >
              {mode}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-20 opacity-20">
               <RotateCcw className="animate-spin" size={48} />
            </div>
          ) : scores.length === 0 ? (
             <div className="py-20 text-center opacity-30 font-bold uppercase">No scores recorded yet</div>
          ) : (
            scores.map((score, idx) => (
              <motion.div
                key={score.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`flex items-center p-4 rounded-2xl ${idx === 0 ? 'bg-yellow-400/10 border border-yellow-400/20' : 'bg-white/5'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xl mr-4 ${idx === 0 ? 'bg-yellow-400 text-black' : idx === 1 ? 'bg-zinc-300 text-black' : idx === 2 ? 'bg-amber-600 text-black' : 'bg-white/10'}`}>
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="font-bold flex items-center">
                    {score.displayName} 
                    {idx < 3 && <Medal className={`ml-2 size-4 ${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-zinc-300' : 'text-amber-600'}`} />}
                  </div>
                </div>
                <div className="text-2xl font-black tabular-nums">{score.score.toLocaleString()}</div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function RotateCcw(props: any) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  )
}
