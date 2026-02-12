import React from 'react';
import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown, Minus } from 'lucide-react';
import { Player } from '../types';

interface LeaderboardRowProps {
  player: Player;
  index: number; // Index in the list (0-based) used for staggered animation
}

const LeaderboardRow: React.FC<LeaderboardRowProps> = ({ player, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ scale: 1.01, backgroundColor: "rgba(255, 255, 255, 0.03)" }}
      className="flex items-center p-4 mb-2 bg-cyber-slate/30 backdrop-blur-sm border border-white/5 rounded-lg hover:border-cyber-cyan/30 transition-colors group cursor-default"
    >
      {/* Rank */}
      <div className="w-12 md:w-16 flex-shrink-0">
        <span className="font-cyber font-bold text-slate-400 group-hover:text-white transition-colors">
          #{player.rank}
        </span>
      </div>

      {/* Avatar & Name */}
      <div className="flex items-center flex-grow gap-3 overflow-hidden">
        <img 
          src={player.avatar} 
          alt={player.username} 
          className="w-10 h-10 rounded-full border border-white/10 group-hover:border-cyber-cyan/50 transition-colors"
        />
        <div className="flex flex-col overflow-hidden">
          <span className="font-medium text-white truncate group-hover:text-cyber-cyan transition-colors">
            {player.username}
          </span>
          <span className="text-[10px] text-slate-500 font-mono hidden md:block">
            ID: {player.id}
          </span>
        </div>
      </div>

      {/* Score */}
      <div className="w-24 md:w-32 text-right mr-4 md:mr-8">
        <span className="font-mono font-bold text-white tracking-tight">
          {player.score.toLocaleString()}
        </span>
      </div>

      {/* Trend */}
      <div className="w-16 md:w-20 flex justify-end items-center gap-1">
        {player.trend === 'up' && <ChevronUp className="w-4 h-4 text-cyber-green" />}
        {player.trend === 'down' && <ChevronDown className="w-4 h-4 text-red-500" />}
        {player.trend === 'stable' && <Minus className="w-4 h-4 text-slate-600" />}
        
        <span className={`text-xs font-mono ${
          player.trend === 'up' ? 'text-cyber-green' : 
          player.trend === 'down' ? 'text-red-500' : 'text-slate-600'
        }`}>
          {player.trend === 'stable' ? '-' : Math.abs(player.change)}
        </span>
      </div>
    </motion.div>
  );
};

export default LeaderboardRow;