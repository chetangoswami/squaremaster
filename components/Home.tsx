import React, { useState, useEffect } from 'react';
import { AppView, GameSettings, GameMode } from '../types';
import { clearWeights, saveModeConfig, loadModeConfig } from '../services/storageService';

interface HomeProps {
  settings: GameSettings;
  setSettings: (settings: GameSettings) => void;
  changeView: (view: AppView) => void;
}

const Home: React.FC<HomeProps> = ({ settings, setSettings, changeView }) => {
  const [cleared, setCleared] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.log("Error enabling fullscreen:", err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Direct update to parent state for instant persistence
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : (parseInt(value) || 0)
    });
  };

  const handleModeChange = (newMode: GameMode) => {
    // 1. Save current config for the OLD mode
    const { min, max, min2, max2, duration, smartMode, optionsMode } = settings;
    saveModeConfig(settings.mode, settings.kidMode, { min, max, min2, max2, duration, smartMode, optionsMode });

    // 2. Load config for the NEW mode
    const saved = loadModeConfig(newMode, settings.kidMode);
    
    // 3. Update state with defaults if no saved config
    let newSettings: Partial<GameSettings> = saved || {};
    
    // Default fallbacks if switching to a mode for the first time
    if (!saved) {
        if (newMode === 'SQUARES') {
            newSettings = { min: 1, max: 20 };
        } else if (newMode === 'MULTIPLICATION') {
            newSettings = { min: 1, max: 10, min2: 1, max2: 10 };
        } else {
            newSettings = { min: 1, max: 20, min2: 1, max2: 10 };
        }
    }

    setSettings({ 
        ...settings, 
        mode: newMode,
        ...newSettings
    });
  };

  const toggleKidMode = () => {
      const newKidMode = !settings.kidMode;
      const targetMode = newKidMode ? 'MULTIPLICATION' : 'ADDITION';
      
      // Save current state before switching context
      const { min, max, min2, max2, duration, smartMode, optionsMode } = settings;
      saveModeConfig(settings.mode, settings.kidMode, { min, max, min2, max2, duration, smartMode, optionsMode });

      // Try to load state for the target context
      const saved = loadModeConfig(targetMode, newKidMode);

      if (newKidMode) {
          // Defaults for Kid Mode if no save
          const defaults = saved || {
              min: 1, max: 10,
              min2: 1, max2: 10,
              duration: 120,
              smartMode: true,
              optionsMode: false
          };
          setSettings({ ...settings, kidMode: true, mode: targetMode, ...defaults });
      } else {
          // Defaults for Normal Mode
          const defaults = saved || {
              min: 1, max: 20,
              min2: 1, max2: 10,
              duration: 60,
              smartMode: true,
              optionsMode: false
          };
          setSettings({ ...settings, kidMode: false, mode: targetMode, ...defaults });
      }
  };

  const handleStart = () => {
    let { min, max, min2, max2 } = settings;
    let changed = false;
    
    if (min > max) { [min, max] = [max, min]; changed = true; }
    if (min2 > max2) { [min2, max2] = [max2, min2]; changed = true; }
    
    if (changed) {
        setSettings({ ...settings, min, max, min2, max2 });
    }
    changeView(AppView.GAME);
  };

  const handleClearProgress = () => {
      clearWeights();
      setCleared(true);
      setTimeout(() => setCleared(false), 2000);
  };

  const modes: { id: GameMode; label: string; icon: string }[] = [
      { id: 'SQUARES', label: 'Squares', icon: 'square_foot' },
      { id: 'ADDITION', label: 'Add', icon: 'add' },
      { id: 'SUBTRACTION', label: 'Subtract', icon: 'remove' },
      { id: 'MULTIPLICATION', label: 'Multiply', icon: 'close' },
      { id: 'DIVISION', label: 'Divide', icon: 'percent' },
  ];

  const isKid = settings.kidMode;
  // Options toggle is now available for all modes when in Kid Mode
  const showOptionsToggle = isKid;

  // Material 3 Styles
  const pageBg = isKid ? "bg-[#fef7ff]" : "bg-[#121212]";
  const surfaceCard = isKid ? "bg-[#f3edf7] text-[#1d1b20]" : "bg-[#1e1e1e] text-[#e3e3e3]";
  const primaryText = isKid ? "text-[#6750a4]" : "text-[#d0bcff]";
  const primaryFill = isKid ? "bg-[#6750a4] text-white hover:bg-[#6750a4]/90" : "bg-[#d0bcff] text-[#381e72] hover:bg-[#d0bcff]/90";
  const secondaryFill = isKid ? "bg-[#e8def8] text-[#1d1b20]" : "bg-[#333537] text-[#c4c7c5]";
  const inputFill = isKid ? "bg-[#ffffff] border-b border-[#6750a4]" : "bg-[#2d2f31] border-b border-[#938f99] text-white";

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-500 relative ${pageBg}`}>
      
      {/* Full Screen Toggle */}
      <button 
        onClick={toggleFullScreen}
        className={`absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center transition-colors z-10 ${isKid ? 'bg-white text-[#1d1b20] hover:bg-gray-50 shadow-sm' : 'bg-[#2d2f31] text-[#e3e3e3] hover:bg-[#3d3f41]'}`}
        title="Toggle Full Screen"
      >
        <span className="material-symbol">{isFullscreen ? 'close_fullscreen' : 'fullscreen'}</span>
      </button>

      <div className="w-full max-w-md space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-2 bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
             <span className="material-symbol text-white text-4xl">calculate</span>
          </div>
          <h1 className={`text-3xl font-bold tracking-tight ${isKid ? 'text-[#1d1b20]' : 'text-white'}`}>
            SquareMaster
          </h1>
          <p className={isKid ? "text-[#49454f]" : "text-[#c4c7c5]"}>
            {isKid ? "Math is fun! Let's play!" : "AI-Powered Mental Arithmetic"}
          </p>
        </div>

        {/* Main Card */}
        <div className={`rounded-[32px] p-6 shadow-sm ${surfaceCard}`}>
            
            {/* Mode Switch (Segmented Button) */}
            <div className={`flex overflow-x-auto gap-2 pb-4 mb-2 no-scrollbar`}>
                {modes.map((m) => {
                    const active = settings.mode === m.id;
                    const activeClass = isKid ? "bg-[#e8def8] text-[#1d1b20]" : "bg-[#4f378b] text-[#eaddff]";
                    const inactiveClass = isKid ? "hover:bg-white/50 text-[#49454f]" : "hover:bg-white/5 text-[#c4c7c5]";
                    
                    return (
                        <button
                            key={m.id}
                            onClick={() => handleModeChange(m.id)}
                            className={`flex flex-col items-center justify-center min-w-[72px] h-[72px] rounded-2xl transition-colors ${active ? activeClass : inactiveClass}`}
                        >
                            <span className="material-symbol text-2xl mb-1">{m.icon}</span>
                            <span className="text-[10px] font-medium tracking-wide">{m.label}</span>
                        </button>
                    );
                })}
            </div>

            <div className="space-y-6">
                {/* Inputs Row */}
                <div className="grid grid-cols-2 gap-4">
                    <div className={`rounded-t-lg px-4 py-2 ${inputFill}`}>
                        <label className={`block text-xs ${isKid ? 'text-[#6750a4]' : 'text-[#d0bcff]'}`}>Min Value</label>
                        <input
                            type="number"
                            name="min"
                            value={settings.min}
                            onChange={handleChange}
                            className="w-full bg-transparent text-xl font-medium outline-none p-0 border-none focus:ring-0"
                        />
                    </div>
                    <div className={`rounded-t-lg px-4 py-2 ${inputFill}`}>
                        <label className={`block text-xs ${isKid ? 'text-[#6750a4]' : 'text-[#d0bcff]'}`}>Max Value</label>
                        <input
                            type="number"
                            name="max"
                            value={settings.max}
                            onChange={handleChange}
                            className="w-full bg-transparent text-xl font-medium outline-none p-0 border-none focus:ring-0"
                        />
                    </div>
                </div>

                {settings.mode !== 'SQUARES' && (
                    <div className="grid grid-cols-2 gap-4 animate-fade-in">
                        <div className={`rounded-t-lg px-4 py-2 ${inputFill}`}>
                            <label className={`block text-xs ${isKid ? 'text-[#6750a4]' : 'text-[#d0bcff]'}`}>Operand 2 Min</label>
                            <input
                                type="number"
                                name="min2"
                                value={settings.min2}
                                onChange={handleChange}
                                className="w-full bg-transparent text-xl font-medium outline-none p-0 border-none focus:ring-0"
                            />
                        </div>
                        <div className={`rounded-t-lg px-4 py-2 ${inputFill}`}>
                            <label className={`block text-xs ${isKid ? 'text-[#6750a4]' : 'text-[#d0bcff]'}`}>Operand 2 Max</label>
                            <input
                                type="number"
                                name="max2"
                                value={settings.max2}
                                onChange={handleChange}
                                className="w-full bg-transparent text-xl font-medium outline-none p-0 border-none focus:ring-0"
                            />
                        </div>
                    </div>
                )}

                {/* Duration Slider style */}
                <div className="pt-2">
                    <div className="flex justify-between mb-2">
                        <label className={`text-sm font-medium ${isKid ? 'text-[#49454f]' : 'text-[#c4c7c5]'}`}>Duration</label>
                        <span className={`text-sm font-bold ${primaryText}`}>{settings.duration}s</span>
                    </div>
                    <input 
                        type="range" 
                        min="10" 
                        max="300" 
                        step="10"
                        name="duration"
                        value={settings.duration}
                        onChange={handleChange}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                </div>

                {/* Smart Mode Toggle */}
                <div className="flex justify-between items-center py-2">
                    <div className="flex items-center gap-3">
                         <div className={`p-2 rounded-full ${isKid ? 'bg-[#e8def8] text-[#1d1b20]' : 'bg-[#4f378b] text-[#eaddff]'}`}>
                            <span className="material-symbol">smart_toy</span>
                         </div>
                         <div className="flex flex-col">
                             <span className={`text-sm font-medium ${isKid ? 'text-[#1d1b20]' : 'text-[#e3e3e3]'}`}>Smart AI</span>
                             <span className="text-xs text-gray-500">Adaptive difficulty</span>
                         </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" name="smartMode" checked={settings.smartMode} onChange={handleChange} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                </div>

                {/* Kid Mode Toggle */}
                <div className="flex justify-between items-center py-2">
                    <div className="flex items-center gap-3">
                         <div className={`p-2 rounded-full ${isKid ? 'bg-[#e8def8] text-[#1d1b20]' : 'bg-[#4f378b] text-[#eaddff]'}`}>
                            <span className="material-symbol">face</span>
                         </div>
                         <div className="flex flex-col">
                             <span className={`text-sm font-medium ${isKid ? 'text-[#1d1b20]' : 'text-[#e3e3e3]'}`}>Kid Mode</span>
                             <span className="text-xs text-gray-500">Fun theme & simpler UI</span>
                         </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={settings.kidMode} onChange={toggleKidMode} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                </div>

                {/* Multiple Choice Toggle (Conditional) */}
                {showOptionsToggle && (
                   <div className="flex justify-between items-center py-2 animate-fade-in">
                       <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${isKid ? 'bg-[#e8def8] text-[#1d1b20]' : 'bg-[#4f378b] text-[#eaddff]'}`}>
                               <span className="material-symbol">list_alt</span>
                            </div>
                            <div className="flex flex-col">
                                <span className={`text-sm font-medium ${isKid ? 'text-[#1d1b20]' : 'text-[#e3e3e3]'}`}>Multiple Choice</span>
                                <span className="text-xs text-gray-500">Pick from options</span>
                            </div>
                       </div>
                       <label className="relative inline-flex items-center cursor-pointer">
                           <input type="checkbox" name="optionsMode" checked={!!settings.optionsMode} onChange={handleChange} className="sr-only peer" />
                           <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                       </label>
                   </div>
                )}
            </div>
            
            {/* FAB / CTA */}
            <button
                onClick={handleStart}
                className={`mt-8 w-full h-14 rounded-full font-medium text-lg shadow-md transition-transform active:scale-[0.98] flex items-center justify-center gap-2 ${primaryFill}`}
            >
                <span className="material-symbol">play_arrow</span>
                Start Session
            </button>
        </div>

        {/* Secondary Actions */}
        <div className="flex gap-4">
             <button
                onClick={() => changeView(AppView.STUDY)}
                className={`flex-1 h-12 rounded-full text-sm font-medium flex items-center justify-center gap-2 transition-colors ${secondaryFill}`}
            >
                <span className="material-symbol text-lg">school</span>
                Study
            </button>
            <button
                onClick={() => changeView(AppView.STATS)}
                className={`flex-1 h-12 rounded-full text-sm font-medium flex items-center justify-center gap-2 transition-colors ${secondaryFill}`}
            >
                <span className="material-symbol text-lg">monitoring</span>
                Stats
            </button>
        </div>
        
        <button
            onClick={handleClearProgress}
            className={`w-full mt-2 h-10 rounded-full text-xs font-medium flex items-center justify-center gap-2 transition-colors opacity-50 hover:opacity-100 ${isKid ? 'text-red-900' : 'text-[#f2b8b5]'}`}
        >
            <span className="material-symbol text-sm">{cleared ? 'check' : 'delete'}</span>
            {cleared ? 'Reset!' : 'Clear Data'}
        </button>

      </div>
    </div>
  );
};

export default Home;