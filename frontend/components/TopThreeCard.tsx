import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, ChevronUp, ChevronDown, Minus } from 'lucide-react';
import { Player } from '../types';

interface TopThreeCardProps {
  player: Player;
  position: 1 | 2 | 3;
}

const TopThreeCard: React.FC<TopThreeCardProps> = ({ player, position }) => {
  const isFirst = position === 1;
  
  // Visual configs based on rank
  const colorConfig = {
    1: {
      border: 'border-yellow-500',
      shadow: 'shadow-yellow-500/20',
      glow: 'shadow-[0_0_40px_rgba(234,179,8,0.4)]',
      hoverGlow: 'hover:shadow-[0_0_80px_rgba(234,179,8,0.6)] hover:border-yellow-300',
      text: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      iconColor: '#eab308'
    },
    2: {
      border: 'border-slate-300',
      shadow: 'shadow-slate-300/20',
      glow: 'shadow-[0_0_30px_rgba(203,213,225,0.25)]',
      hoverGlow: 'hover:shadow-[0_0_60px_rgba(203,213,225,0.5)] hover:border-white',
      text: 'text-slate-300',
      bg: 'bg-slate-300/10',
      iconColor: '#cbd5e1'
    },
    3: {
      border: 'border-orange-600',
      shadow: 'shadow-orange-600/20',
      glow: 'shadow-[0_0_30px_rgba(234,88,12,0.25)]',
      hoverGlow: 'hover:shadow-[0_0_60px_rgba(234,88,12,0.5)] hover:border-orange-400',
      text: 'text-orange-500',
      bg: 'bg-orange-600/10',
      iconColor: '#ea580c'
    }
  }[position];

  // Dynamic sizing based on rank - Reduced sizes slightly to fit better
  const dimensions = isFirst ? {
    width: 'w-full max-w-[300px] md:max-w-[350px]',
    avatar: 'w-24 h-24 md:w-32 md:h-32',
    title: 'text-xl md:text-3xl',
    score: 'text-2xl md:text-4xl',
    padding: 'p-6 md:p-8',
    rankBadge: 'text-sm md:text-base px-5 py-1'
  } : {
    width: 'w-full max-w-[260px] md:max-w-[300px]',
    avatar: 'w-20 h-20 md:w-24 md:h-24',
    title: 'text-lg md:text-xl',
    score: 'text-xl md:text-2xl',
    padding: 'p-5 md:p-6',
    rankBadge: 'text-xs px-3 py-1'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: position * 0.15 }}
      className={`relative group flex flex-col items-center ${dimensions.padding} rounded-3xl backdrop-blur-xl border ${colorConfig.border} ${colorConfig.bg} ${colorConfig.glow} ${colorConfig.hoverGlow} transition-all duration-300 hover:scale-[1.05] cursor-pointer z-10 hover:z-20 ${dimensions.width}`}
    >
      {/* Rank Badge */}
      <div className={`absolute -top-4 rounded-full font-cyber font-bold bg-black border ${colorConfig.border} ${colorConfig.text} z-10 shadow-lg ${dimensions.rankBadge} group-hover:scale-110 transition-transform duration-300`}>
        RANK #{player.rank}
      </div>

      {/* Avatar with Glow */}
      <div className="relative mb-4 mt-2">
        <div className={`absolute inset-0 rounded-full blur-2xl ${colorConfig.bg} opacity-60 group-hover:opacity-100 transition-opacity duration-300`}></div>
        <img 
          src={player.avatar} 
          alt={player.username} 
          className={`relative ${dimensions.avatar} rounded-full border-[4px] ${colorConfig.border} object-cover shadow-2xl group-hover:scale-105 transition-transform duration-300`}
        />
        {isFirst && (
          <motion.div 
            initial={{ rotate: -10 }}
            animate={{ rotate: 10 }}
            transition={{ repeat: Infinity, repeatType: "reverse", duration: 2 }}
            className="absolute -top-6 -right-6 drop-shadow-2xl z-20 group-hover:scale-110 transition-transform duration-300"
          >
            <Trophy size={48} fill={colorConfig.iconColor} className={colorConfig.text} />
          </motion.div>
        )}
      </div>

      {/* Username */}
      <h3 className={`${dimensions.title} font-bold text-white mb-1 tracking-wide truncate w-full text-center group-hover:tracking-wider transition-all duration-300`}>
        {player.username}
      </h3>
      <p className="text-xs md:text-sm text-slate-400 font-mono mb-4 bg-black/30 px-3 py-1 rounded group-hover:bg-black/50 transition-colors">ID: {player.id}</p>

      {/* Score Display */}
      <div className="flex flex-col items-center justify-center w-full bg-black/40 rounded-2xl py-4 border border-white/5 shadow-inner group-hover:border-white/20 transition-colors">
        <span className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-mono mb-1">Total Score</span>
        <span className={`${dimensions.score} font-mono font-bold ${colorConfig.text} tracking-tight drop-shadow-md group-hover:scale-110 transition-transform duration-300 inline-block`}>
          {player.score.toLocaleString()}
        </span>
      </div>

      {/* Trend */}
      <div className="flex items-center gap-2 mt-4 text-sm md:text-base">
        {player.trend === 'up' && <ChevronUp className="w-5 h-5 text-cyber-green" />}
        {player.trend === 'down' && <ChevronDown className="w-5 h-5 text-red-500" />}
        {player.trend === 'stable' && <Minus className="w-5 h-5 text-slate-500" />}
        
        <span className={`font-mono font-bold ${
          player.trend === 'up' ? 'text-cyber-green' : 
          player.trend === 'down' ? 'text-red-500' : 'text-slate-500'
        }`}>
          {player.trend === 'stable' ? '-' : Math.abs(player.change)}
        </span>
      </div>
      
      {/* Decorative Corners */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white/30 rounded-tl-lg m-2 group-hover:border-white/60 transition-colors"></div>
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-white/30 rounded-tr-lg m-2 group-hover:border-white/60 transition-colors"></div>
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-white/30 rounded-bl-lg m-2 group-hover:border-white/60 transition-colors"></div>
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white/30 rounded-br-lg m-2 group-hover:border-white/60 transition-colors"></div>
    </motion.div>
  );
};

export default TopThreeCard;