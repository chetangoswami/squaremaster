import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AppView, GameSettings, GameStats, Question, AnswerRecord } from '../types';
import { X, ArrowRight, Zap, Repeat, Flame, Star, Trophy, Move, Play } from 'lucide-react';
import { loadWeights, saveWeights, getInitialWeight } from '../services/storageService';
import DraggableNumpad from './DraggableNumpad';

interface GameProps {
  settings: GameSettings;
  onFinish: (stats: GameStats) => void;
  onExit: () => void;
}

const Game: React.FC<GameProps> = ({ settings, onFinish, onExit }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(settings.duration);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [history, setHistory] = useState<AnswerRecord[]>([]);
  const [startTime, setStartTime] = useState(Date.now());
  const [flash, setFlash] = useState<'none' | 'green' | 'red'>('none');
  
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  
  const questionStartTimeRef = useRef<number>(Date.now());
  const weightsRef = useRef<Record<number, number>>({});
  const retryQueueRef = useRef<Question[]>([]);
  const questionsSinceRetryRef = useRef(0);

  const isKid = settings.kidMode;

  // Initialize Weights
  useEffect(() => {
    if (settings.smartMode) {
        const persisted = loadWeights(settings.mode);
        const activeWeights: Record<number, number> = {};
        const initRange = (min: number, max: number) => {
            for (let i = min; i <= max; i++) {
                if (activeWeights[i] === undefined) activeWeights[i] = getInitialWeight(i, persisted[i]);
            }
        };
        initRange(settings.min, settings.max);
        if (settings.mode !== 'SQUARES') initRange(settings.min2, settings.max2);
        weightsRef.current = activeWeights;
    }
  }, [settings]);

  // Save weights on unmount
  useEffect(() => {
    return () => { if (settings.smartMode) saveWeights(settings.mode, weightsRef.current); };
  }, [settings]);

  const getWeightedRandom = (min: number, max: number) => {
    const candidates: { val: number; weight: number }[] = [];
    const weights = weightsRef.current;
    for (let i = min; i <= max; i++) {
        const w = weights[i] !== undefined ? weights[i] : getInitialWeight(i);
        candidates.push({ val: i, weight: w }); 
    }
    let totalWeight = 0;
    for (const item of candidates) totalWeight += item.weight;
    let random = Math.random() * totalWeight;
    for (const item of candidates) {
        random -= item.weight;
        if (random <= 0) return item.val;
    }
    return candidates[candidates.length - 1]?.val || min;
  };

  const generateQuestion = useCallback(() => {
    if (settings.smartMode && retryQueueRef.current.length > 0) {
        if (questionsSinceRetryRef.current >= 2 || retryQueueRef.current.length > 3) {
            const retryQ = retryQueueRef.current.shift();
            if (retryQ) {
                questionsSinceRetryRef.current = 0;
                return { ...retryQ, isRetry: true };
            }
        }
    }
    questionsSinceRetryRef.current++;

    let val1, val2, answer;
    const getRandom = (min: number, max: number) => {
        if (settings.smartMode) return getWeightedRandom(min, max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    switch (settings.mode) {
        case 'SQUARES':
            val1 = getRandom(settings.min, settings.max);
            return { mode: 'SQUARES', val1, answer: val1 * val1, isRetry: false } as Question;
        case 'ADDITION':
            val1 = getRandom(settings.min, settings.max);
            val2 = getRandom(settings.min2, settings.max2);
            return { mode: 'ADDITION', val1, val2, answer: val1 + val2, isRetry: false } as Question;
        case 'SUBTRACTION':
            val1 = getRandom(settings.min, settings.max);
            val2 = getRandom(settings.min2, settings.max2);
            // Ensure positive result for kid mode
            if (settings.kidMode && val2 > val1) {
                [val1, val2] = [val2, val1];
            }
            return { mode: 'SUBTRACTION', val1, val2, answer: val1 - val2, isRetry: false } as Question;
        case 'MULTIPLICATION':
            val1 = getRandom(settings.min, settings.max);
            val2 = getRandom(settings.min2, settings.max2);
            if (settings.smartMode && weightsRef.current[val1] > 1.2 && Math.random() > 0.7) val2 = getRandom(settings.min2, settings.max2);
            return { mode: 'MULTIPLICATION', val1, val2, answer: val1 * val2, isRetry: false } as Question;
        case 'DIVISION':
            val2 = getRandom(settings.min2, settings.max2);
            answer = getRandom(settings.min, settings.max);
            val1 = val2 * answer;
            return { mode: 'DIVISION', val1, val2, answer, isRetry: false } as Question;
        default: return { mode: 'SQUARES', val1: 2, answer: 4 } as Question;
    }
  }, [settings]);

  // Generate first question on mount, but don't start timer/tracking yet
  useEffect(() => {
    setCurrentQuestion(generateQuestion());
  }, []); 

  const handleStartGame = () => {
    setIsPlaying(true);
    setStartTime(Date.now());
    questionStartTimeRef.current = Date.now();
  };

  useEffect(() => {
    if (!isPlaying) return;
    if (timeLeft <= 0) { handleFinish(); return; }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isPlaying]);

  const handleFinish = () => {
    if (settings.smartMode) saveWeights(settings.mode, weightsRef.current);
    onFinish({ totalQuestions: history.length, correct: correctCount, score, history, startTime, endTime: Date.now(), problematicKeys: [] });
  };

  const updateWeights = (q: Question, isCorrect: boolean, timeTaken: number) => {
      if (!settings.smartMode) return;
      const calcNewWeight = (currentW: number) => {
          let newW = currentW;
          if (!isCorrect) newW += 2.0;
          else {
              if (timeTaken > 5000) newW += 1.0;
              else if (timeTaken > 3000) newW += 0.2;
              else if (timeTaken < 1500) newW = Math.max(0.5, newW - 0.2);
          }
          return Math.min(newW, 10);
      };
      if (q.mode === 'SQUARES') {
          weightsRef.current[q.val1] = calcNewWeight(weightsRef.current[q.val1] || 1);
      } else if (q.mode === 'DIVISION') {
          if (q.val2) weightsRef.current[q.val2] = calcNewWeight(weightsRef.current[q.val2] || 1);
          weightsRef.current[q.answer] = calcNewWeight(weightsRef.current[q.answer] || 1);
      } else if (q.val2) {
          weightsRef.current[q.val1] = calcNewWeight(weightsRef.current[q.val1] || 1);
          weightsRef.current[q.val2] = calcNewWeight(weightsRef.current[q.val2] || 1);
      }
  };

  const processAnswer = useCallback(() => {
    if (!currentQuestion || !isPlaying) return;
    const cleanInput = inputValue.replace('−', '-');
    const userVal = parseInt(cleanInput);
    
    // Prevent empty submission
    if (inputValue.trim() === '') return;

    const isCorrect = userVal === currentQuestion.answer;
    const timeTaken = Date.now() - questionStartTimeRef.current;
    
    setHistory(prev => [...prev, { question: currentQuestion, userAnswer: isNaN(userVal) ? 0 : userVal, isCorrect, timeTaken }]);
    updateWeights(currentQuestion, isCorrect, timeTaken);

    if (isCorrect) {
      setScore(prev => prev + 1); setCorrectCount(prev => prev + 1); setStreak(prev => prev + 1);
      setFlash('green');
    } else {
      setStreak(0);
      if (settings.smartMode) retryQueueRef.current.push({ ...currentQuestion, isRetry: true });
      setFlash('red');
    }
    setTimeout(() => setFlash('none'), 300);

    setInputValue('');
    let nextQ = generateQuestion();
    // Simple logic to avoid immediate repeat unless it's a retry
    let attempts = 0;
    while (attempts < 5 && !nextQ.isRetry) {
        if (nextQ.val1 === currentQuestion.val1 && nextQ.val2 === currentQuestion.val2) { /* retry */ } else { break; }
        nextQ = generateQuestion(); attempts++;
    }
    setCurrentQuestion(nextQ);
    questionStartTimeRef.current = Date.now();
  }, [currentQuestion, inputValue, generateQuestion, settings.smartMode, isPlaying]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processAnswer();
  };

  // Global Keyboard Listener for Desktop Support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        // Allow exiting with Escape always
        if (e.key === 'Escape') {
            onExit();
            return;
        }

        // Only allow typing if playing
        if (!isPlaying) return;

        // Numbers
        if (e.key >= '0' && e.key <= '9') {
            setInputValue(prev => {
                if (prev.length > 6) return prev; // Limit length
                return prev + e.key;
            });
        } 
        // Backspace
        else if (e.key === 'Backspace') {
            setInputValue(prev => prev.slice(0, -1));
        } 
        // Enter
        else if (e.key === 'Enter') {
            processAnswer();
        }
        // Minus sign
        else if (e.key === '-' || e.key === '−') {
             setInputValue(prev => prev.includes('-') ? prev : '-' + prev);
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [processAnswer, onExit, isPlaying]);

  // Numpad Handlers with guard
  const handleNumpadInput = (digit: string) => {
      if (!isPlaying) return;
      setInputValue(prev => {
          if (prev.length > 6) return prev;
          return prev + digit;
      });
  };

  const handleNumpadDelete = () => {
      if (!isPlaying) return;
      setInputValue(prev => prev.slice(0, -1));
  };

  const getOperator = () => {
      switch (currentQuestion?.mode) {
          case 'MULTIPLICATION': return '×';
          case 'ADDITION': return '+';
          case 'SUBTRACTION': return '−';
          case 'DIVISION': return '÷';
          default: return '';
      }
  };

  const bgTransition = flash === 'green' 
    ? (isKid ? 'bg-green-100' : 'bg-emerald-500/10') 
    : flash === 'red' 
        ? (isKid ? 'bg-red-100' : 'bg-red-500/10') 
        : (isKid ? 'bg-sky-50' : 'bg-transparent');

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen relative overflow-hidden transition-colors duration-300 ${bgTransition}`}>
      
      {/* Draggable Numpad Overlay - Always visible so it can be moved */}
      <DraggableNumpad 
          onInput={handleNumpadInput}
          onDelete={handleNumpadDelete}
          onEnter={processAnswer}
          isKid={isKid}
      />

      {/* Start Game Overlay */}
      {!isPlaying && (
          <div className={`absolute inset-0 z-40 flex flex-col items-center justify-center p-6 ${isKid ? 'bg-white/60' : 'bg-black/60'} backdrop-blur-[2px] animate-in fade-in duration-300`}>
              <div className={`max-w-md w-full text-center p-8 rounded-3xl shadow-2xl ${isKid ? 'bg-white border-4 border-sky-100' : 'glass border border-white/10'}`}>
                  <div className="flex justify-center mb-6">
                      <div className={`p-4 rounded-full ${isKid ? 'bg-sky-100 text-sky-500' : 'bg-indigo-500/20 text-indigo-400'}`}>
                          <Move className="w-8 h-8 animate-pulse" />
                      </div>
                  </div>
                  <h2 className={`text-3xl font-black mb-3 ${isKid ? 'text-sky-600' : 'text-white'}`}>
                      {isKid ? "Get Ready!" : "Setup Phase"}
                  </h2>
                  <p className={`mb-8 font-medium ${isKid ? 'text-sky-400' : 'text-slate-400'}`}>
                      {isKid ? "Drag the number pad to a comfy spot, then press Start!" : "Drag the floating keypad to your preferred position to ensure it doesn't obstruct the view."}
                  </p>
                  <button
                      onClick={handleStartGame}
                      className={`w-full py-4 rounded-2xl font-black text-xl tracking-widest flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] ${
                          isKid 
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-[0_10px_20px_rgba(250,204,21,0.4)]' 
                          : 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:bg-indigo-500'
                      }`}
                  >
                      <Play className="w-6 h-6 fill-current" />
                      {isKid ? "START GAME" : "START SESSION"}
                  </button>
              </div>
          </div>
      )}

      {/* Progress Bar */}
      <div className={`absolute top-0 left-0 w-full h-2 z-20 ${isKid ? 'bg-white' : 'bg-white/5'}`}>
        <div 
          className={`h-full transition-all duration-1000 ease-linear ${isKid ? 'bg-yellow-400' : 'bg-indigo-500 shadow-[0_0_15px_#6366f1]'}`}
          style={{ width: `${(timeLeft / settings.duration) * 100}%` }}
        />
      </div>

      <div className={`absolute top-6 right-6 font-mono text-2xl font-bold tracking-wider z-20 ${isKid ? 'text-sky-400' : 'text-white/30'}`}>
        {timeLeft}s
      </div>

      <div className="absolute top-6 left-6 flex gap-4 items-center z-50">
        <button 
            onClick={onExit} 
            className={`p-3 rounded-full transition-colors backdrop-blur-sm group ${isKid ? 'bg-white text-sky-400 shadow-md hover:bg-sky-50' : 'bg-white/5 hover:bg-white/10 text-white/50 hover:text-white'}`}
        >
          <X className="w-6 h-6 group-active:scale-90 transition-transform" />
        </button>
        {settings.smartMode && (
            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full backdrop-blur-md text-xs font-bold pointer-events-none ${isKid ? 'bg-white/50 border border-sky-200 text-sky-500' : 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-300'}`}>
                <Zap className="w-3 h-3 fill-current" />
                {isKid ? "Smart Helper ON" : "SMART AI ACTIVE"}
            </div>
        )}
      </div>

      {streak > 2 && (
          <div className="absolute top-24 right-6 animate-in slide-in-from-right-10 fade-in duration-500 z-10">
              <div className={`flex items-center gap-2 font-bold ${isKid ? 'text-orange-400 drop-shadow-none' : 'text-orange-400 drop-shadow-[0_0_10px_rgba(251,146,60,0.5)]'}`}>
                  {isKid ? <Star className="w-8 h-8 fill-yellow-400 text-yellow-500 animate-spin-slow" /> : <Flame className="w-6 h-6 fill-current animate-bounce" />}
                  <span className="text-3xl italic">{streak}</span>
              </div>
          </div>
      )}

      <div className="w-full max-w-4xl text-center px-4 z-10 pb-40">
        
        {/* Retry Indicator */}
        <div className="h-8 mb-6 flex items-center justify-center">
            {currentQuestion?.isRetry && (
                <div className={`flex items-center gap-2 text-xs font-bold px-4 py-1.5 rounded-full animate-in zoom-in duration-300 backdrop-blur-md ${isKid ? 'bg-orange-100 text-orange-500 border border-orange-200' : 'text-amber-300 bg-amber-500/10 border border-amber-500/20'}`}>
                    <Repeat className="w-3 h-3" />
                    {isKid ? "Let's try that one again!" : "REVIEWING MISTAKE"}
                </div>
            )}
        </div>

        {/* Question */}
        <div className="mb-10 scale-100 md:scale-110 transition-transform duration-300">
            <h2 className={`text-[5rem] md:text-[8rem] leading-none font-black tracking-tighter flex items-center justify-center gap-2 ${isKid ? 'text-sky-600 drop-shadow-sm' : 'text-white drop-shadow-2xl'}`}>
              {currentQuestion?.mode === 'SQUARES' ? (
                  <>
                    <span className={isKid ? "text-sky-600" : "bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400"}>
                        {currentQuestion.val1}
                    </span>
                    <span className={`${isKid ? 'text-yellow-400' : 'text-indigo-500'} text-[4rem] md:text-[5rem] align-top -mt-8 opacity-80 font-medium`}>2</span>
                  </>
              ) : (
                  <>
                    <span className={isKid ? "text-sky-600" : "bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400"}>{currentQuestion?.val1}</span>
                    <span className={`${isKid ? 'text-yellow-400' : 'text-indigo-500'} text-[4rem] md:text-[6rem] mx-2 opacity-80`}>{getOperator()}</span>
                    <span className={isKid ? "text-sky-600" : "bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400"}>{currentQuestion?.val2}</span>
                  </>
              )}
            </h2>
        </div>

        {/* Input - ReadOnly to prevent virtual keyboard */}
        <form onSubmit={handleFormSubmit} className="w-full flex justify-center relative">
          <input
            type="text"
            readOnly
            value={inputValue}
            className={`w-full max-w-md bg-transparent border-none text-center text-[5rem] font-bold focus:outline-none py-2 font-mono cursor-default ${isKid ? 'text-sky-800 placeholder-sky-200' : 'text-white placeholder-white/5 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]'}`}
            placeholder={isKid ? "?" : ""}
          />
          {!inputValue && !isKid && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/20 rounded-full animate-pulse" />
          )}
        </form>

        <div className="mt-8 flex justify-center opacity-80">
             <div className={`px-8 py-3 rounded-full flex items-center gap-4 ${isKid ? 'bg-white shadow-lg border border-sky-100' : 'glass'}`}>
                {isKid ? <Trophy className="w-6 h-6 text-yellow-500" /> : <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Session Score</span>}
                <span className={`text-3xl font-bold font-mono ${isKid ? 'text-sky-600' : 'text-indigo-400 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]'}`}>{score}</span>
             </div>
        </div>
      </div>
    </div>
  );
};

export default Game;