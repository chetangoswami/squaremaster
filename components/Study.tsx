import React, { useState } from 'react';
import { AppView, GameSettings } from '../types';
import { ArrowLeft, Sparkles, Send, GraduationCap, Zap, Table, BookOpen } from 'lucide-react';
import { getGeneralStudyAdvice } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface StudyProps {
  settings: GameSettings;
  onBack: () => void;
}

const Study: React.FC<StudyProps> = ({ settings, onBack }) => {
  const [activeTab, setActiveTab] = useState<'reference' | 'tricks' | 'ai-tutor'>('reference');
  const isKid = settings.kidMode;
  
  const squares: { base: number; sq: number }[] = [];
  for (let i = 1; i <= 100; i++) squares.push({ base: i, sq: i * i });

  const [prompt, setPrompt] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', content: string}[]>([
      {role: 'ai', content: isKid ? "Hi! I'm your Math Buddy. Ask me anything about numbers!" : "Hi! I'm your AI Math Tutor. Ask me for mental math tricks, how to calculate squares faster, or explain a concept!"}
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
      if (!prompt.trim()) return;
      const userMsg = prompt;
      setPrompt('');
      setChatHistory(prev => [...prev, {role: 'user', content: userMsg}]);
      setLoading(true);
      const response = await getGeneralStudyAdvice(userMsg);
      setChatHistory(prev => [...prev, {role: 'ai', content: response}]);
      setLoading(false);
  };

  const tricks = [
      {
          title: "Squaring Numbers Ending in 5",
          example: "35² = 1225",
          steps: [
              "Take the digit(s) before 5. (For 35, it's 3)",
              "Multiply it by the next higher number. (3 × 4 = 12)",
              "Append '25' to the end. (Result: 1225)"
          ],
          formula: "(10n + 5)² = 100n(n+1) + 25"
      },
      {
          title: "Squaring Numbers Near 50",
          example: "48² = 2304",
          steps: [
              "Find the difference from 50. (50 - 48 = 2)",
              "Subtract that difference from 25. (25 - 2 = 23) -> These are the first digits.",
              "Square the difference. (2² = 04) -> These are the last two digits.",
              "Combine them: 2304"
          ],
          formula: "(50 ± x)² = 2500 ± 100x + x²"
      },
      {
          title: "Squaring Numbers Near 50 (Above)",
          example: "53² = 2809",
          steps: [
              "Find the difference from 50. (53 - 50 = 3)",
              "Add that difference to 25. (25 + 3 = 28)",
              "Square the difference. (3² = 09)",
              "Combine them: 2809"
          ]
      },
      {
          title: "Squaring Numbers Near 100",
          example: "96² = 9216",
          steps: [
              "Find the difference from 100. (100 - 96 = 4)",
              "Subtract that difference from the original number. (96 - 4 = 92)",
              "Square the difference. (4² = 16)",
              "Combine them: 9216"
          ],
          formula: "(100 - x)² = 100(100-2x) + x²"
      }
  ];

  const bgColor = isKid ? 'bg-sky-100' : 'bg-[#020617]';
  const headerClass = isKid ? 'bg-white/80 backdrop-blur-lg border-b border-sky-100' : 'glass border-b-0';
  const textColor = isKid ? 'text-slate-800' : 'text-slate-200';

  return (
    <div className={`min-h-screen flex flex-col ${bgColor} transition-colors duration-500`}>
      {/* Header */}
      <header className={`${headerClass} sticky top-0 z-20`}>
        <div className="max-w-5xl mx-auto px-4 h-20 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <button onClick={onBack} className={`p-3 rounded-full transition-colors ${isKid ? 'hover:bg-sky-50 text-sky-400' : 'hover:bg-white/10 text-slate-300 hover:text-white'}`}>
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className={`text-xl font-bold flex items-center gap-2 ${isKid ? 'text-sky-700' : 'text-white'}`}>
                        <GraduationCap className={`w-5 h-5 ${isKid ? 'text-yellow-500' : 'text-indigo-400'}`} />
                        Study Center
                    </h1>
                </div>
            </div>
            
            {/* Desktop Tabs */}
            <div className={`flex p-1 rounded-xl ring-1 ${isKid ? 'bg-sky-50 ring-sky-200' : 'bg-slate-900/50 ring-white/10'}`}>
                <button 
                    onClick={() => setActiveTab('reference')}
                    className={`px-3 md:px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === 'reference' ? (isKid ? 'bg-white text-sky-600 shadow-sm' : 'bg-indigo-600 text-white shadow-lg') : (isKid ? 'text-sky-400 hover:text-sky-600' : 'text-slate-500 hover:text-white')}`}
                >
                    <Table className="w-3 h-3 md:hidden" />
                    <span className="hidden md:block">Reference</span>
                </button>
                <button 
                    onClick={() => setActiveTab('tricks')}
                    className={`px-3 md:px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === 'tricks' ? (isKid ? 'bg-white text-sky-600 shadow-sm' : 'bg-indigo-600 text-white shadow-lg') : (isKid ? 'text-sky-400 hover:text-sky-600' : 'text-slate-500 hover:text-white')}`}
                >
                    <Zap className="w-3 h-3 md:hidden" />
                    <span className="hidden md:block">Tricks</span>
                </button>
                <button 
                    onClick={() => setActiveTab('ai-tutor')}
                    className={`px-3 md:px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === 'ai-tutor' ? (isKid ? 'bg-white text-sky-600 shadow-sm' : 'bg-indigo-600 text-white shadow-lg') : (isKid ? 'text-sky-400 hover:text-sky-600' : 'text-slate-500 hover:text-white')}`}
                >
                    <Sparkles className="w-3 h-3" />
                    <span className="hidden md:block">AI Tutor</span>
                </button>
            </div>
        </div>
        
        {/* Mobile Tabs sub-bar */}
        <div className="md:hidden flex justify-around pb-2 px-4 text-[10px] font-bold uppercase tracking-widest text-center">
             <span className={activeTab === 'reference' ? (isKid ? 'text-sky-600' : 'text-indigo-400') : 'opacity-0'}>Reference</span>
             <span className={activeTab === 'tricks' ? (isKid ? 'text-sky-600' : 'text-indigo-400') : 'opacity-0'}>Tricks</span>
             <span className={activeTab === 'ai-tutor' ? (isKid ? 'text-sky-600' : 'text-indigo-400') : 'opacity-0'}>AI Tutor</span>
        </div>
      </header>

      <div className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8">
        
        {/* REFERENCE TAB */}
        {activeTab === 'reference' && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
                <h2 className={`text-3xl font-black mb-8 ${isKid ? 'text-sky-700' : 'text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400'}`}>Square Table (1-100)</h2>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {squares.map((item) => (
                        <div key={item.base} className={`${isKid ? 'bg-white border border-sky-100 shadow-sm' : 'glass-panel border-white/5'} p-4 rounded-xl flex justify-between items-center group hover:scale-[1.02] transition-all cursor-default`}>
                            <span className={`text-lg font-mono font-bold ${isKid ? 'text-sky-300' : 'text-slate-500'} group-hover:text-indigo-400 transition-colors`}>{item.base}²</span>
                            <span className={`text-2xl font-bold ${isKid ? 'text-slate-700' : 'text-white'}`}>{item.sq}</span>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* TRICKS TAB */}
        {activeTab === 'tricks' && (
             <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 space-y-8">
                <div className="text-center mb-8">
                    <h2 className={`text-3xl font-black mb-2 ${isKid ? 'text-sky-700' : 'text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400'}`}>Mental Math Secrets</h2>
                    <p className={isKid ? 'text-sky-500 font-medium' : 'text-slate-400'}>Master these patterns to calculate instantly.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tricks.map((trick, idx) => (
                        <div key={idx} className={`${isKid ? 'bg-white border border-sky-100 shadow-lg' : 'glass border-white/5'} rounded-3xl p-6 md:p-8 relative overflow-hidden group`}>
                            {!isKid && <div className="absolute top-0 right-0 p-20 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors" />}
                            
                            <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${isKid ? 'text-sky-600' : 'text-indigo-300'}`}>
                                <Zap className="w-5 h-5 fill-current" />
                                {trick.title}
                            </h3>
                            
                            <div className={`text-sm font-mono mb-6 p-3 rounded-lg border ${isKid ? 'bg-sky-50 border-sky-100 text-sky-800' : 'bg-slate-950/50 border-white/10 text-emerald-400'}`}>
                                Example: {trick.example}
                            </div>

                            <ol className="space-y-3 relative z-10">
                                {trick.steps.map((step, sIdx) => (
                                    <li key={sIdx} className={`flex gap-3 text-sm leading-relaxed ${isKid ? 'text-slate-600' : 'text-slate-300'}`}>
                                        <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${isKid ? 'bg-sky-100 text-sky-600' : 'bg-white/10 text-white'}`}>{sIdx + 1}</span>
                                        {step}
                                    </li>
                                ))}
                            </ol>

                            {trick.formula && !isKid && (
                                <div className="mt-6 pt-6 border-t border-white/5">
                                    <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Generalized Formula</p>
                                    <p className="font-mono text-slate-400 text-sm">{trick.formula}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
             </div>
        )}

        {/* AI TUTOR TAB */}
        {activeTab === 'ai-tutor' && (
            <div className={`h-[calc(100vh-160px)] flex flex-col ${isKid ? 'bg-white border-4 border-sky-100' : 'glass ring-1 ring-white/10'} rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500`}>
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {chatHistory.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl p-5 shadow-lg backdrop-blur-sm ${
                                msg.role === 'user' 
                                ? (isKid ? 'bg-sky-500 text-white rounded-br-sm' : 'bg-indigo-600 text-white rounded-br-sm')
                                : (isKid ? 'bg-sky-50 text-slate-700 rounded-bl-sm border border-sky-100' : 'bg-slate-800/80 text-slate-200 rounded-bl-sm border border-white/5')
                            }`}>
                                {msg.role === 'ai' ? (
                                    <div className="prose prose-invert prose-sm max-w-none">
                                        <ReactMarkdown 
                                            components={{
                                                p: ({node, ...props}) => <p className={`mb-2 ${isKid ? 'text-slate-700' : 'text-slate-300'}`} {...props} />,
                                                strong: ({node, ...props}) => <strong className={isKid ? 'text-sky-700 font-black' : 'text-white font-bold'} {...props} />,
                                                ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                                                ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                                                li: ({node, ...props}) => <li className={isKid ? 'text-slate-700' : 'text-slate-300'} {...props} />,
                                                code: ({node, ...props}) => <code className={`px-1 py-0.5 rounded font-mono text-sm ${isKid ? 'bg-sky-100 text-sky-800' : 'bg-black/30 text-emerald-300'}`} {...props} />,
                                            }}
                                        >
                                            {msg.content}
                                        </ReactMarkdown>
                                    </div>
                                ) : (
                                    <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                                )}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                             <div className={`${isKid ? 'bg-sky-50 border-sky-100' : 'bg-slate-800/80 border-white/5'} rounded-2xl p-4 rounded-bl-sm flex items-center gap-2 border`}>
                                <div className={`w-2 h-2 rounded-full animate-bounce ${isKid ? 'bg-sky-400' : 'bg-indigo-400'}`} />
                                <div className={`w-2 h-2 rounded-full animate-bounce [animation-delay:-.3s] ${isKid ? 'bg-sky-400' : 'bg-indigo-400'}`} />
                                <div className={`w-2 h-2 rounded-full animate-bounce [animation-delay:-.5s] ${isKid ? 'bg-sky-400' : 'bg-indigo-400'}`} />
                             </div>
                        </div>
                    )}
                </div>

                <div className={`p-4 ${isKid ? 'bg-sky-50 border-t border-sky-100' : 'bg-slate-900/50 border-t border-white/5'}`}>
                    <div className="relative flex items-center gap-2">
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={isKid ? "Ask for a hint..." : "Ask me anything about mental math..."}
                            className={`w-full rounded-2xl pl-5 pr-14 py-4 focus:outline-none transition-all ${isKid ? 'bg-white border-2 border-sky-100 focus:border-sky-300 text-slate-700 placeholder-sky-200' : 'bg-slate-800/50 border border-white/10 text-white placeholder-slate-500 focus:bg-slate-800 focus:border-indigo-500'}`}
                        />
                        <button 
                            onClick={handleSend}
                            disabled={!prompt.trim() || loading}
                            className={`absolute right-2 p-2 rounded-xl transition-all shadow-lg disabled:opacity-50 ${isKid ? 'bg-sky-400 hover:bg-sky-500 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white disabled:hover:bg-indigo-600'}`}
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Study;