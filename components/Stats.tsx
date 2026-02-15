import React, { useState, useEffect, useMemo } from 'react';
import { GameSettings, GameMode, SessionRecord, AnswerRecord } from '../types';
import { loadWeights, getTotalGamesPlayed, loadSessions } from '../services/storageService';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface StatsProps {
  settings: GameSettings;
  onBack: () => void;
  onSessionSelect: (session: SessionRecord) => void;
}

interface BreakdownStat {
    total: number;
    correct: number;
    timeSum: number;
    slowCount: number;
    lastResult: AnswerRecord;
}

interface BreakdownData {
    type: 'TABLE';
    stats: Record<number, BreakdownStat>;
    isSquares: boolean;
}

const Stats: React.FC<StatsProps> = ({ settings, onBack, onSessionSelect }) => {
  const [activeMode, setActiveMode] = useState<GameMode>('MULTIPLICATION'); // Default to Multiply as per user focus
  const [weights, setWeights] = useState<Record<number, number>>({});
  const [totalGames, setTotalGames] = useState(0);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [selectedOperand, setSelectedOperand] = useState<number | null>(null);

  const isKid = settings.kidMode;

  useEffect(() => {
    setTotalGames(getTotalGamesPlayed(isKid));
    const allSessions = loadSessions();
    setSessions(allSessions.filter(s => s.isKid === isKid));
  }, [isKid]);

  useEffect(() => {
    setWeights(loadWeights(activeMode, isKid));
  }, [activeMode, isKid]);

  // Determine grid range
  const getRange = () => {
      if (activeMode === 'SQUARES') return Array.from({length: 30}, (_, i) => i + 1);
      if (activeMode === 'MULTIPLICATION') return Array.from({length: 20}, (_, i) => i + 1);
      return Array.from({length: 20}, (_, i) => i + 1);
  };

  const getMasteryColor = (val: number) => {
      const w = weights[val];
      if (w === undefined) return isKid ? 'bg-gray-100 text-gray-400' : 'bg-[#2d2f31] text-gray-500';
      if (w <= 0.8) return isKid ? 'bg-green-200 text-green-800' : 'bg-[#0f291e] text-[#6dd58c] border border-[#6dd58c]/30';
      if (w >= 1.5) return isKid ? 'bg-red-200 text-red-800' : 'bg-[#3c1414] text-[#f2b8b5] border border-[#f2b8b5]/30';
      if (w > 1.0) return isKid ? 'bg-orange-100 text-orange-800' : 'bg-[#2a2012] text-[#ffb4ab] border border-[#ffb4ab]/30';
      return isKid ? 'bg-blue-50 text-blue-800' : 'bg-[#1e2b3b] text-[#a8c7fa]';
  };

  const getModeIcon = (mode: GameMode) => {
      switch(mode) {
          case 'SQUARES': return 'square_foot';
          case 'ADDITION': return 'add';
          case 'SUBTRACTION': return 'remove';
          case 'MULTIPLICATION': return 'close';
          case 'DIVISION': return 'percent';
          default: return 'calculate';
      }
  };

  const getModeLabel = (mode: GameMode) => {
      switch(mode) {
          case 'SQUARES': return 'Squares';
          case 'ADDITION': return 'Addition';
          case 'SUBTRACTION': return 'Subtraction';
          case 'MULTIPLICATION': return 'Multiplication';
          case 'DIVISION': return 'Division';
          default: return mode;
      }
  };

  const getExpectedScore = (session: SessionRecord) => {
      if (typeof session.duration !== 'number') return null;
      const minutes = session.duration / 60;
      let rate = 20;
      if (session.isKid) {
          switch (session.mode) {
              case 'ADDITION': case 'SUBTRACTION': rate = 15; break; 
              default: rate = 10;
          }
      } else {
          switch (session.mode) {
              case 'SQUARES': rate = 30; break;
              case 'ADDITION': case 'SUBTRACTION': rate = 25; break; 
              case 'MULTIPLICATION': rate = 20; break; 
              case 'DIVISION': rate = 15; break; 
          }
      }
      if (session.optionsMode) rate *= 1.25;
      return Math.round(rate * minutes);
  };

  // Detailed Stats Calculation
  const breakdown = useMemo<BreakdownData | null>(() => {
    if (selectedOperand === null) return null;

    if (activeMode === 'SQUARES') {
        // For Squares, we show the TABLE of all squares
        const statsByBase: Record<number, BreakdownStat> = {};

        sessions.forEach(s => {
            if (s.mode === 'SQUARES' && s.history) {
                s.history.forEach(a => {
                    const val = a.question.val1;
                    if (!statsByBase[val]) {
                        statsByBase[val] = { total: 0, correct: 0, timeSum: 0, slowCount: 0, lastResult: a };
                    }
                    const entry = statsByBase[val];
                    entry.total++;
                    if (a.isCorrect) entry.correct++;
                    entry.timeSum += a.timeTaken;
                    if (a.timeTaken > 5000) entry.slowCount++;
                });
            }
        });
        
        return { type: 'TABLE', stats: statsByBase, isSquares: true };
    }

    // For operations, group by counterpart
    const statsByCounterpart: Record<number, BreakdownStat> = {};

    // Filter relevant answers from all sessions
    const relevantAnswers: AnswerRecord[] = [];
    sessions.forEach(s => {
        if (s.mode === activeMode && s.history) {
            s.history.forEach(a => {
                if (a.question.val1 === selectedOperand || a.question.val2 === selectedOperand) {
                    relevantAnswers.push(a);
                }
            });
        }
    });

    relevantAnswers.forEach(a => {
        // Identify counterpart
        let cp = a.question.val1 === selectedOperand ? a.question.val2 : a.question.val1;
        if (cp === undefined) return;

        if (!statsByCounterpart[cp]) {
            statsByCounterpart[cp] = { total: 0, correct: 0, timeSum: 0, slowCount: 0, lastResult: a };
        }
        
        const entry = statsByCounterpart[cp];
        entry.total++;
        if (a.isCorrect) entry.correct++;
        entry.timeSum += a.timeTaken;
        if (a.timeTaken > 5000) entry.slowCount++; 
    });
    
    return { type: 'TABLE', stats: statsByCounterpart, isSquares: false };
  }, [selectedOperand, sessions, activeMode]);

  // --- NEW: Trend Data ---
  const trendData = useMemo(() => {
    // Filter sessions by activeMode, take last 10, reverse for chart (Old -> New)
    return sessions
        .filter(s => s.mode === activeMode && s.total > 0)
        .slice(0, 10)
        .reverse()
        .map(s => ({
            date: new Date(s.timestamp).toLocaleDateString(undefined, {month:'numeric', day:'numeric'}),
            score: s.score,
            accuracy: Math.round((s.correct / s.total) * 100)
        }));
  }, [sessions, activeMode]);

  // --- NEW: Weakest Links ---
  const weakestConcepts = useMemo(() => {
    return Object.entries(weights)
        .map(([k, w]) => ({ val: parseInt(k), weight: w }))
        .filter(i => i.weight > 1.2) // Threshold for "hard"
        .sort((a, b) => b.weight - a.weight) // Highest weight first
        .slice(0, 5);
  }, [weights]);

  const modes: { id: GameMode; label: string }[] = [
      { id: 'SQUARES', label: 'Squares' },
      { id: 'MULTIPLICATION', label: 'Multiply' },
      { id: 'ADDITION', label: 'Add' },
      { id: 'SUBTRACTION', label: 'Subtract' },
  ];

  // Colors
  const pageBg = isKid ? "bg-[#fef7ff]" : "bg-[#121212]";
  const textMain = isKid ? "text-[#1d1b20]" : "text-[#e3e3e3]";
  const textSub = isKid ? "text-[#49454f]" : "text-[#c4c7c5]";
  const surface = isKid ? "bg-[#f3edf7]" : "bg-[#1e1e1e]";
  const surfaceContainer = isKid ? "bg-white" : "bg-[#2d2f31]";
  const modalBg = isKid ? "bg-white" : "bg-[#2d2f31]";
  const chartStroke = isKid ? "#6750a4" : "#d0bcff";

  return (
    <div className={`min-h-screen flex flex-col ${pageBg} ${textMain}`}>
        
        {/* Header */}
        <div className={`p-4 flex items-center gap-4 ${surface}`}>
            <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                <span className="material-symbol">arrow_back</span>
            </button>
            <h1 className="text-xl font-bold">Progress Stats {isKid && "(Kid Mode)"}</h1>
        </div>

        <div className="p-4 md:p-6 max-w-4xl mx-auto w-full space-y-6">
            
            {/* Mode Selector - Moved to top for global context */}
             <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {modes.map(m => (
                    <button
                        key={m.id}
                        onClick={() => { setActiveMode(m.id); setSelectedOperand(null); }}
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

            {/* Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className={`p-5 rounded-[24px] ${isKid ? 'bg-[#e8def8] text-[#1d1b20]' : 'bg-[#4f378b] text-[#eaddff]'}`}>
                    <div className="flex items-center gap-2 mb-1 opacity-80">
                        <span className="material-symbol text-sm">stadia_controller</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider">Games</span>
                    </div>
                    <span className="text-3xl font-bold">{totalGames}</span>
                </div>
                <div className={`p-5 rounded-[24px] ${isKid ? 'bg-[#c3ecd2] text-[#05210f]' : 'bg-[#334841] text-[#cce8e0]'}`}>
                    <div className="flex items-center gap-2 mb-1 opacity-80">
                        <span className="material-symbol text-sm">verified</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider">Mastered</span>
                    </div>
                    <span className="text-3xl font-bold">
                        {Object.keys(weights).filter(k => weights[parseInt(k)] <= 0.8).length}
                    </span>
                </div>
                 {/* Weakest Links Card */}
                 <div className={`col-span-2 p-5 rounded-[24px] flex flex-col justify-center ${isKid ? 'bg-[#f9dedc] text-[#410e0b]' : 'bg-[#601410] text-[#f9dedc]'}`}>
                    <div className="flex items-center gap-2 mb-2 opacity-80">
                        <span className="material-symbol text-sm">warning</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider">Needs Focus</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {weakestConcepts.length > 0 ? weakestConcepts.map(w => (
                            <span key={w.val} className={`px-2 py-1 rounded-md text-sm font-bold bg-black/5 dark:bg-white/10`}>
                                {w.val}{activeMode === 'SQUARES' ? '²' : ''}
                            </span>
                        )) : (
                            <span className="text-sm font-medium opacity-80">No weak spots found yet!</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Performance Chart */}
            {trendData.length > 1 && (
                <div className={`rounded-[24px] p-6 ${surfaceContainer}`}>
                    <h2 className="text-lg font-bold mb-4">Score Trend ({getModeLabel(activeMode)})</h2>
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                                <XAxis 
                                    dataKey="date" 
                                    tick={{fontSize: 10, fill: isKid ? '#49454f' : '#c4c7c5'}} 
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis 
                                    hide 
                                    domain={['auto', 'auto']}
                                />
                                <Tooltip 
                                    contentStyle={{
                                        backgroundColor: isKid ? '#fff' : '#2d2f31',
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}
                                    labelStyle={{ color: isKid ? '#1d1b20' : '#e3e3e3', fontSize: '12px' }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="score" 
                                    stroke={chartStroke} 
                                    strokeWidth={3} 
                                    dot={{r: 4, fill: chartStroke, strokeWidth: 0}}
                                    activeDot={{r: 6}}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Heatmap Section */}
            <div className={`rounded-[24px] p-6 ${surfaceContainer}`}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold">Concept Heatmap</h2>
                    <div className="flex gap-2">
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

                <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-3 mt-4">
                    {getRange().map(num => (
                        <button
                            key={num} 
                            onClick={() => setSelectedOperand(num)}
                            className={`aspect-square rounded-2xl flex items-center justify-center text-lg font-bold transition-transform hover:scale-105 active:scale-95 ${getMasteryColor(num)}`}
                        >
                            {num}
                        </button>
                    ))}
                </div>
                <p className={`text-xs text-center mt-6 ${textSub}`}>
                    Tap a number to see detailed breakdown.
                </p>
            </div>

            {/* Recent Sessions List */}
            <div className={`rounded-[24px] p-6 ${surfaceContainer}`}>
                <h2 className="text-lg font-bold mb-4">Recent Sessions</h2>
                <div className="space-y-3">
                    {sessions.length === 0 && (
                        <p className={`text-sm opacity-50 text-center py-4 ${textSub}`}>No games played yet.</p>
                    )}
                    {sessions.map((session) => {
                        const expected = getExpectedScore(session);
                        return (
                            <div 
                                key={session.id} 
                                onClick={() => onSessionSelect(session)}
                                className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-colors ${surface} hover:opacity-80 active:scale-[0.98]`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl flex items-center justify-center ${isKid ? 'bg-indigo-100 text-indigo-700' : 'bg-white/5 text-gray-300'}`}>
                                        <span className="material-symbol text-xl">{getModeIcon(session.mode)}</span>
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm flex items-center gap-2">
                                            {getModeLabel(session.mode)}
                                            {session.optionsMode && (
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${isKid ? 'border-indigo-200 text-indigo-700' : 'border-gray-600 text-gray-400'}`}>MCQ</span>
                                            )}
                                        </div>
                                        <div className={`text-xs ${textSub}`}>
                                            {new Date(session.timestamp).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`font-mono font-bold text-xl ${session.correct === session.total ? 'text-green-500' : ''}`}>
                                        {session.score} <span className="text-xs font-normal opacity-50">/ {session.total}</span>
                                    </div>
                                    {expected && <div className="text-[10px] opacity-60">Exp: {expected}</div>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>

        {/* Breakdown Modal */}
        {selectedOperand !== null && breakdown && (
            <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4 animate-fade-in" onClick={() => setSelectedOperand(null)}>
                <div className={`w-full md:max-w-md max-h-[85vh] flex flex-col rounded-t-[32px] md:rounded-[32px] overflow-hidden shadow-2xl animate-slide-up ${modalBg} ${textMain}`} onClick={e => e.stopPropagation()}>
                    
                    {/* Modal Header */}
                    <div className={`p-6 pb-4 flex items-center justify-between ${surface}`}>
                        <div>
                            <div className={`text-xs font-bold uppercase tracking-wider opacity-60`}>Detailed Analysis</div>
                            <h2 className="text-2xl font-bold">
                                {breakdown.isSquares ? 'Squares Analysis' : `Table of ${selectedOperand}`}
                            </h2>
                        </div>
                        <button onClick={() => setSelectedOperand(null)} className="w-10 h-10 rounded-full flex items-center justify-center bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20">
                            <span className="material-symbol">close</span>
                        </button>
                    </div>

                    {/* Modal Content */}
                    <div className="overflow-y-auto p-4 space-y-2">
                        {/* We reuse the TABLE view for squares to list them 1...30 */}
                        {breakdown.type === 'TABLE' && (
                            <>
                                {(breakdown.isSquares ? Array.from({length: 30}, (_,i)=>i+1) : Array.from({length: 12}, (_, i) => i + 1)).map(k => {
                                    const stat = breakdown.stats[k];
                                    const hasData = !!stat;
                                    const accuracy = hasData ? Math.round((stat.correct / stat.total) * 100) : 0;
                                    const avgTime = hasData ? stat.timeSum / stat.total : 0;
                                    const isSlow = avgTime > 4000;
                                    const opChar = activeMode === 'MULTIPLICATION' ? '×' : activeMode === 'ADDITION' ? '+' : activeMode === 'SUBTRACTION' ? '−' : '÷';

                                    let statusColor = isKid ? "text-gray-400" : "text-gray-600";
                                    let statusText = "Unseen";
                                    let rowBg = "bg-transparent";

                                    // Highlight selected square if it matches (just a subtle bg)
                                    if (breakdown.isSquares && k === selectedOperand) {
                                         rowBg = isKid ? "bg-indigo-50 border border-indigo-200" : "bg-white/5 border border-white/10";
                                    }

                                    if (hasData) {
                                        if (accuracy < 80) {
                                            statusColor = "text-red-500";
                                            statusText = "Struggling";
                                            if (!rowBg.includes('border')) rowBg = isKid ? "bg-red-50" : "bg-red-900/10";
                                        } else if (isSlow) {
                                            statusColor = "text-yellow-500";
                                            statusText = "Slow";
                                            if (!rowBg.includes('border')) rowBg = isKid ? "bg-yellow-50" : "bg-yellow-900/10";
                                        } else {
                                            statusColor = "text-green-500";
                                            statusText = "Mastered";
                                            if (!rowBg.includes('border')) rowBg = isKid ? "bg-green-50" : "bg-green-900/10";
                                        }
                                        
                                        // Override if last attempt was wrong
                                        if (stat.lastResult && !stat.lastResult.isCorrect) {
                                            statusText = "Last: Wrong";
                                            statusColor = "text-red-500";
                                        }
                                    }

                                    return (
                                        <div key={k} className={`flex items-center justify-between p-4 rounded-xl ${rowBg}`}>
                                            <div className="flex items-center gap-4">
                                                <div className={`text-xl font-mono font-bold w-24`}>
                                                    {breakdown.isSquares ? `${k}²` : `${selectedOperand} ${opChar} ${k}`}
                                                </div>
                                            </div>
                                            
                                            {hasData ? (
                                                <div className="text-right">
                                                    <div className={`text-xs font-bold uppercase tracking-wider mb-0.5 ${statusColor}`}>
                                                        {statusText}
                                                    </div>
                                                    <div className="text-sm font-medium opacity-80">
                                                        {(avgTime/1000).toFixed(1)}s avg • {accuracy}%
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-sm opacity-30 italic">Not practiced</div>
                                            )}
                                        </div>
                                    )
                                })}
                                {/* Show extra practiced numbers if they exist (outside standard range) */}
                                {Object.keys(breakdown.stats).map(kStr => parseInt(kStr)).filter(k => k > (breakdown.isSquares ? 30 : 12)).sort((a,b)=>a-b).map(k => {
                                     const stat = breakdown.stats[k];
                                     const accuracy = Math.round((stat.correct / stat.total) * 100);
                                     const avgTime = stat.timeSum / stat.total;
                                     const opChar = activeMode === 'MULTIPLICATION' ? '×' : activeMode === 'ADDITION' ? '+' : activeMode === 'SUBTRACTION' ? '−' : '÷';
                                     return (
                                        <div key={k} className={`flex items-center justify-between p-4 rounded-xl ${isKid ? 'bg-indigo-50' : 'bg-[#1e1e1e] border border-white/5'}`}>
                                            <div className="text-xl font-mono font-bold w-24">
                                                {breakdown.isSquares ? `${k}²` : `${selectedOperand} ${opChar} ${k}`}
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs font-bold uppercase tracking-wider mb-0.5 text-indigo-500">
                                                    Extra
                                                </div>
                                                <div className="text-sm font-medium opacity-80">
                                                    {(avgTime/1000).toFixed(1)}s avg • {accuracy}%
                                                </div>
                                            </div>
                                        </div>
                                     )
                                })}
                            </>
                        )}
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default Stats;