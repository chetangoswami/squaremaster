import React from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { GameStats, SessionRecord } from './src/types';
import Dashboard from './src/features/dashboard/Dashboard';
import Game from './src/features/math-quiz/Game';
import Results from './src/features/math-quiz/Results';
import Study from './src/features/math-quiz/Study';
import Stats from './src/features/math-quiz/Stats';
import SecretAlphabet from './src/features/alpha-quiz/SecretAlphabet';
import { useAppStore } from './src/store/useAppStore';

const App: React.FC = () => {
  const navigate = useNavigate();
  
  const {
    settings,
    setSettings,
    lastStats,
    setLastStats,
    historicalSettings,
    setHistoricalSettings,
    addSession,
    incrementGamesPlayed
  } = useAppStore();

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
        history: stats.history,
        duration: settings.duration,
        optionsMode: !!settings.optionsMode
    };
    addSession(session);

    setLastStats(stats);
    navigate('/results');
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

      navigate('/results');
  };

  return (
    <div className={`antialiased min-h-screen transition-colors duration-500 ${settings.kidMode ? 'bg-sky-100' : ''}`}>
      <Routes>
        <Route path="/" element={
          <Dashboard 
            settings={settings} 
            setSettings={setSettings} 
            changeView={(view) => {
              if (view === 'GAME') navigate('/game');
              else if (view === 'STUDY') navigate('/study');
              else if (view === 'STATS') navigate('/stats');
              else if (view === 'SECRET_ALPHABET') navigate('/alphabet');
            }} 
          />
        } />
        <Route path="/game" element={
          <Game 
            settings={settings} 
            onFinish={handleGameFinish} 
            onExit={() => navigate('/')}
          />
        } />
        <Route path="/results" element={
          lastStats ? (
            <Results 
              stats={lastStats} 
              settings={historicalSettings || settings}
              onRestart={() => { 
                  setHistoricalSettings(null);
                  navigate('/game'); 
              }} 
              onHome={() => { 
                  setHistoricalSettings(null);
                  navigate('/'); 
              }} 
            />
          ) : (
            <Navigate to="/" replace />
          )
        } />
        <Route path="/study" element={
          <Study 
            settings={settings}
            onBack={() => navigate('/')}
          />
        } />
        <Route path="/stats" element={
          <Stats 
            settings={settings}
            onBack={() => navigate('/')}
            onSessionSelect={handleSessionSelect}
          />
        } />
        <Route path="/alphabet" element={
          <SecretAlphabet 
            onBack={() => navigate('/')}
          />
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default App;