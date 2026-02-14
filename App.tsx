import React, { useState } from 'react';
import { AppView, GameSettings, GameStats } from './types';
import Home from './components/Home';
import Game from './components/Game';
import Results from './components/Results';
import Study from './components/Study';
import Stats from './components/Stats';
import { incrementGamesPlayed } from './services/storageService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  
  const [settings, setSettings] = useState<GameSettings>({
    mode: 'ADDITION', // Default to Addition for easier entry
    min: 1,
    max: 20,
    min2: 1,   
    max2: 10,  
    duration: 60,
    smartMode: true,
    kidMode: false
  });

  const [lastStats, setLastStats] = useState<GameStats | null>(null);

  const handleGameFinish = (stats: GameStats) => {
    incrementGamesPlayed();
    setLastStats(stats);
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
        return lastStats ? (
          <Results 
            stats={lastStats} 
            settings={settings}
            onRestart={() => setCurrentView(AppView.GAME)} 
            onHome={() => setCurrentView(AppView.HOME)} 
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