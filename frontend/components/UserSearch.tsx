import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Trophy, ScanLine } from 'lucide-react';
import { Player } from '../types';

interface UserSearchProps {
  onSearch: (id: string) => Player | undefined;
}

const UserSearch: React.FC<UserSearchProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<Player | null | 'not-found'>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    const player = onSearch(query);
    setResult(player || 'not-found');
    setIsOpen(true);
  };

  const clearSearch = () => {
    setQuery('');
    setResult(null);
    setIsOpen(false);
  };

  return (
    <>
      {/* Backdrop for focus mode */}
      <AnimatePresence>
        {(isFocused || isOpen) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
            onClick={() => {
              setIsFocused(false);
              if (!result) setIsOpen(false);
            }}
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-0 left-0 right-0 z-40 flex flex-col items-center justify-end px-4 pb-6 md:pb-8 pointer-events-none">
        
        {/* Result Popup - Floats above the search bar */}
        <AnimatePresence>
          {isOpen && result && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="pointer-events-auto w-full max-w-3xl mb-4 bg-cyber-slate border-2 border-cyber-cyan/50 rounded-xl overflow-hidden relative shadow-[0_0_50px_rgba(0,240,255,0.2)]"
            >
               {/* Decorative background grid */}
               <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"></div>

              <div className="p-1 bg-gradient-to-r from-cyber-cyan/20 to-cyber-purple/20">
                <div className="bg-cyber-black/90 p-5 rounded-lg relative z-10">
                  <div className="flex items-center justify-between">
                    {result === 'not-found' ? (
                      <div className="flex items-center gap-4 text-red-400 w-full">
                        <div className="p-3 bg-red-500/10 rounded-full border border-red-500/20">
                           <X className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-cyber font-bold tracking-wide">SYSTEM ERROR</h4>
                          <span className="font-mono text-sm text-red-400/70">User ID not found in database.</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-5 w-full">
                        <div className="relative">
                          <img 
                            src={result.avatar} 
                            alt={result.username} 
                            className="w-16 h-16 rounded-lg border-2 border-cyber-cyan object-cover"
                          />
                          <div className="absolute -bottom-2 -right-2 bg-cyber-black border border-cyber-cyan text-cyber-cyan text-[10px] font-bold px-1.5 py-0.5 rounded">
                            LVL.99
                          </div>
                        </div>
                        
                        <div className="flex-grow">
                          <h4 className="text-xl font-bold text-white flex items-center gap-2 tracking-wide">
                            {result.username}
                            {result.rank <= 3 && <Trophy className="w-5 h-5 text-yellow-500" />}
                          </h4>
                          <p className="text-xs text-cyber-cyan/70 font-mono tracking-wider">ID: {result.id}</p>
                        </div>
                        
                        <div className="text-right pl-4 border-l border-white/10">
                          <div className="text-[10px] text-slate-500 uppercase font-cyber tracking-widest mb-1">Rank</div>
                          <div className="text-4xl font-cyber font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 leading-none">
                            #{result.rank}
                          </div>
                          <div className="text-xs font-mono text-cyber-green mt-1">{result.score.toLocaleString()} PTS</div>
                        </div>
                      </div>
                    )}
                    
                    <button 
                      onClick={clearSearch}
                      className="ml-4 p-2 hover:bg-white/10 rounded-lg transition-colors group"
                    >
                      <X className="w-5 h-5 text-slate-500 group-hover:text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Search Bar */}
        <div className="w-full max-w-5xl pointer-events-auto">
          <form 
            onSubmit={handleSearch} 
            className={`relative transition-all duration-300 transform ${isFocused ? 'scale-105' : 'scale-100'}`}
          >
            {/* Main Container */}
            <div className={`
              relative flex items-center bg-cyber-slate/90 backdrop-blur-xl 
              border-y border-x rounded-2xl p-2
              transition-all duration-300
              ${isFocused 
                ? 'border-cyber-cyan shadow-[0_0_30px_rgba(0,240,255,0.3)]' 
                : 'border-white/10 border-b-cyber-purple/50 shadow-lg shadow-black/50'}
            `}>
              
              {/* Label Badge */}
              <div className="absolute -top-3 left-6 px-3 py-0.5 bg-cyber-black border border-cyber-cyan/30 rounded text-[10px] font-cyber text-cyber-cyan tracking-widest uppercase z-10">
                Find Player Rank
              </div>

              {/* Icon Section */}
              <div className={`
                flex items-center justify-center w-12 h-12 rounded-xl mr-3 transition-colors duration-300
                ${isFocused ? 'bg-cyber-cyan/20 text-cyber-cyan' : 'bg-white/5 text-slate-400'}
              `}>
                <Search className="w-6 h-6" />
              </div>

              {/* Input Field */}
              <input 
                type="text" 
                value={query}
                onFocus={() => setIsFocused(true)}
                onBlur={() => {
                  // Delay blur to allow click on submit button
                  setTimeout(() => {
                    if (!isOpen) setIsFocused(false);
                  }, 200);
                }}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter Username or ID..."
                className="flex-grow bg-transparent border-none outline-none text-white text-lg font-mono placeholder-slate-500 h-12"
              />

              {/* Action Button */}
              <button 
                type="submit"
                disabled={!query.trim()}
                className={`
                  h-12 px-6 rounded-xl font-bold font-cyber tracking-wider transition-all duration-300 flex items-center gap-2
                  ${query.trim() 
                    ? 'bg-gradient-to-r from-cyber-purple to-cyber-cyan text-black shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:shadow-[0_0_25px_rgba(0,240,255,0.6)] transform hover:scale-105' 
                    : 'bg-white/5 text-slate-500 cursor-not-allowed'}
                `}
              >
                <span>LOCATE</span>
                <ScanLine className="w-4 h-4" />
              </button>
            </div>

            {/* Decorative corners */}
            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-cyber-cyan/50 rounded-bl-lg"></div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-cyber-cyan/50 rounded-br-lg"></div>
          </form>
        </div>
      </div>
    </>
  );
};

export default UserSearch;