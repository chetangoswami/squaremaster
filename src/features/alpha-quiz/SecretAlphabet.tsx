import React, { useState, useCallback } from 'react';
import { alphabets, opposites } from '../../data/alphabetData';

interface SecretAlphabetProps {
  onBack: () => void;
}

type QuizType = 'none' | 'letter_to_num' | 'num_to_letter' | 'opposite' | 'mixed';

const TOTAL_QUESTIONS = 20;

const SecretAlphabet: React.FC<SecretAlphabetProps> = ({ onBack }) => {
  const [quizType, setQuizType] = useState<QuizType>('none');
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<(string | number)[]>([]);
  const [answer, setAnswer] = useState<string | number>('');
  
  // Progress & Stats
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  
  const [wrongOptions, setWrongOptions] = useState<Set<string | number>>(new Set());
  const [isTransitioning, setIsTransitioning] = useState(false);

  const generateQuestion = useCallback((type: QuizType) => {
    const actualType = type === 'mixed'
      ? ['letter_to_num', 'num_to_letter', 'opposite'][Math.floor(Math.random() * 3)]
      : type;

    let q = '';
    let ans: string | number = '';
    let opts: (string | number)[] = [];

    const getRandomLetter = () => String.fromCharCode(65 + Math.floor(Math.random() * 26));
    const getRandomNumber = () => Math.floor(Math.random() * 26) + 1;

    if (actualType === 'letter_to_num') {
      const letter = getRandomLetter();
      q = `Position of ${letter}?`;
      ans = letter.charCodeAt(0) - 64;
      opts = [ans];
      while(opts.length < 4) {
        const wrong = getRandomNumber();
        if (!opts.includes(wrong)) opts.push(wrong);
      }
    } else if (actualType === 'num_to_letter') {
      const num = getRandomNumber();
      q = `Letter at position ${num}?`;
      ans = String.fromCharCode(64 + num);
      opts = [ans];
      while(opts.length < 4) {
        const wrong = getRandomLetter();
        if (!opts.includes(wrong)) opts.push(wrong);
      }
    } else if (actualType === 'opposite') {
      const letter = getRandomLetter();
      q = `Opposite of ${letter}?`;
      ans = String.fromCharCode(90 - (letter.charCodeAt(0) - 65));
      opts = [ans];
      while(opts.length < 4) {
        const wrong = getRandomLetter();
        if (!opts.includes(wrong) && wrong !== letter) opts.push(wrong);
      }
    }

    opts.sort(() => Math.random() - 0.5);

    setQuestion(q);
    setAnswer(ans);
    setOptions(opts);
    setWrongOptions(new Set());
    setIsTransitioning(false);
  }, []);

  const startQuiz = (type: QuizType) => {
    setQuizType(type);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setCurrentQuestion(1);
    setIsFinished(false);
    generateQuestion(type);
  };

  const handleOptionClick = (opt: string | number) => {
    if (isTransitioning || wrongOptions.has(opt)) return;

    if (opt === answer) {
      setIsTransitioning(true);
      
      const isFirstTry = wrongOptions.size === 0;
      if (isFirstTry) {
        setScore(s => s + 1);
        const newStreak = streak + 1;
        setStreak(newStreak);
        setMaxStreak(m => Math.max(m, newStreak));
      }

      setTimeout(() => {
        if (currentQuestion < TOTAL_QUESTIONS) {
          setCurrentQuestion(q => q + 1);
          generateQuestion(quizType);
        } else {
          setIsFinished(true);
          setIsTransitioning(false);
        }
      }, 400);
    } else {
      setStreak(0);
      setWrongOptions(prev => new Set(prev).add(opt));
    }
  };

  if (isFinished) {
    return (
      <div className="min-h-screen bg-[#121212] text-[#e3e3e3] p-4 flex flex-col items-center justify-center">
        <div className="w-full max-w-md bg-[#1e1e1e] rounded-3xl p-8 shadow-lg text-center border border-[#333537] space-y-6">
          <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbol text-5xl text-indigo-400">emoji_events</span>
          </div>
          <h2 className="text-3xl font-bold text-white">Quiz Complete!</h2>
          
          <div className="bg-[#2d2f31] rounded-2xl p-6 space-y-4 text-lg">
            <div className="flex justify-between items-center border-b border-[#3d3f41] pb-3">
              <span className="text-gray-400">Score</span>
              <span className="text-green-400 font-bold text-2xl">{score} <span className="text-sm text-gray-500">/ {TOTAL_QUESTIONS}</span></span>
            </div>
            <div className="flex justify-between items-center border-b border-[#3d3f41] pb-3">
              <span className="text-gray-400">Accuracy</span>
              <span className="text-blue-400 font-bold text-xl">{Math.round((score / TOTAL_QUESTIONS) * 100)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Best Streak</span>
              <span className="text-orange-400 font-bold text-xl">{maxStreak} 🔥</span>
            </div>
          </div>

          <div className="flex gap-4 justify-center pt-4">
            <button onClick={() => { setQuizType('none'); setIsFinished(false); }} className="flex-1 py-3 rounded-xl bg-[#2d2f31] hover:bg-[#3d3f41] font-bold transition-colors">
              Back
            </button>
            <button onClick={() => startQuiz(quizType)} className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-white transition-colors shadow-lg shadow-indigo-900/20">
              Play Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (quizType !== 'none') {
    const progressPercent = ((currentQuestion - 1) / TOTAL_QUESTIONS) * 100;

    return (
      <div className="min-h-screen bg-[#121212] text-[#e3e3e3] p-4 flex flex-col items-center justify-center">
        <div className="w-full max-w-md space-y-6">
          {/* Quiz Header */}
          <div className="flex justify-between items-center">
            <button 
              onClick={() => { setQuizType('none'); setIsFinished(false); }}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-[#2d2f31] hover:bg-[#3d3f41] transition-colors"
            >
              <span className="material-symbol">close</span>
            </button>
            <div className="flex gap-4 text-lg font-mono">
              <span className="text-green-400">Score: {score}</span>
              <span className="text-orange-400">Streak: {streak}🔥</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="w-full bg-[#2d2f31] h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-500 h-full transition-all duration-300 ease-out" 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <div className="text-center text-sm font-medium text-gray-400">
              Question {currentQuestion} of {TOTAL_QUESTIONS}
            </div>
          </div>

          {/* Question */}
          <div className="bg-[#1e1e1e] rounded-3xl p-8 shadow-lg text-center min-h-[200px] flex flex-col justify-center border border-[#333537]">
            <h2 className="text-3xl font-bold text-white mb-2">{question}</h2>
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-4">
            {options.map((opt, i) => {
              const isWrong = wrongOptions.has(opt);
              const isCorrect = isTransitioning && opt === answer;
              
              let btnClass = "h-20 text-2xl font-bold rounded-2xl transition-all duration-200 ";
              if (isCorrect) {
                btnClass += "bg-green-600 text-white scale-105 shadow-lg shadow-green-900/50";
              } else if (isWrong) {
                btnClass += "bg-red-900/50 text-red-200 opacity-50 scale-95";
              } else {
                btnClass += "bg-[#2d2f31] text-[#d0bcff] hover:bg-[#3d3f41] hover:scale-105 active:scale-95 shadow-md";
              }

              return (
                <button
                  key={i}
                  onClick={() => handleOptionClick(opt)}
                  className={btnClass}
                  disabled={isTransitioning || isWrong}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-[#e3e3e3] p-4 flex flex-col items-center">
      <div className="w-full max-w-3xl space-y-6 pb-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-[#2d2f31] hover:bg-[#3d3f41] transition-colors"
          >
            <span className="material-symbol">arrow_back</span>
          </button>
          <h1 className="text-2xl font-bold text-white">English Alphabet Test</h1>
        </div>

        {/* Quiz Section */}
        <div className="bg-[#1e1e1e] rounded-2xl p-6 shadow-sm space-y-4 border border-indigo-500/30">
          <h2 className="text-xl font-semibold text-indigo-400 flex items-center gap-2">
            <span className="material-symbol">quiz</span>
            Test Your Memory
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => startQuiz('letter_to_num')} className="bg-[#2d2f31] hover:bg-[#3d3f41] p-3 rounded-xl text-sm font-medium text-white transition-colors">
              Letter → Number
            </button>
            <button onClick={() => startQuiz('num_to_letter')} className="bg-[#2d2f31] hover:bg-[#3d3f41] p-3 rounded-xl text-sm font-medium text-white transition-colors">
              Number → Letter
            </button>
            <button onClick={() => startQuiz('opposite')} className="bg-[#2d2f31] hover:bg-[#3d3f41] p-3 rounded-xl text-sm font-medium text-white transition-colors">
              Opposite Pairs
            </button>
            <button onClick={() => startQuiz('mixed')} className="bg-indigo-600 hover:bg-indigo-700 p-3 rounded-xl text-sm font-medium text-white transition-colors shadow-lg shadow-indigo-900/20">
              Mixed Quiz
            </button>
          </div>
        </div>

        {/* Positions Section */}
        <div className="bg-[#1e1e1e] rounded-2xl p-6 shadow-sm space-y-6">
          <h2 className="text-xl font-semibold text-[#d0bcff] border-b border-[#333537] pb-2">Positions & Mnemonics</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm font-mono">
            {alphabets.map((item) => (
              <div key={item.char} className="flex items-center gap-2">
                <span className="text-white font-bold w-4">{item.char}</span>
                <span className="text-gray-500">-</span>
                <span className="w-5">{item.num}</span>
                {item.mnemonic && (
                  <span className="text-gray-400 text-xs truncate" title={item.mnemonic}>
                    ({item.mnemonic})
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* EJOTY Box */}
          <div className="mt-6 p-4 border border-[#d0bcff] rounded-xl inline-block bg-[#2d2f31]">
            <div className="flex gap-4 font-mono text-lg font-bold text-white mb-2 justify-center">
              <span>E</span><span>J</span><span>O</span><span>T</span><span>Y</span>
            </div>
            <div className="flex gap-4 font-mono text-sm text-[#d0bcff] justify-center">
              <span>5</span><span>10</span><span>15</span><span>20</span><span>25</span>
            </div>
          </div>
        </div>

        {/* Opposite Section */}
        <div className="bg-[#1e1e1e] rounded-2xl p-6 shadow-sm space-y-6">
          <h2 className="text-xl font-semibold text-[#d0bcff] border-b border-[#333537] pb-2">Opposite Pairs</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8 text-sm font-mono">
            {opposites.map((item) => (
              <div key={item.pair} className="flex justify-between items-center border-b border-[#333537] pb-2">
                <span className="text-white font-bold text-lg">{item.pair}</span>
                <span className="text-gray-400 bg-[#2d2f31] px-2 py-1 rounded">{item.mnemonic}</span>
              </div>
            ))}
          </div>

          {/* Special Words */}
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-4 bg-[#2d2f31] p-4 rounded-xl">
              <div className="flex gap-2 text-xl font-bold text-white">
                <span className="border border-[#d0bcff] rounded-full w-8 h-8 flex items-center justify-center">L</span>
                <span className="border border-[#d0bcff] rounded-full w-8 h-8 flex items-center justify-center">O</span>
                <span className="border border-[#d0bcff] rounded-full w-8 h-8 flex items-center justify-center">V</span>
                <span className="border border-[#d0bcff] rounded-full w-8 h-8 flex items-center justify-center">E</span>
              </div>
              <span className="text-gray-400 text-sm">(L-O, V-E)</span>
            </div>
            
            <div className="flex items-center gap-4 bg-[#2d2f31] p-4 rounded-xl">
              <div className="flex gap-2 text-xl font-bold text-white">
                <span className="border border-[#d0bcff] rounded-full w-8 h-8 flex items-center justify-center">S</span>
                <span className="border border-[#d0bcff] rounded-full w-8 h-8 flex items-center justify-center">H</span>
                <span className="border border-[#d0bcff] rounded-full w-8 h-8 flex items-center justify-center">I</span>
                <span className="border border-[#d0bcff] rounded-full w-8 h-8 flex items-center justify-center">R</span>
                <span className="border border-[#d0bcff] rounded-full w-8 h-8 flex items-center justify-center">T</span>
                <span className="border border-[#d0bcff] rounded-full w-8 h-8 flex items-center justify-center">G</span>
              </div>
              <span className="text-gray-400 text-sm">(S-H, I-R, T-G)</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SecretAlphabet;
