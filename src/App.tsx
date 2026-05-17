import { useState, useEffect } from 'react';
import Home from './components/Home';
import Game from './components/Game';
import { GameMode } from './types';
import { auth, db } from './lib/firebase';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default function App() {
  const [screen, setScreen] = useState<'home' | 'game'>('home');
  const [currentMode, setCurrentMode] = useState<GameMode>(GameMode.CLASSIC);
  const [userStats, setUserStats] = useState({ coins: 0, stars: 0 });
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        const path = `users/${user.uid}`;
        try {
          const userRef = doc(db, 'users', user.uid);
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            const data = snap.data();
            setUserStats({ coins: data.coins || 0, stars: data.stars || 0 });
          } else {
            await setDoc(userRef, {
              uid: user.uid,
              displayName: `Player ${user.uid.slice(0, 5)}`,
              coins: 0,
              stars: 0,
              createdAt: serverTimestamp(),
              lastLogin: serverTimestamp(),
            });
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, path);
        }
      } else {
        signInAnonymously(auth);
      }
    });
    return unsub;
  }, []);

  const handleStartGame = (mode: GameMode) => {
    setCurrentMode(mode);
    setScreen('game');
  };

  const handleExitGame = () => {
    setScreen('home');
  };

  const handleScoreUpdate = async (score: number) => {
  };

  const finalizeGame = async (score: number) => {
    if (!userId) return;
    const coinsEarned = Math.floor(score / 10);
    const starsEarned = Math.floor(score / 100);
    
    setUserStats(prev => ({
      coins: prev.coins + coinsEarned,
      stars: prev.stars + starsEarned
    }));

    const userPath = `users/${userId}`;
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        coins: increment(coinsEarned),
        stars: increment(starsEarned),
        lastLogin: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, userPath);
    }

    const scorePath = `leaderboard/${userId}_${currentMode}`;
    try {
      const scoreRef = doc(db, 'leaderboard', `${userId}_${currentMode}`);
      const scoreSnap = await getDoc(scoreRef);
      
      if (!scoreSnap.exists() || scoreSnap.data().score < score) {
        await setDoc(scoreRef, {
          uid: userId,
          displayName: auth.currentUser?.displayName || `Player ${userId.slice(0, 5)}`,
          score: score,
          mode: currentMode,
          timestamp: serverTimestamp(),
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, scorePath);
    }
  };

  return (
    <div className="bg-black min-h-screen">
      {screen === 'home' ? (
        <Home 
          onStartGame={handleStartGame} 
          userStats={userStats} 
        />
      ) : (
        <Game 
          mode={currentMode} 
          onExit={handleExitGame} 
          onScoreUpdate={handleScoreUpdate}
          onGameOver={finalizeGame}
        />
      )}
    </div>
  );
}
