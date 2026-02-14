import React, { useState } from 'react';
import { AppView, GameSettings } from '../types';
import { ArrowLeft, Sparkles, Send, GraduationCap } from 'lucide-react';
import { getGeneralStudyAdvice } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface StudyProps {
  settings: GameSettings;
  onBack: () => void;
}

const Study: React.FC<StudyProps> = ({ settings, onBack }) => {
  const [activeTab, setActiveTab] = useState<'reference' | 'ai-tutor'>('reference');
  
  const squares: { base: number; sq: number }[] = [];
  for (let i = 1; i <= 50; i++) squares.push({ base: i, sq: i * i });

  const [prompt, setPrompt] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', content: string}[]>([
      {role: 'ai', content: "Hi! I'm your AI Math Tutor. Ask me for mental math tricks, how to calculate squares faster, or explain a concept!"}
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

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="glass sticky top-0 z-20 border-b-0">
        <div className="max-w-5xl mx-auto px-4 h-20 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="p-3 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-white flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-indigo-400" />
                        Study Center
                    </h1>
                </div>
            </div>
            <div className="flex bg-slate-900/50 p-1 rounded-xl ring-1 ring-white/10">
                <button 
                    onClick={() => setActiveTab('reference')}
                    className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'reference' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                >
                    Reference
                </button>
                <button 
                    onClick={() => setActiveTab('ai-tutor')}
                    className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === 'ai-tutor' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                >
                    <Sparkles className="w-3 h-3" />
                    AI Tutor
                </button>
            </div>
        </div>
      </header>

      <div className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8">
        {activeTab === 'reference' ? (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
                <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-8">Square Table (1-50)</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {squares.map((item) => (
                        <div key={item.base} className="glass-panel p-4 rounded-xl flex justify-between items-center group hover:bg-indigo-600/10 hover:border-indigo-500/30 transition-all cursor-default">
                            <span className="text-lg font-mono font-bold text-slate-500 group-hover:text-indigo-300 transition-colors">{item.base}²</span>
                            <span className="text-2xl font-bold text-white">{item.sq}</span>
                        </div>
                    ))}
                </div>
            </div>
        ) : (
            <div className="h-[calc(100vh-160px)] flex flex-col glass rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500 ring-1 ring-white/10">
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {chatHistory.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl p-5 shadow-lg backdrop-blur-sm ${
                                msg.role === 'user' 
                                ? 'bg-indigo-600 text-white rounded-br-sm' 
                                : 'bg-slate-800/80 text-slate-200 rounded-bl-sm border border-white/5'
                            }`}>
                                {msg.role === 'ai' ? (
                                    <div className="prose prose-invert prose-sm max-w-none">
                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                    </div>
                                ) : (
                                    <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                                )}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                             <div className="bg-slate-800/80 rounded-2xl p-4 rounded-bl-sm flex items-center gap-2 border border-white/5">
                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-.3s]" />
                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-.5s]" />
                             </div>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-slate-900/50 border-t border-white/5">
                    <div className="relative flex items-center gap-2">
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask me anything about mental math..."
                            className="w-full bg-slate-800/50 border border-white/10 rounded-2xl pl-5 pr-14 py-4 text-white placeholder-slate-500 focus:outline-none focus:bg-slate-800 focus:border-indigo-500 transition-all"
                        />
                        <button 
                            onClick={handleSend}
                            disabled={!prompt.trim() || loading}
                            className="absolute right-2 p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white rounded-xl transition-all shadow-lg"
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
