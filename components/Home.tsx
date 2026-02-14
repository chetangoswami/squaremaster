import React, { useState, useEffect } from 'react';
import { AppView, GameSettings, GameMode } from '../types';
import { BookOpen, ChevronRight, Settings2, Trash2, Plus, Minus, Divide, X, Brain, Baby, Sparkles, Star } from 'lucide-react';
import { clearWeights } from '../services/storageService';

interface HomeProps {
  settings: GameSettings;
  setSettings: (settings: GameSettings) => void;
  changeView: (view: AppView) => void;
}

const Home: React.FC<HomeProps> = ({ settings, setSettings, changeView }) => {
  const [localSettings, setLocalSettings] = useState<GameSettings>(settings);
  const [cleared, setCleared] = useState(false);

  // Apply changes to parent state when local state changes (debounced or on action)
  useEffect(() => {
     // Intentionally not syncing automatically to allow "Cancel" behavior if needed, 
     // but for this UX we usually want explicit start.
     // However, for the Theme toggle to work instantly on the background, we might want to lift it.
     // For now, we pass it on Start.
  }, [localSettings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setLocalSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (parseInt(value) || 0)
    }));
  };

  const handleModeChange = (mode: GameMode) => {
    setLocalSettings(prev => ({ ...prev, mode }));
  };

  const toggleKidMode = () => {
      setLocalSettings(prev => {
          const newKidMode = !prev.kidMode;
          // Apply Class 2 defaults if turning ON kid mode
          if (newKidMode) {
              return {
                  ...prev,
                  kidMode: true,
                  mode: 'ADDITION',
                  min: 1, max: 20,
                  min2: 1, max2: 10,
                  duration: 120,
                  smartMode: true
              };
          }
          return { ...prev, kidMode: false };
      });
  };

  const applyClass2Preset = () => {
      if (localSettings.mode === 'ADDITION') {
          setLocalSettings(prev => ({ ...prev, min: 1, max: 20, min2: 1, max2: 20 }));
      } else if (localSettings.mode === 'SUBTRACTION') {
          setLocalSettings(prev => ({ ...prev, min: 5, max: 20, min2: 1, max2: 10 }));
      } else if (localSettings.mode === 'MULTIPLICATION') {
          setLocalSettings(prev => ({ ...prev, min: 1, max: 5, min2: 1, max2: 10 }));
      } else if (localSettings.mode === 'DIVISION') {
          setLocalSettings(prev => ({ ...prev, min: 1, max: 5, min2: 2, max2: 5 })); // Quotient 1-5, Divisor 2-5
      }
  };

  const handleStart = () => {
    let { min, max, min2, max2, duration, smartMode, mode, kidMode } = localSettings;
    
    // Validation
    if (min > max) [min, max] = [max, min];
    if (min2 > max2) [min2, max2] = [max2, min2];
    if (duration < 10) duration = 10;
    
    const finalSettings = { min, max, min2, max2, duration, smartMode, mode, kidMode };
    setSettings(finalSettings);
    changeView(AppView.GAME);
  };

  const handleClearProgress = () => {
      clearWeights();
      setCleared(true);
      setTimeout(() => setCleared(false), 2000);
  };

  const modes: { id: GameMode; label: string; icon: React.ReactNode }[] = [
      { id: 'SQUARES', label: 'Squares', icon: <span className="font-mono font-bold text-lg">x²</span> },
      { id: 'ADDITION', label: 'Addition', icon: <Plus className="w-5 h-5" /> },
      { id: 'SUBTRACTION', label: 'Subtraction', icon: <Minus className="w-5 h-5" /> },
      { id: 'MULTIPLICATION', label: 'Multiply', icon: <X className="w-4 h-4" /> },
      { id: 'DIVISION', label: 'Division', icon: <Divide className="w-4 h-4" /> },
  ];

  const getRangeLabel1 = () => {
      switch (localSettings.mode) {
          case 'SQUARES': return 'Base Number';
          case 'DIVISION': return 'Answer (Quotient)';
          default: return 'First Number';
      }
  };

  const getRangeLabel2 = () => {
      switch (localSettings.mode) {
          case 'DIVISION': return 'Divisor';
          default: return 'Second Number';
      }
  };

  const showSecondRange = localSettings.mode !== 'SQUARES';
  const isKid = localSettings.kidMode;

  // Styles based on mode
  const containerClass = isKid 
    ? "min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-sky-300 to-sky-100 text-slate-800"
    : "min-h-screen flex flex-col items-center justify-center p-4 selection:bg-indigo-500/30";
    
  const cardClass = isKid
    ? "bg-white/90 backdrop-blur-xl border-4 border-white rounded-[40px] shadow-[0_20px_60px_-15px_rgba(14,165,233,0.3)] p-1 overflow-hidden"
    : "glass rounded-3xl p-1 shadow-2xl overflow-hidden ring-1 ring-white/10";

  const innerCardClass = isKid
    ? "bg-sky-50/50 p-6 md:p-8 rounded-[32px]"
    : "bg-slate-900/40 p-6 md:p-8 rounded-[22px]";

  const inputClass = isKid
    ? "w-full bg-white border-2 border-sky-200 hover:border-sky-400 focus:border-sky-500 rounded-2xl px-4 py-3 text-center text-2xl font-black text-sky-600 placeholder-sky-200 shadow-sm transition-all outline-none"
    : "w-full input-sleek rounded-xl px-4 py-3 text-center text-xl font-bold font-mono text-white placeholder-slate-600";

  const labelClass = isKid
    ? "text-xs font-black text-sky-400 uppercase tracking-widest pl-1 mb-1"
    : "text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1";

  const buttonPrimaryClass = isKid
    ? "w-full group relative overflow-hidden bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-white font-black py-5 px-8 rounded-2xl transition-all duration-300 shadow-[0_10px_30px_rgba(250,204,21,0.4)] hover:shadow-[0_15px_40px_rgba(250,204,21,0.6)] hover:-translate-y-1 active:translate-y-0"
    : "w-full relative group overflow-hidden bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] active:scale-[0.98]";

  return (
    <div className={containerClass}>
      
      {/* Decorative Elements */}
      {!isKid && (
        <>
            <div className="fixed top-20 left-10 w-32 h-32 bg-indigo-600/20 rounded-full blur-[80px] animate-float pointer-events-none" />
            <div className="fixed bottom-20 right-10 w-40 h-40 bg-purple-600/20 rounded-full blur-[80px] animate-float pointer-events-none" style={{ animationDelay: '1s' }} />
        </>
      )}
      {isKid && (
          <>
            <div className="fixed top-10 left-10 text-6xl opacity-50 animate-bounce delay-700">☁️</div>
            <div className="fixed top-20 right-20 text-6xl opacity-50 animate-bounce delay-1000">☀️</div>
            <div className="fixed bottom-10 left-20 text-5xl opacity-40 animate-pulse">🎈</div>
            <div className="fixed bottom-40 right-10 text-5xl opacity-40 animate-pulse delay-500">🌟</div>
          </>
      )}

      <div className="relative w-full max-w-lg z-10">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className={`text-5xl md:text-6xl tracking-tight mb-2 drop-shadow-lg ${isKid ? 'font-black text-sky-600 drop-shadow-none' : 'font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400'}`}>
            Square<span className={isKid ? 'text-yellow-500' : 'text-indigo-400'}>Master</span>
          </h1>
          <p className={isKid ? 'text-sky-600/60 font-bold tracking-wide text-sm uppercase' : 'text-indigo-200/60 font-medium tracking-wide text-sm uppercase'}>
              {isKid ? "Learn Math the Fun Way!" : "Next Gen Mental Math"}
          </p>
        </div>

        {/* Kid Mode Toggle */}
        <div className="flex justify-center mb-8">
            <button 
                onClick={toggleKidMode}
                className={`flex items-center gap-3 px-6 py-3 rounded-full transition-all duration-500 ${isKid ? 'bg-white shadow-xl scale-110 ring-4 ring-yellow-400' : 'bg-slate-800 border border-white/10 hover:bg-slate-700'}`}
            >
                {isKid ? <Baby className="w-6 h-6 text-pink-500" /> : <Settings2 className="w-5 h-5 text-slate-400" />}
                <span className={`font-bold ${isKid ? 'text-slate-800' : 'text-slate-200'}`}>
                    {isKid ? "Kid Mode Active!" : "Enable Kid Mode"}
                </span>
                {isKid && <div className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">ON</div>}
            </button>
        </div>

        {/* Main Card */}
        <div className={cardClass}>
            <div className={innerCardClass}>
                
                {/* Mode Selector */}
                <div className={`flex justify-between gap-2 mb-8 p-1.5 rounded-2xl ${isKid ? 'bg-white/60' : 'bg-slate-950/40 border border-white/5'}`}>
                    {modes.map((m) => {
                        const isActive = localSettings.mode === m.id;
                        return (
                            <button
                                key={m.id}
                                onClick={() => handleModeChange(m.id)}
                                className={`flex-1 flex flex-col items-center justify-center py-3 rounded-xl transition-all duration-300 relative group ${
                                    isActive 
                                    ? (isKid ? 'bg-sky-500 text-white shadow-lg shadow-sky-300 scale-105' : 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]') 
                                    : (isKid ? 'text-sky-300 hover:bg-sky-100 hover:text-sky-600' : 'text-slate-500 hover:text-indigo-300 hover:bg-white/5')
                                }`}
                                title={m.label}
                            >
                                <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                                    {m.icon}
                                </div>
                                {isActive && !isKid && <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-white/50" />}
                            </button>
                        );
                    })}
                </div>

                {isKid && (
                    <div className="mb-6 flex justify-center">
                        <button 
                            onClick={applyClass2Preset}
                            className="flex items-center gap-2 text-xs font-bold text-sky-500 bg-sky-100 hover:bg-sky-200 px-4 py-2 rounded-full transition-colors"
                        >
                            <Sparkles className="w-3 h-3" />
                            Use Class 2 Preset
                        </button>
                    </div>
                )}

                <div className="space-y-6">
                    {/* Range 1 */}
                    <div className="space-y-2">
                        <label className={labelClass}>
                            {getRangeLabel1()}
                        </label>
                        <div className="flex items-center gap-3">
                            <div className="relative flex-1 group">
                                <input
                                    type="number"
                                    name="min"
                                    value={localSettings.min}
                                    onChange={handleChange}
                                    className={inputClass}
                                />
                                <span className={`absolute top-1/2 -translate-y-1/2 left-3 text-[10px] font-bold ${isKid ? 'text-sky-300' : 'text-slate-600 group-focus-within:text-indigo-400'}`}>MIN</span>
                            </div>
                            <div className={isKid ? "text-sky-300" : "text-slate-600"}>
                                <ChevronRight className="w-4 h-4" />
                            </div>
                            <div className="relative flex-1 group">
                                <input
                                    type="number"
                                    name="max"
                                    value={localSettings.max}
                                    onChange={handleChange}
                                    className={inputClass}
                                />
                                <span className={`absolute top-1/2 -translate-y-1/2 left-3 text-[10px] font-bold ${isKid ? 'text-sky-300' : 'text-slate-600 group-focus-within:text-indigo-400'}`}>MAX</span>
                            </div>
                        </div>
                    </div>

                    {/* Range 2 */}
                    {showSecondRange && (
                        <div className="space-y-2 animate-in slide-in-from-left-4 fade-in duration-300">
                            <label className={labelClass}>
                                {getRangeLabel2()}
                            </label>
                            <div className="flex items-center gap-3">
                                <div className="relative flex-1 group">
                                    <input
                                        type="number"
                                        name="min2"
                                        value={localSettings.min2}
                                        onChange={handleChange}
                                        className={inputClass}
                                    />
                                    <span className={`absolute top-1/2 -translate-y-1/2 left-3 text-[10px] font-bold ${isKid ? 'text-sky-300' : 'text-slate-600 group-focus-within:text-indigo-400'}`}>MIN</span>
                                </div>
                                <div className={isKid ? "text-sky-300" : "text-slate-600"}>
                                    <ChevronRight className="w-4 h-4" />
                                </div>
                                <div className="relative flex-1 group">
                                    <input
                                        type="number"
                                        name="max2"
                                        value={localSettings.max2}
                                        onChange={handleChange}
                                        className={inputClass}
                                    />
                                    <span className={`absolute top-1/2 -translate-y-1/2 left-3 text-[10px] font-bold ${isKid ? 'text-sky-300' : 'text-slate-600 group-focus-within:text-indigo-400'}`}>MAX</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer Controls */}
                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="space-y-2">
                            <label className={labelClass}>Time (Seconds)</label>
                            <div className="relative group">
                                <input
                                    type="number"
                                    name="duration"
                                    value={localSettings.duration}
                                    onChange={handleChange}
                                    className={inputClass.replace('text-2xl', 'text-xl')} // Slightly smaller
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <label className={labelClass}>AI Difficulty</label>
                            <label className={`relative flex items-center justify-between p-3 rounded-xl cursor-pointer group h-[58px] ${isKid ? 'bg-white border-2 border-sky-200' : 'input-sleek'}`}>
                                <input 
                                    type="checkbox" 
                                    name="smartMode"
                                    checked={localSettings.smartMode} 
                                    onChange={handleChange}
                                    className="peer sr-only" 
                                />
                                <div className="flex items-center gap-2">
                                    <Brain className={`w-4 h-4 ${isKid ? 'text-sky-500' : (localSettings.smartMode ? 'text-indigo-400' : 'text-slate-500')}`} />
                                    <span className={`text-sm font-bold ${isKid ? 'text-sky-700' : (localSettings.smartMode ? 'text-white' : 'text-slate-400')}`}>Smart AI</span>
                                </div>
                                <div className={`w-3 h-3 rounded-full transition-all duration-300 ${localSettings.smartMode ? (isKid ? 'bg-green-400 shadow-[0_0_10px_#4ade80]' : 'bg-indigo-500 shadow-[0_0_10px_#6366f1]') : 'bg-slate-300'}`}></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-8 space-y-4">
                    <button
                        onClick={handleStart}
                        className={buttonPrimaryClass}
                    >
                        {!isKid && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />}
                        <span className="relative flex items-center justify-center gap-2 text-lg tracking-wide">
                            {isKid ? "Let's Play!" : "Start Session"} <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                    </button>

                    <div className="flex gap-3">
                         <button
                            onClick={() => changeView(AppView.STUDY)}
                            className={isKid 
                                ? "flex-1 bg-white hover:bg-sky-50 text-sky-400 hover:text-sky-600 font-bold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 border-2 border-sky-100"
                                : "flex-1 input-sleek hover:bg-white/5 text-slate-400 hover:text-white font-medium py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
                            }
                        >
                            <BookOpen className="w-4 h-4" />
                            {isKid ? "Study Helper" : "Reference"}
                        </button>
                        <button
                            onClick={handleClearProgress}
                            className={isKid 
                                ? "flex-1 bg-white hover:bg-red-50 text-red-300 hover:text-red-400 font-bold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 border-2 border-red-100"
                                : "flex-1 input-sleek hover:bg-red-500/10 text-slate-400 hover:text-red-400 font-medium py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
                            }
                        >
                            {cleared ? <span className="text-emerald-500">Reset!</span> : <><Trash2 className="w-4 h-4" /> {isKid ? "Reset" : "Reset AI"}</>}
                        </button>
                    </div>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
