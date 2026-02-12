import React from 'react';
import { Activity, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const Header: React.FC = () => {
  return (
    <header className="flex flex-col md:flex-row justify-between items-center py-6 px-4 md:px-8 bg-cyber-slate/50 backdrop-blur-sm border-b border-white/5 sticky top-0 z-50">
      <div className="flex items-center gap-3 mb-4 md:mb-0">
        <div className="p-2 bg-cyber-purple/20 rounded-lg border border-cyber-purple/50 shadow-[0_0_15px_rgba(176,38,255,0.3)]">
          <Zap className="w-6 h-6 text-cyber-purple" />
        </div>
        <div>
          <h1 className="text-2xl font-cyber font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-cyber-cyan to-cyber-purple">
            NEON<span className="text-white">NEXUS</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono tracking-widest uppercase">Global Rankings SZN_04</p>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-full border border-white/5">
        <div className="relative flex items-center justify-center w-3 h-3">
          <motion.span
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inline-flex h-full w-full rounded-full bg-cyber-green opacity-75"
          ></motion.span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-green"></span>
        </div>
        <span className="text-cyber-green font-mono text-xs font-bold tracking-wider flex items-center gap-2">
          LIVE UPDATES <Activity className="w-3 h-3" />
        </span>
      </div>
    </header>
  );
};

export default Header;