import React, { useState, useEffect } from 'react';
import { GameSettings, GameMode } from '../types';
import { loadWeights, getTotalGamesPlayed } from '../services/storageService';

interface StatsProps {
  settings: GameSettings;
  onBack: () => void;
}

const Stats: React.FC<StatsProps> = ({ settings, onBack }) => {
  const [activeMode, setActiveMode] = useState<GameMode>('SQUARES');
  const [weights, setWeights] = useState<Record<number, number>>({});
  const [totalGames, setTotalGames] = useState(0);

  const isKid = settings.kidMode;

  useEffect(() => {
    setTotalGames(getTotalGamesPlayed());
  }, []);

  useEffect(() => {
    setWeights(loadWeights(activeMode));
  }, [activeMode]);

  // Determine grid range based on mode heuristics or data
  const getRange = () => {
      if (activeMode === 'SQUARES') return Array.from({length: 30}, (_, i) => i + 1); // 1-30
      if (activeMode === 'MULTIPLICATION') return Array.from({length: 20}, (_, i) => i + 1); // 1-20 tables
      return Array.from({length: 20}, (_, i) => i + 1); // Default
  };

  const getMasteryColor = (val: number) => {
      const w = weights[val];
      if (w === undefined) return isKid ? 'bg-gray-100 text-gray-400' : 'bg-[#2d2f31] text-gray-500'; // Unknown
      
      // Weight logic: < 0.8 = Mastered (Green), > 1.2 = Needs Work (Red), else Neutral
      if (w <= 0.8) return isKid ? 'bg-green-200 text-green-800' : 'bg-[#0f291e] text-[#6dd58c] border border-[#6dd58c]/30';
      if (w >= 1.5) return isKid ? 'bg-red-200 text-red-800' : 'bg-[#3c1414] text-[#f2b8b5] border border-[#f2b8b5]/30';
      if (w > 1.0) return isKid ? 'bg-orange-100 text-orange-800' : 'bg-[#2a2012] text-[#ffb4ab] border border-[#ffb4ab]/30';
      return isKid ? 'bg-blue-50 text-blue-800' : 'bg-[#1e2b3b] text-[#a8c7fa]'; // In progress
  };

  const modes: { id: GameMode; label: string }[] = [
      { id: 'SQUARES', label: 'Squares' },
      { id: 'MULTIPLICATION', label: 'Multiply' },
      { id: 'ADDITION', label: 'Add' },
      { id: 'SUBTRACTION', label: 'Subtract' },
  ];

  // Theme Constants
  const pageBg = isKid ? "bg-[#fef7ff]" : "bg-[#121212]";
  const textMain = isKid ? "text-[#1d1b20]" : "text-[#e3e3e3]";
  const textSub = isKid ? "text-[#49454f]" : "text-[#c4c7c5]";
  const surface = isKid ? "bg-[#f3edf7]" : "bg-[#1e1e1e]";
  const surfaceContainer = isKid ? "bg-white" : "bg-[#2d2f31]";

  return (
    <div className={`min-h-screen flex flex-col ${pageBg} ${textMain}`}>
        
        {/* Header */}
        <div className={`p-4 flex items-center gap-4 ${surface}`}>
            <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                <span className="material-symbol">arrow_back</span>
            </button>
            <h1 className="text-xl font-bold">Progress Stats</h1>
        </div>

        <div className="p-4 md:p-6 max-w-4xl mx-auto w-full space-y-6">
            
            {/* Overview Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className={`p-6 rounded-[24px] ${isKid ? 'bg-[#e8def8] text-[#1d1b20]' : 'bg-[#4f378b] text-[#eaddff]'}`}>
                    <div className="flex items-center gap-2 mb-2 opacity-80">
                        <span className="material-symbol">stadia_controller</span>
                        <span className="text-xs font-bold uppercase tracking-wider">Sessions</span>
                    </div>
                    <span className="text-4xl font-bold">{totalGames}</span>
                </div>
                <div className={`p-6 rounded-[24px] ${isKid ? 'bg-[#c3ecd2] text-[#05210f]' : 'bg-[#334841] text-[#cce8e0]'}`}>
                    <div className="flex items-center gap-2 mb-2 opacity-80">
                        <span className="material-symbol">verified</span>
                        <span className="text-xs font-bold uppercase tracking-wider">Mastery</span>
                    </div>
                    <span className="text-4xl font-bold">
                        {Object.keys(weights).filter(k => weights[parseInt(k)] <= 0.9).length}
                    </span>
                    <span className="text-sm ml-2 opacity-70">concepts</span>
                </div>
            </div>

            {/* Heatmap Section */}
            <div className={`rounded-[24px] p-6 ${surfaceContainer}`}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold">Proficiency Heatmap</h2>
                    <div className="flex gap-2">
                        {/* Legend */}
                        <div className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wide opacity-60">
                            <div className={`w-3 h-3 rounded-full ${isKid ? 'bg-green-400' : 'bg-[#6dd58c]'}`}></div>
                            <span>Strong</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wide opacity-60">
                            <div className={`w-3 h-3 rounded-full ${isKid ? 'bg-red-400' : 'bg-[#f2b8b5]'}`}></div>
                            <span>Weak</span>
                        </div>
                    </div>
                </div>

                {/* Mode Selector Chips */}
                <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                    {modes.map(m => (
                        <button
                            key={m.id}
                            onClick={() => setActiveMode(m.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                                activeMode === m.id 
                                ? (isKid ? 'bg-[#6750a4] text-white' : 'bg-[#d0bcff] text-[#381e72]')
                                : (isKid ? 'bg-white border border-[#79747e]' : 'bg-transparent border border-[#938f99]')
                            }`}
                        >
                            {m.label}
                        </button>
                    ))}
                </div>

                {/* The Grid */}
                <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-3 mt-4">
                    {getRange().map(num => (
                        <div 
                            key={num} 
                            className={`aspect-square rounded-2xl flex items-center justify-center text-lg font-bold transition-transform hover:scale-105 ${getMasteryColor(num)}`}
                        >
                            {num}
                        </div>
                    ))}
                </div>
                
                <p className={`text-xs text-center mt-6 ${textSub}`}>
                    * Numbers show base operands (e.g., "12" represents 12², 12×N, etc.)
                </p>
            </div>
        </div>
    </div>
  );
};

export default Stats;