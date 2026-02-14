import React, { useState, useEffect } from 'react';
import { AppView, GameSettings, GameStats, SessionRecord } from './types';
import Home from './components/Home';
import Game from './components/Game';
import Results from './components/Results';
import Study from './components/Study';
import Stats from './components/Stats';
import { incrementGamesPlayed, loadSettings, saveSettings, saveSession } from './services/storageService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  
  const [settings, setSettings] = useState<GameSettings>(() => {
    const saved = loadSettings();
    return saved || {
      mode: 'ADDITION', // Default to Addition for easier entry
      min: 1,
      max: 20,
      min2: 1,   
      max2: 10,  
      duration: 60,
      smartMode: true,
      kidMode: false
    };
  });

  const [lastStats, setLastStats] = useState<GameStats | null>(null);
  const [historicalSettings, setHistoricalSettings] = useState<GameSettings | null>(null);

  // Persist settings whenever they change
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const handleGameFinish = (stats: GameStats) => {
    incrementGamesPlayed(settings.kidMode);
    
    // Save Session History
    const session: SessionRecord = {
        id: Date.now().toString() + Math.random().toString().slice(2),
        timestamp: Date.now(),
        mode: settings.mode,
        score: stats.score,
        total: stats.totalQuestions,
        correct: stats.correct,
        isKid: settings.kidMode,
        history: stats.history
    };
    saveSession(session);

    setLastStats(stats);
    setCurrentView(AppView.RESULTS);
  };

  const handleSessionSelect = (session: SessionRecord) => {
      // Reconstruct GameStats from the saved session
      setLastStats({
          totalQuestions: session.total,
          correct: session.correct,
          score: session.score,
          history: session.history || [],
          startTime: session.timestamp, // approximate
          endTime: session.timestamp,
          problematicKeys: []
      });

      // Create a temporary settings object to ensure the Results view matches the session style (Kid vs Pro)
      // We retain the current user settings for everything else, but force the mode/theme
      setHistoricalSettings({
          ...settings,
          mode: session.mode,
          kidMode: session.isKid
      });

      setCurrentView(AppView.RESULTS);
  };

  const renderView = () => {
    switch (currentView) {
      case AppView.HOME:
        return (
          <Home 
            settings={settings} 
            setSettings={setSettings} 
            changeView={setCurrentView} 
          />
        );
      case AppView.GAME:
        return (
          <Game 
            settings={settings} 
            onFinish={handleGameFinish} 
            onExit={() => setCurrentView(AppView.HOME)}
          />
        );
      case AppView.RESULTS:
        const displaySettings = historicalSettings || settings;
        return lastStats ? (
          <Results 
            stats={lastStats} 
            settings={displaySettings}
            onRestart={() => { 
                setHistoricalSettings(null);
                setCurrentView(AppView.GAME); 
            }} 
            onHome={() => { 
                setHistoricalSettings(null);
                setCurrentView(AppView.HOME); 
            }} 
          />
        ) : (
          <Home settings={settings} setSettings={setSettings} changeView={setCurrentView} />
        );
      case AppView.STUDY:
        return (
          <Study 
            settings={settings}
            onBack={() => setCurrentView(AppView.HOME)}
          />
        );
      case AppView.STATS:
        return (
            <Stats 
                settings={settings}
                onBack={() => setCurrentView(AppView.HOME)}
                onSessionSelect={handleSessionSelect}
            />
        );
      default:
        return <Home settings={settings} setSettings={setSettings} changeView={setCurrentView} />;
    }
  };

  return (
    <div className={`antialiased min-h-screen transition-colors duration-500 ${settings.kidMode ? 'bg-sky-100' : ''}`}>
      {renderView()}
    </div>
  );
};

export default App;