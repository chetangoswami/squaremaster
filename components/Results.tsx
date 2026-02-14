import React, { useState } from 'react';
import { GameStats, AnswerRecord, GameSettings } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { RefreshCcw, Home as HomeIcon, Lightbulb, XCircle, Brain, Target, Zap, Star, Trophy, Smile } from 'lucide-react';
import { getMentalMathTip } from '../services/geminiService';

interface ResultsProps {
  stats: GameStats;
  settings: GameSettings;
  onRestart: () => void;
  onHome: () => void;
}

const Results: React.FC<ResultsProps> = ({ stats, settings, onRestart, onHome }) => {
  const incorrect = stats.totalQuestions - stats.correct;
  const accuracy = stats.totalQuestions > 0 ? Math.round((stats.correct / stats.totalQuestions) * 100) : 0;
  
  const chartData = [
    { name: 'Correct', value: stats.correct },
    { name: 'Incorrect', value: incorrect },
  ];
  
  const isKid = settings.kidMode;
  const COLORS = isKid ? ['#facc15', '#f87171'] : ['#6366f1', '#ef4444']; 
  const [loadingTip, setLoadingTip] = useState<string | null>(null);
  const [tips, setTips] = useState<Record<string, string>>({});

  const getQuestionKey = (q: AnswerRecord['question']) => {
      if (q.mode === 'SQUARES') return `sq_${q.val1}`;
      return `${q.mode}_${q.val1}_${q.val2}`;
  };

  const handleGetTip = async (record: AnswerRecord) => {
    const key = getQuestionKey(record.question);
    if (tips[key]) return; 
    setLoadingTip(key);
    const tip = await getMentalMathTip(record.question);
    setTips(prev => ({ ...prev, [key]: tip }));
    setLoadingTip(null);
  };

  const mistakes = stats.history.filter(h => !h.isCorrect);
  const formatQuestion = (q: AnswerRecord['question']) => {
      let op = '';
      switch (q.mode) {
          case 'MULTIPLICATION': op = '×'; break;
          case 'ADDITION': op = '+'; break;
          case 'SUBTRACTION': op = '−'; break;
          case 'DIVISION': op = '÷'; break;
          default: op = '';
      }
      if (q.mode === 'SQUARES') return <span>{q.val1}<sup className={isKid ? "text-sky-500" : "text-indigo-400"}>2</sup></span>;
      return <span>{q.val1} <span className={isKid ? "text-sky-500" : "text-indigo-400"}>{op}</span> {q.val2}</span>;
  };

  // Styles
  const containerClass = isKid ? "min-h-screen p-6 md:p-12 overflow-y-auto bg-sky-50 text-slate-800" : "min-h-screen p-6 md:p-12 overflow-y-auto text-slate-100";
  const headerTextClass = isKid ? "text-4xl font-black text-sky-600" : "text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400";
  const cardClass = isKid ? "bg-white rounded-3xl p-8 shadow-xl border border-sky-100" : "glass rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden group";

  return (
    <div className={containerClass}>
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h2 className={headerTextClass}>{isKid ? "Great Job! 🎉" : "Performance Report"}</h2>
            <p className={isKid ? "text-sky-400 font-medium mt-1" : "text-slate-400 mt-1"}>
                {isKid ? "You are a math superstar!" : `Session completed on ${new Date(stats.endTime).toLocaleTimeString()}`}
            </p>
          </div>
          <div className="flex gap-4">
            <button onClick={onHome} className={`p-4 rounded-2xl transition-colors ${isKid ? "bg-white text-sky-400 shadow-md hover:bg-sky-50" : "glass text-slate-300 hover:bg-white/10 hover:text-white"}`}>
              <HomeIcon className="w-6 h-6" />
            </button>
            <button onClick={onRestart} className={`px-8 py-4 rounded-2xl font-bold transition-all shadow-lg flex items-center gap-3 ${isKid ? "bg-yellow-400 text-white hover:bg-yellow-300 hover:shadow-yellow-300/50" : "bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-500/30"}`}>
              <RefreshCcw className="w-5 h-5" />
              {isKid ? "Play Again" : "Play Again"}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Main Score */}
          <div className={cardClass}>
             {isKid && <div className="absolute top-0 right-0 p-32 bg-yellow-100 rounded-full blur-[60px] opacity-50" />}
             {!isKid && <div className="absolute top-0 right-0 p-32 bg-indigo-600/10 rounded-full blur-[60px] group-hover:bg-indigo-600/20 transition-all" />}
             
             <div className={`flex items-center gap-3 mb-4 ${isKid ? 'text-yellow-500' : 'text-indigo-400'}`}>
                 {isKid ? <Trophy className="w-6 h-6" /> : <Target className="w-5 h-5" />}
                 <span className="text-xs font-bold uppercase tracking-widest">{isKid ? "Total Stars" : "Score"}</span>
             </div>
             <div className={`text-7xl font-black tracking-tighter mb-2 ${isKid ? 'text-sky-600' : 'text-white'}`}>{stats.score}</div>
             <div className={isKid ? "text-sky-400 text-sm font-bold" : "text-slate-400 text-sm"}>{isKid ? "Amazing work!" : "Total points accumulated"}</div>
          </div>

          {/* Accuracy & Speed */}
          <div className={isKid ? "bg-white rounded-3xl p-8 shadow-xl border border-sky-100" : "glass rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden"}>
             <div className={`flex items-center gap-3 mb-6 ${isKid ? 'text-green-400' : 'text-emerald-400'}`}>
                 {isKid ? <Smile className="w-6 h-6" /> : <Zap className="w-5 h-5" />}
                 <span className="text-xs font-bold uppercase tracking-widest">{isKid ? "Accuracy" : "Efficiency"}</span>
             </div>
             <div className="grid grid-cols-2 gap-8">
                <div>
                   <div className={`text-4xl font-bold mb-1 ${isKid ? 'text-sky-600' : 'text-white'}`}>{accuracy}%</div>
                   <div className={`text-xs uppercase tracking-wider font-bold ${isKid ? 'text-sky-300' : 'text-slate-500'}`}>Correct</div>
                </div>
                <div>
                   <div className={`text-4xl font-bold mb-1 ${isKid ? 'text-sky-600' : 'text-white'}`}>{Math.round((stats.totalQuestions / ((stats.endTime - stats.startTime)/60000)) || 0)}</div>
                   <div className={`text-xs uppercase tracking-wider font-bold ${isKid ? 'text-sky-300' : 'text-slate-500'}`}>{isKid ? "Speed" : "Ans/Min"}</div>
                </div>
             </div>
          </div>

          {/* Chart */}
          <div className={isKid ? "bg-white rounded-3xl p-6 flex items-center justify-center relative shadow-xl border border-sky-100" : "glass rounded-3xl p-6 flex items-center justify-center relative"}>
            {stats.totalQuestions > 0 ? (
                <div className="w-full h-48">
                    <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={8}
                        dataKey="value"
                        stroke="none"
                        cornerRadius={6}
                        >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="drop-shadow-lg" />
                        ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={isKid ? { backgroundColor: '#fff', borderColor: '#e0f2fe', borderRadius: '12px', color: '#0369a1' } : { backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }} 
                            itemStyle={isKid ? { color: '#0369a1', fontWeight: 'bold' } : { color: '#fff' }} 
                        />
                    </PieChart>
                    </ResponsiveContainer>
                </div>
            ) : <span className="text-slate-500">No data</span>}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                    <div className={`text-2xl font-bold ${isKid ? 'text-sky-600' : 'text-white'}`}>{stats.totalQuestions}</div>
                    <div className={`text-[10px] uppercase tracking-widest ${isKid ? 'text-sky-400' : 'text-slate-500'}`}>Total</div>
                </div>
             </div>
          </div>
        </div>

        {/* AI Analysis Section */}
        <div className={`${isKid ? 'bg-sky-100/50 border-sky-200' : 'glass-panel border-indigo-500'} rounded-3xl p-8 border-l-4`}>
             <div className="flex items-center gap-3 mb-4">
                 <Brain className={`w-6 h-6 ${isKid ? 'text-sky-500' : 'text-indigo-400'}`} />
                 <h3 className={`text-xl font-bold ${isKid ? 'text-sky-700' : 'text-white'}`}>AI Coach</h3>
             </div>
             <p className={`leading-relaxed max-w-3xl ${isKid ? 'text-sky-800 font-medium' : 'text-slate-300'}`}>
                 {incorrect === 0 && stats.totalQuestions > 5 
                    ? (isKid ? "Wow! Zero mistakes! You are a genius! Try going a little faster next time to get even more stars!" : "Flawless performance! Your mental calculation speed is impressive. Consider expanding the number range to challenge your cognitive limits further.")
                    : incorrect > 3 
                        ? (isKid ? "Good try! I saw a few tricky ones. Let's look at the list below to learn the right answers." : "You're building good momentum, but consistency on the edge cases needs work. The AI has identified your weak spots and will prioritize them in the next session.")
                        : (isKid ? "You did really well! Keep practicing and you will be a math wizard soon!" : "Solid session. You handled most standard operations well, but slowed down on the larger transitions. Keep practicing to build muscle memory.")
                 }
             </p>
        </div>

        {/* Mistakes List */}
        {mistakes.length > 0 && (
            <div className="space-y-6 animate-in slide-in-from-bottom-8 fade-in duration-700">
                <h3 className={`text-2xl font-bold ${isKid ? 'text-sky-700' : 'text-white'}`}>{isKid ? "Let's Review" : "Learning Opportunities"}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mistakes.map((record, idx) => {
                        const key = getQuestionKey(record.question);
                        const tip = tips[key];
                        return (
                            <div key={idx} className={`${isKid ? 'bg-white border border-red-100' : 'glass-panel hover:bg-white/5'} p-6 rounded-2xl group transition-colors`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className={`text-2xl font-mono font-bold mb-2 ${isKid ? 'text-slate-700' : 'text-white'}`}>
                                            {formatQuestion(record.question)}
                                        </div>
                                        <div className={`flex items-center gap-2 text-sm font-mono px-2 py-1 rounded-md w-fit ${isKid ? 'text-red-500 bg-red-50' : 'text-red-400 bg-red-500/10'}`}>
                                            <XCircle className="w-3 h-3" />
                                            {record.userAnswer}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-xs uppercase tracking-wider mb-1 ${isKid ? 'text-sky-400' : 'text-slate-500'}`}>Correct</div>
                                        <div className={`text-xl font-bold font-mono ${isKid ? 'text-green-500' : 'text-emerald-400'}`}>{record.question.answer}</div>
                                    </div>
                                </div>
                                
                                {tip ? (
                                    <div className={`mt-4 pt-4 border-t text-sm leading-relaxed animate-in fade-in ${isKid ? 'border-sky-100 text-sky-700' : 'border-white/5 text-indigo-200'}`}>
                                        <span className={`font-bold block text-xs uppercase mb-1 ${isKid ? 'text-sky-400' : 'text-indigo-400'}`}>{isKid ? "Secret Trick" : "Memorization Tip"}</span>
                                        {tip}
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => handleGetTip(record)}
                                        disabled={loadingTip === key}
                                        className={`w-full mt-2 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 ${isKid ? 'text-sky-500 hover:bg-sky-50' : 'text-indigo-400 hover:text-white hover:bg-indigo-600/20'}`}
                                    >
                                        <Lightbulb className="w-3 h-3" />
                                        {loadingTip === key ? 'Thinking...' : (isKid ? 'Help Me Learn!' : 'Get AI Trick')}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Results;
