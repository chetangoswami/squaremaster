import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AppView, GameSettings, GameStats, Question, AnswerRecord } from '../types';
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
  
  const questionStartTimeRef = useRef<number>(Date.now());
  const weightsRef = useRef<Record<number, number>>({});
  const retryQueueRef = useRef<Question[]>([]);
  const questionsSinceRetryRef = useRef(0);
  const isKid = settings.kidMode;

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
            if (settings.kidMode && val2 > val1) [val1, val2] = [val2, val1];
            return { mode: 'SUBTRACTION', val1, val2, answer: val1 - val2, isRetry: false } as Question;
        case 'MULTIPLICATION':
            val1 = getRandom(settings.min, settings.max);
            val2 = getRandom(settings.min2, settings.max2);
            return { mode: 'MULTIPLICATION', val1, val2, answer: val1 * val2, isRetry: false } as Question;
        case 'DIVISION':
            val2 = getRandom(settings.min2, settings.max2);
            answer = getRandom(settings.min, settings.max);
            val1 = val2 * answer;
            return { mode: 'DIVISION', val1, val2, answer, isRetry: false } as Question;
        default: return { mode: 'SQUARES', val1: 2, answer: 4 } as Question;
    }
  }, [settings]);

  useEffect(() => { setCurrentQuestion(generateQuestion()); }, []); 

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

  const processAnswer = useCallback(() => {
    if (!currentQuestion || !isPlaying) return;
    const cleanInput = inputValue.replace('−', '-');
    const userVal = parseInt(cleanInput);
    if (inputValue.trim() === '') return;

    const isCorrect = userVal === currentQuestion.answer;
    const timeTaken = Date.now() - questionStartTimeRef.current;
    
    setHistory(prev => [...prev, { question: currentQuestion, userAnswer: isNaN(userVal) ? 0 : userVal, isCorrect, timeTaken }]);

    if (isCorrect) {
      setScore(prev => prev + 1); setCorrectCount(prev => prev + 1);
      setFlash('green');
    } else {
      if (settings.smartMode) retryQueueRef.current.push({ ...currentQuestion, isRetry: true });
      setFlash('red');
    }
    setTimeout(() => setFlash('none'), 300);

    setInputValue('');
    let nextQ = generateQuestion();
    // Avoid immediate repeat
    let attempts = 0;
    while (attempts < 5 && !nextQ.isRetry) {
        if (nextQ.val1 === currentQuestion.val1 && nextQ.val2 === currentQuestion.val2) { /* retry */ } else { break; }
        nextQ = generateQuestion(); attempts++;
    }
    setCurrentQuestion(nextQ);
    questionStartTimeRef.current = Date.now();
  }, [currentQuestion, inputValue, generateQuestion, settings.smartMode, isPlaying]);

  const handleFormSubmit = (e: React.FormEvent) => { e.preventDefault(); processAnswer(); };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') { onExit(); return; }
        if (!isPlaying) return;
        if (e.key >= '0' && e.key <= '9') setInputValue(p => p.length > 6 ? p : p + e.key);
        else if (e.key === 'Backspace') setInputValue(p => p.slice(0, -1));
        else if (e.key === 'Enter') processAnswer();
        else if (e.key === '-' || e.key === '−') setInputValue(p => p.includes('-') ? p : '-' + p);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [processAnswer, onExit, isPlaying]);

  const handleNumpadInput = (d: string) => { if(isPlaying) setInputValue(p => p.length > 6 ? p : p + d); };
  const handleNumpadDelete = () => { if(isPlaying) setInputValue(p => p.slice(0, -1)); };
  const getOperator = () => {
      switch (currentQuestion?.mode) {
          case 'MULTIPLICATION': return '×';
          case 'ADDITION': return '+';
          case 'SUBTRACTION': return '−';
          case 'DIVISION': return '÷';
          default: return '';
      }
  };

  const bgClass = isKid 
    ? (flash === 'green' ? 'bg-green-100' : flash === 'red' ? 'bg-red-100' : 'bg-[#fef7ff]') 
    : (flash === 'green' ? 'bg-[#0f1f12]' : flash === 'red' ? 'bg-[#2b1212]' : 'bg-[#121212]');
  
  const textClass = isKid ? 'text-[#1d1b20]' : 'text-[#e3e3e3]';

  return (
    <div className={`flex flex-col min-h-screen relative overflow-hidden transition-colors duration-300 ${bgClass} ${textClass}`}>
      
      <DraggableNumpad 
          onInput={handleNumpadInput}
          onDelete={handleNumpadDelete}
          onEnter={processAnswer}
          isKid={isKid}
      />

      {/* Start Overlay */}
      {!isPlaying && (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
              <div className={`p-8 rounded-[32px] max-w-sm w-full text-center shadow-2xl ${isKid ? 'bg-[#f3edf7]' : 'bg-[#1e1e1e] border border-white/10'}`}>
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${isKid ? 'bg-indigo-100 text-indigo-700' : 'bg-[#4f378b] text-[#eaddff]'}`}>
                      <span className="material-symbol text-3xl">drag_pan</span>
                  </div>
                  <h2 className={`text-2xl font-bold mb-2 ${isKid ? 'text-[#1d1b20]' : 'text-white'}`}>Position the Numpad</h2>
                  <p className={`mb-8 text-sm ${isKid ? 'text-[#49454f]' : 'text-[#c4c7c5]'}`}>
                      Drag the keypad to a comfortable spot before you begin.
                  </p>
                  <button
                      onClick={handleStartGame}
                      className={`w-full h-14 rounded-full font-medium text-lg flex items-center justify-center gap-2 transition-transform active:scale-95 ${isKid ? 'bg-[#6750a4] text-white' : 'bg-[#d0bcff] text-[#381e72]'}`}
                  >
                      <span className="material-symbol">play_arrow</span>
                      Start
                  </button>
              </div>
          </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center p-6 z-20">
          <button onClick={onExit} className={`w-12 h-12 rounded-full flex items-center justify-center ${isKid ? 'bg-white hover:bg-gray-100' : 'bg-[#2d2f31] hover:bg-[#3d3f41]'} transition-colors`}>
              <span className="material-symbol">close</span>
          </button>
          
          <div className={`px-5 py-2 rounded-full flex items-center gap-2 ${isKid ? 'bg-indigo-50 text-indigo-900' : 'bg-[#333537] text-white'}`}>
              <span className="material-symbol text-sm">trophy</span>
              <span className="font-bold">{score}</span>
          </div>

          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-mono font-bold border-2 ${timeLeft < 10 ? 'border-red-500 text-red-500' : (isKid ? 'border-indigo-200 text-indigo-900' : 'border-gray-600 text-white')}`}>
              {timeLeft}
          </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center pt-10 px-4">
        
        {/* Retry Label */}
        <div className="h-8 mb-4">
            {currentQuestion?.isRetry && (
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${isKid ? 'bg-orange-100 text-orange-800' : 'bg-[#410e0b] text-[#f2b8b5]'}`}>
                    <span className="material-symbol text-sm">refresh</span>
                    Review
                </span>
            )}
        </div>

        {/* Question Display */}
        <div className="text-center mb-12 animate-slide-up">
            <h2 className="text-[5rem] md:text-[7rem] font-bold leading-none tracking-tight flex items-center justify-center gap-4">
              {currentQuestion?.mode === 'SQUARES' ? (
                  <>
                    <span>{currentQuestion.val1}</span>
                    <span className={`text-[3rem] md:text-[4rem] self-start mt-2 ${isKid ? 'text-indigo-500' : 'text-[#d0bcff]'}`}>2</span>
                  </>
              ) : (
                  <>
                    <span>{currentQuestion?.val1}</span>
                    <span className={isKid ? 'text-indigo-500' : 'text-[#d0bcff]'}>{getOperator()}</span>
                    <span>{currentQuestion?.val2}</span>
                  </>
              )}
            </h2>
        </div>

        {/* Answer Input */}
        <form onSubmit={handleFormSubmit} className="w-full flex justify-center">
            <div className={`relative min-w-[200px] border-b-4 ${isKid ? 'border-indigo-200' : 'border-gray-700'}`}>
                <input
                    type="text"
                    readOnly
                    value={inputValue}
                    className="w-full bg-transparent text-center text-[4rem] font-medium focus:outline-none py-2 font-mono"
                    placeholder="?"
                />
            </div>
        </form>
        
        {/* Smart Mode Indicator */}
        {settings.smartMode && (
            <div className={`mt-12 flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-full ${isKid ? 'bg-white/50 text-gray-500' : 'bg-white/5 text-gray-400'}`}>
                <span className="material-symbol text-sm filled">bolt</span>
                AI Adaptive
            </div>
        )}
      </div>
    </div>
  );
};

export default Game;