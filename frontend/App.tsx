import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import TopThreeCard from './components/TopThreeCard';
import LeaderboardRow from './components/LeaderboardRow';
import UserSearch from './components/UserSearch';
import { Player, TrendType } from './types';
import { Users, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const MOCK_AVATARS = [
  'https://picsum.photos/100/100?random=1',
  'https://picsum.photos/100/100?random=2',
  'https://picsum.photos/100/100?random=3',
  'https://picsum.photos/100/100?random=4',
  'https://picsum.photos/100/100?random=5',
  'https://picsum.photos/100/100?random=6',
  'https://picsum.photos/100/100?random=7',
  'https://picsum.photos/100/100?random=8',
];

const generateMockData = (count: number): Player[] => {
  return Array.from({ length: count }, (_, i) => {
    const trendValue = Math.random();
    const trend: TrendType = trendValue > 0.6 ? 'up' : trendValue > 0.3 ? 'down' : 'stable';
    const change = trend === 'stable' ? 0 : Math.floor(Math.random() * 5);
    
    return {
      id: `PLAYER-${String(i + 1).padStart(3, '0')}`,
      username: i === 0 ? "NeonKing" : i === 1 ? "CyberValkyrie" : i === 2 ? "GlitchHunter" : `User_${Math.random().toString(36).substring(2, 8)}`,
      rank: i + 1,
      score: 10000 - (i * Math.floor(Math.random() * 100 + 50)),
      avatar: MOCK_AVATARS[i % MOCK_AVATARS.length],
      trend,
      change
    };
  });
};

const App: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize Data
  useEffect(() => {
    // Simulate initial data fetch
    const timer = setTimeout(() => {
      const data = generateMockData(100);
      setPlayers(data);
      setLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  // Simulate Live Updates (optional visual flair)
  useEffect(() => {
    if (loading) return;

    const interval = setInterval(() => {
      setPlayers(currentPlayers => {
        // Randomly pick a player from top 20 to update score slightly
        const newPlayers = [...currentPlayers];
        const randomIndex = Math.floor(Math.random() * 20);
        if (newPlayers[randomIndex]) {
           const scoreChange = Math.floor(Math.random() * 100) - 20;
           newPlayers[randomIndex] = {
             ...newPlayers[randomIndex],
             score: newPlayers[randomIndex].score + scoreChange,
             trend: scoreChange > 0 ? 'up' : 'down',
             change: Math.abs(1) // Simplified for demo
           };
           // Re-sort
           newPlayers.sort((a, b) => b.score - a.score);
           // Re-assign ranks
           return newPlayers.map((p, idx) => ({ ...p, rank: idx + 1 }));
        }
        return newPlayers;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [loading]);

  const topThree = players.slice(0, 3);
  const restOfLeaderboard = players.slice(3, 20); // Show up to rank 20 for scrolling

  const handleUserSearch = (id: string) => {
    return players.find(p => p.id.toLowerCase() === id.toLowerCase() || p.username.toLowerCase().includes(id.toLowerCase()));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cyber-black flex flex-col items-center justify-center text-white">
        <div className="w-16 h-16 border-4 border-cyber-purple border-t-transparent rounded-full animate-spin mb-4"></div>
        <div className="font-cyber tracking-widest text-cyber-cyan animate-pulse">SYSTEM INITIALIZING...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyber-gradient text-white font-sans selection:bg-cyber-cyan/30">
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none z-0"></div>
      
      <div className="relative z-10">
        <Header />
        
        <main className="container mx-auto px-4 pb-32">
          
          {/* Top 3 Podium Section */}
          <section className="py-12 md:py-16">
             <div className="flex flex-col md:flex-row justify-center items-end gap-6 md:gap-4 lg:gap-8 max-w-7xl mx-auto">
               {/* Rank 2 (Silver) - Render 2nd on Desktop (Left) */}
               <div className="order-2 md:order-1 w-full md:w-auto flex justify-center z-10">
                 {topThree[1] && <TopThreeCard player={topThree[1]} position={2} />}
               </div>
               
               {/* Rank 1 (Gold) - Center and Highest */}
               <div className="order-1 md:order-2 w-full md:w-auto flex justify-center -mt-0 md:-mt-12 z-20">
                 {topThree[0] && <TopThreeCard player={topThree[0]} position={1} />}
               </div>
               
               {/* Rank 3 (Bronze) - Right */}
               <div className="order-3 md:order-3 w-full md:w-auto flex justify-center z-10">
                 {topThree[2] && <TopThreeCard player={topThree[2]} position={3} />}
               </div>
             </div>
          </section>

          {/* Stats Bar */}
          <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center text-sm text-slate-400 font-mono border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>TOTAL PLAYERS: {players.length.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyber-green" />
              <span>AVG SCORE: {Math.floor(players.reduce((a, b) => a + b.score, 0) / players.length).toLocaleString()}</span>
            </div>
          </div>

          {/* List Section */}
          <section className="max-w-4xl mx-auto">
            <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/5 p-4 md:p-6">
              <div className="grid grid-cols-[3rem_1fr_6rem_4rem] md:grid-cols-[4rem_1fr_8rem_5rem] gap-2 px-4 mb-4 text-xs font-cyber text-slate-500 uppercase tracking-widest">
                <div>Rank</div>
                <div>Player</div>
                <div className="text-right mr-4 md:mr-8">Score</div>
                <div className="text-right">Trend</div>
              </div>
              
              <div className="space-y-2">
                {restOfLeaderboard.map((player, index) => (
                  <LeaderboardRow 
                    key={player.id} 
                    player={player} 
                    index={index} 
                  />
                ))}
              </div>
              
              <div className="mt-8 text-center">
                <p className="text-slate-600 text-sm font-mono">Showing Top 20. Use search to find specific rank.</p>
              </div>
            </div>
          </section>
        </main>

        <UserSearch onSearch={handleUserSearch} />
      </div>
    </div>
  );
};

export default App;