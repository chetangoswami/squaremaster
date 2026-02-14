import React, { useState } from 'react';
import { GameStats, AnswerRecord, GameSettings } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { getMentalMathTip } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface ResultsProps {
  stats: GameStats;
  settings: GameSettings;
  onRestart: () => void;
  onHome: () => void;
}

const Results: React.FC<ResultsProps> = ({ stats, settings, onRestart, onHome }) => {
  const incorrect = stats.totalQuestions - stats.correct;
  const accuracy = stats.totalQuestions > 0 ? Math.round((stats.correct / stats.totalQuestions) * 100) : 0;
  const chartData = [{ name: 'Correct', value: stats.correct }, { name: 'Incorrect', value: incorrect }];
  const isKid = settings.kidMode;
  
  const [loadingTip, setLoadingTip] = useState<string | null>(null);
  const [tips, setTips] = useState<Record<string, string>>({});

  const getQuestionKey = (q: AnswerRecord['question']) => q.mode === 'SQUARES' ? `sq_${q.val1}` : `${q.mode}_${q.val1}_${q.val2}`;

  const handleGetTip = async (record: AnswerRecord) => {
    const key = getQuestionKey(record.question);
    if (tips[key]) return; 
    setLoadingTip(key);
    const tip = await getMentalMathTip(record.question);
    setTips(prev => ({ ...prev, [key]: tip }));
    setLoadingTip(null);
  };

  const COLORS = isKid ? ['#6750a4', '#b3261e'] : ['#d0bcff', '#f2b8b5'];
  const mistakes = stats.history.filter(h => !h.isCorrect);

  const formatQ = (q: AnswerRecord['question']) => {
      let op = q.mode === 'MULTIPLICATION' ? '×' : q.mode === 'ADDITION' ? '+' : q.mode === 'SUBTRACTION' ? '−' : q.mode === 'DIVISION' ? '÷' : '';
      if (q.mode === 'SQUARES') return <span>{q.val1}²</span>;
      return <span>{q.val1} {op} {q.val2}</span>;
  };

  // M3 Styles
  const pageBg = isKid ? "bg-[#fef7ff]" : "bg-[#121212]";
  const surface = isKid ? "bg-[#f3edf7]" : "bg-[#1e1e1e] border border-white/10";
  const textMain = isKid ? "text-[#1d1b20]" : "text-[#e3e3e3]";
  const textSub = isKid ? "text-[#49454f]" : "text-[#c4c7c5]";

  return (
    <div className={`min-h-screen p-4 md:p-8 overflow-y-auto ${pageBg} ${textMain}`}>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Actions */}
        <div className="flex justify-between items-center mb-4">
            <button onClick={onHome} className={`w-12 h-12 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10`}>
                <span className="material-symbol">home</span>
            </button>
            <h1 className="text-xl font-bold">Summary</h1>
            <div className="w-12" /> 
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Score Card */}
            <div className={`col-span-1 lg:col-span-2 rounded-[32px] p-8 flex flex-col justify-center items-center text-center ${isKid ? 'bg-[#e8def8] text-[#1d1b20]' : 'bg-[#4f378b] text-[#eaddff]'}`}>
                <span className="text-sm font-medium uppercase tracking-widest opacity-70">Total Score</span>
                <span className="text-[6rem] leading-none font-bold my-2">{stats.score}</span>
                <div className="flex gap-2">
                    {[1,2,3].map(i => <span key={i} className="material-symbol text-2xl filled">star</span>)}
                </div>
            </div>

            {/* Pie Chart */}
            <div className={`rounded-[32px] p-6 flex flex-col items-center justify-center ${surface}`}>
                <div className="w-32 h-32 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={chartData} innerRadius={40} outerRadius={60} dataKey="value" stroke="none">
                                {chartData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                        {accuracy}%
                    </div>
                </div>
                <span className={`text-sm font-medium mt-2 ${textSub}`}>Accuracy</span>
            </div>

            {/* AI Coach */}
            <div className={`col-span-1 md:col-span-2 lg:col-span-3 rounded-[32px] p-6 flex gap-4 items-start ${isKid ? 'bg-[#c3ecd2] text-[#05210f]' : 'bg-[#334841] text-[#cce8e0]'}`}>
                <div className="p-3 bg-white/20 rounded-xl">
                    <span className="material-symbol">psychology</span>
                </div>
                <div>
                    <h3 className="font-bold text-lg mb-1">AI Insights</h3>
                    <p className="text-sm leading-relaxed opacity-90">
                        {incorrect === 0 
                            ? "Perfect score! Your response times were consistent. Try increasing the number range next time." 
                            : "Good effort. I noticed you slowed down on 8s and 9s. We'll practice those more frequently."}
                    </p>
                </div>
            </div>
        </div>

        {/* Mistakes Section */}
        {mistakes.length > 0 && (
            <div className="space-y-4 pt-4">
                <h3 className={`text-lg font-bold px-2 ${textSub}`}>Needs Review</h3>
                <div className="grid gap-3">
                    {mistakes.map((record, idx) => {
                        const key = getQuestionKey(record.question);
                        return (
                            <div key={idx} className={`rounded-2xl p-5 ${surface}`}>
                                <div className="flex justify-between items-center mb-3">
                                    <div className="text-2xl font-mono font-medium">{formatQ(record.question)}</div>
                                    <div className={`text-xl font-bold ${isKid ? 'text-[#b3261e]' : 'text-[#f2b8b5]'}`}>
                                        {record.question.answer}
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className={`text-sm px-2 py-1 rounded-md bg-red-500/10 text-red-500`}>
                                        You said: {record.userAnswer}
                                    </div>
                                    {!tips[key] ? (
                                        <button 
                                            onClick={() => handleGetTip(record)}
                                            disabled={loadingTip === key}
                                            className={`text-sm font-medium flex items-center gap-1 ${isKid ? 'text-[#6750a4]' : 'text-[#d0bcff]'}`}
                                        >
                                            <span className="material-symbol text-lg">lightbulb</span>
                                            {loadingTip === key ? 'Thinking...' : 'Why?'}
                                        </button>
                                    ) : null}
                                </div>
                                {tips[key] && (
                                    <div className="mt-4 pt-3 border-t border-gray-500/10 text-sm">
                                        <ReactMarkdown>{tips[key]}</ReactMarkdown>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        )}

        {/* Action Button */}
        <button
            onClick={onRestart}
            className={`w-full h-14 rounded-full font-medium text-lg shadow-md flex items-center justify-center gap-2 mt-8 ${isKid ? 'bg-[#6750a4] text-white' : 'bg-[#d0bcff] text-[#381e72]'}`}
        >
            <span className="material-symbol">replay</span>
            Play Again
        </button>
      </div>
    </div>
  );
};

export default Results;