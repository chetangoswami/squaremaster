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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [options, setOptions] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  
  const questionStartTimeRef = useRef<number>(Date.now());
  const weightsRef = useRef<Record<number, number>>({});
  const retryQueueRef = useRef<Question[]>([]);
  const questionsSinceRetryRef = useRef(0);
  const isKid = settings.kidMode;
  const isOptionsMode = settings.kidMode && settings.optionsMode;

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

  // Improved Smart Options Generation
  const generateOptions = (q: Question) => {
      const { answer, mode, val1, val2 } = q;
      const opts = new Set<number>();
      opts.add(answer);

      const add = (n: number) => {
          if (n > 0 && n !== answer && Number.isInteger(n)) opts.add(n);
      };

      if (mode === 'SQUARES') {
          // Common square mistakes
          add((val1 - 1) ** 2);
          add((val1 + 1) ** 2);
          // Transposition of digits (e.g. 13^2 = 169 vs 196)
          const s = answer.toString();
          if (s.length > 1) {
              const rev = parseInt(s.split('').reverse().join(''));
              if (rev !== answer) add(rev);
          }
          add(answer + 10);
          add(answer - 10);
      } else if (mode === 'MULTIPLICATION' && val2 !== undefined) {
          // Off by one operand group
          add(val1 * (val2 + 1));
          add(val1 * (val2 - 1));
          add((val1 + 1) * val2);
          add((val1 - 1) * val2);
      } else if (mode === 'ADDITION' || mode === 'SUBTRACTION') {
          // Off by small amounts
          add(answer + 1);
          add(answer - 1);
          add(answer + 2);
          add(answer - 2);
          add(answer + 10);
          add(answer - 10);
      } else if (mode === 'DIVISION') {
          add(answer + 1);
          add(answer - 1);
          add(answer + 2);
          add(answer * 2);
      }

      // Fallback: Random offset logic if we don't have enough options yet
      let safetyCounter = 0;
      while (opts.size < 4 && safetyCounter < 50) {
          safetyCounter++;
          const offset = Math.floor(Math.random() * 5) + 1; // 1-5 deviation
          const sign = Math.random() > 0.5 ? 1 : -1;
          const val = answer + (offset * sign);
          add(val);
      }
      
      // Last Resort: Just increment
      while (opts.size < 4) {
          add(answer + opts.size + 1);
      }
      
      return Array.from(opts).slice(0, 4).sort(() => Math.random() - 0.5);
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

    let q: Question;
    switch (settings.mode) {
        case 'SQUARES':
            val1 = getRandom(settings.min, settings.max);
            q = { mode: 'SQUARES', val1, answer: val1 * val1, isRetry: false } as Question;
            break;
        case 'ADDITION':
            val1 = getRandom(settings.min, settings.max);
            val2 = getRandom(settings.min2, settings.max2);
            q = { mode: 'ADDITION', val1, val2, answer: val1 + val2, isRetry: false } as Question;
            break;
        case 'SUBTRACTION':
            val1 = getRandom(settings.min, settings.max);
            val2 = getRandom(settings.min2, settings.max2);
            if (settings.kidMode && val2 > val1) [val1, val2] = [val2, val1];
            q = { mode: 'SUBTRACTION', val1, val2, answer: val1 - val2, isRetry: false } as Question;
            break;
        case 'MULTIPLICATION':
            val1 = getRandom(settings.min, settings.max);
            val2 = getRandom(settings.min2, settings.max2);
            q = { mode: 'MULTIPLICATION', val1, val2, answer: val1 * val2, isRetry: false } as Question;
            break;
        case 'DIVISION':
            val2 = getRandom(settings.min2, settings.max2);
            answer = getRandom(settings.min, settings.max);
            val1 = val2 * answer;
            q = { mode: 'DIVISION', val1, val2, answer, isRetry: false } as Question;
            break;
        default: q = { mode: 'SQUARES', val1: 2, answer: 4 } as Question;
    }
    return q;
  }, [settings]);

  useEffect(() => { 
      const q = generateQuestion();
      setCurrentQuestion(q);
      if (isOptionsMode) setOptions(generateOptions(q));
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

  const processAnswer = useCallback((overrideValue?: number, skipFlash?: boolean) => {
    if (!currentQuestion || !isPlaying) return;
    
    let userVal: number;
    if (overrideValue !== undefined) {
        userVal = overrideValue;
    } else {
        const cleanInput = inputValue.replace('−', '-');
        userVal = parseInt(cleanInput);
        if (inputValue.trim() === '') return;
    }

    const isCorrect = userVal === currentQuestion.answer;
    const timeTaken = Date.now() - questionStartTimeRef.current;
    
    setHistory(prev => [...prev, { question: currentQuestion, userAnswer: isNaN(userVal) ? 0 : userVal, isCorrect, timeTaken }]);

    if (isCorrect) {
      setScore(prev => prev + 1); setCorrectCount(prev => prev + 1);
      if (!skipFlash) {
          setFlash('green');
          setTimeout(() => setFlash('none'), 300);
      }
    } else {
      if (settings.smartMode) retryQueueRef.current.push({ ...currentQuestion, isRetry: true });
      if (!skipFlash) {
          setFlash('red');
          setTimeout(() => setFlash('none'), 300);
      }
    }

    setInputValue('');
    let nextQ = generateQuestion();
    // Avoid immediate repeat
    let attempts = 0;
    while (attempts < 5 && !nextQ.isRetry) {
        if (nextQ.val1 === currentQuestion.val1 && nextQ.val2 === currentQuestion.val2) { /* retry */ } else { break; }
        nextQ = generateQuestion(); attempts++;
    }
    setCurrentQuestion(nextQ);
    if (isOptionsMode) setOptions(generateOptions(nextQ));
    questionStartTimeRef.current = Date.now();
  }, [currentQuestion, inputValue, generateQuestion, settings.smartMode, isPlaying, isOptionsMode]);

  const handleOptionClick = (val: number) => {
      if (selectedOption !== null || !isPlaying) return;
      
      setSelectedOption(val);
      const isCorrect = val === currentQuestion?.answer;
      
      // Feedback Phase
      setFlash(isCorrect ? 'green' : 'red');
      setTimeout(() => setFlash('none'), 300);

      // Delay to show button colors
      setTimeout(() => {
          processAnswer(val, true); // Commit answer, skip duplicate flash
          setSelectedOption(null);
      }, 700);
  };

  const handleFormSubmit = (e: React.FormEvent) => { e.preventDefault(); processAnswer(); };

  useEffect(() => {
    if (isOptionsMode) return; 
    
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
  }, [processAnswer, onExit, isPlaying, isOptionsMode]);

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
      
      {/* Conditionally render Numpad only if NOT in Options Mode */}
      {!isOptionsMode && (
          <DraggableNumpad 
              onInput={handleNumpadInput}
              onDelete={handleNumpadDelete}
              onEnter={() => processAnswer()}
              isKid={isKid}
          />
      )}

      {/* Start Overlay */}
      {!isPlaying && (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
              <div className={`p-8 rounded-[32px] max-w-sm w-full text-center shadow-2xl ${isKid ? 'bg-[#f3edf7]' : 'bg-[#1e1e1e] border border-white/10'}`}>
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${isKid ? 'bg-indigo-100 text-indigo-700' : 'bg-[#4f378b] text-[#eaddff]'}`}>
                      <span className="material-symbol text-3xl">{isOptionsMode ? 'touch_app' : 'drag_pan'}</span>
                  </div>
                  <h2 className={`text-2xl font-bold mb-2 ${isKid ? 'text-[#1d1b20]' : 'text-white'}`}>
                      {isOptionsMode ? 'Ready?' : 'Position the Numpad'}
                  </h2>
                  <p className={`mb-8 text-sm ${isKid ? 'text-[#49454f]' : 'text-[#c4c7c5]'}`}>
                      {isOptionsMode ? 'Select the correct answer from the options.' : 'Drag the keypad to a comfortable spot before you begin.'}
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
          <div className="flex gap-3">
            <button onClick={onExit} className={`w-12 h-12 rounded-full flex items-center justify-center ${isKid ? 'bg-white hover:bg-gray-100' : 'bg-[#2d2f31] hover:bg-[#3d3f41]'} transition-colors`}>
                <span className="material-symbol">close</span>
            </button>
            <button onClick={toggleFullScreen} className={`w-12 h-12 rounded-full flex items-center justify-center ${isKid ? 'bg-white hover:bg-gray-100' : 'bg-[#2d2f31] hover:bg-[#3d3f41]'} transition-colors`}>
                <span className="material-symbol">{isFullscreen ? 'close_fullscreen' : 'fullscreen'}</span>
            </button>
          </div>
          
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

        {/* Answer Area: Either Text Input or Multiple Choice Buttons */}
        {isOptionsMode ? (
            <div className="w-full max-w-lg grid grid-cols-2 gap-4 animate-fade-in">
                {options.map((opt, idx) => {
                    let btnClass = isKid 
                        ? 'bg-white text-indigo-900 border-2 border-indigo-100 hover:border-indigo-300' 
                        : 'bg-[#1e1e1e] text-[#e3e3e3] border border-white/10 hover:bg-[#2d2f31]';
                    
                    if (selectedOption !== null) {
                        if (opt === currentQuestion?.answer) {
                             btnClass = isKid 
                                ? 'bg-green-400 text-white border-green-500 shadow-md scale-105' 
                                : 'bg-green-900 text-green-100 border-green-700';
                        } else if (opt === selectedOption) {
                             btnClass = isKid
                                ? 'bg-red-400 text-white border-red-500'
                                : 'bg-red-900 text-red-100 border-red-700';
                        } else {
                             btnClass += " opacity-25";
                        }
                    }

                    return (
                        <button
                            key={idx}
                            onClick={() => handleOptionClick(opt)}
                            disabled={selectedOption !== null}
                            className={`h-24 rounded-2xl text-4xl font-bold transition-all active:scale-95 shadow-sm ${btnClass}`}
                        >
                            {opt}
                        </button>
                    )
                })}
            </div>
        ) : (
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
        )}
        
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