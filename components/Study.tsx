import React, { useState } from 'react';
import { GameSettings } from '../types';
import { getGeneralStudyAdvice } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface StudyProps {
  settings: GameSettings;
  onBack: () => void;
}

const Study: React.FC<StudyProps> = ({ settings, onBack }) => {
  const [activeTab, setActiveTab] = useState<'reference' | 'chat'>('reference');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', content: string}[]>([
      {role: 'ai', content: "Hi! I'm your Math Tutor. Ask me how to square numbers ending in 5, or for a multiplication trick!"}
  ]);
  
  const isKid = settings.kidMode;
  const pageBg = isKid ? "bg-[#fef7ff]" : "bg-[#121212]";
  const textMain = isKid ? "text-[#1d1b20]" : "text-[#e3e3e3]";
  const surface = isKid ? "bg-[#f3edf7]" : "bg-[#1e1e1e]";
  const primaryContainer = isKid ? "bg-[#e8def8] text-[#1d1b20]" : "bg-[#4f378b] text-[#eaddff]";

  const squares = Array.from({length: 100}, (_, i) => ({ base: i + 1, sq: (i + 1) ** 2 }));

  const handleSend = async () => {
      if (!prompt.trim()) return;
      const msg = prompt;
      setPrompt('');
      setChatHistory(p => [...p, {role: 'user', content: msg}]);
      setLoading(true);
      const res = await getGeneralStudyAdvice(msg);
      setChatHistory(p => [...p, {role: 'ai', content: res}]);
      setLoading(false);
  };

  return (
    <div className={`min-h-screen flex flex-col ${pageBg} ${textMain}`}>
        {/* Header */}
        <div className={`p-4 flex items-center gap-4 ${surface}`}>
            <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10">
                <span className="material-symbol">arrow_back</span>
            </button>
            <h1 className="text-xl font-bold">Study Center</h1>
        </div>

        {/* Tabs */}
        <div className="px-4 pb-2">
            <div className={`flex rounded-full p-1 border ${isKid ? 'border-[#79747e]' : 'border-[#938f99]'}`}>
                <button 
                    onClick={() => setActiveTab('reference')}
                    className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'reference' ? (isKid ? 'bg-[#6750a4] text-white' : 'bg-[#d0bcff] text-[#381e72]') : ''}`}
                >
                    Reference
                </button>
                <button 
                    onClick={() => setActiveTab('chat')}
                    className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'chat' ? (isKid ? 'bg-[#6750a4] text-white' : 'bg-[#d0bcff] text-[#381e72]') : ''}`}
                >
                    AI Tutor
                </button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'reference' ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {squares.map(s => (
                        <div key={s.base} className={`p-4 rounded-2xl flex flex-col items-center justify-center ${primaryContainer}`}>
                            <span className="text-xs opacity-70 mb-1">{s.base}²</span>
                            <span className="text-lg font-bold">{s.sq}</span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {chatHistory.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-[20px] px-5 py-3 ${
                                msg.role === 'user' 
                                ? (isKid ? 'bg-[#6750a4] text-white rounded-br-sm' : 'bg-[#d0bcff] text-[#381e72] rounded-br-sm')
                                : (isKid ? 'bg-[#f3edf7] text-[#1d1b20] rounded-bl-sm' : 'bg-[#333537] text-[#e3e3e3] rounded-bl-sm')
                            }`}>
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className={`px-5 py-3 rounded-[20px] rounded-bl-sm ${isKid ? 'bg-[#f3edf7]' : 'bg-[#333537]'}`}>...</div>
                        </div>
                    )}
                </div>
            )}
        </div>

        {activeTab === 'chat' && (
            <div className={`p-4 ${surface}`}>
                <div className={`flex items-center gap-2 rounded-full px-4 py-2 ${isKid ? 'bg-[#e8def8]' : 'bg-[#333537]'}`}>
                    <input 
                        className="flex-1 bg-transparent border-none focus:ring-0 outline-none h-10"
                        placeholder="Ask a question..."
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                    />
                    <button 
                        onClick={handleSend}
                        disabled={!prompt.trim() || loading} 
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${isKid ? 'bg-[#6750a4] text-white' : 'bg-[#d0bcff] text-[#381e72]'}`}
                    >
                        <span className="material-symbol text-lg">send</span>
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};

export default Study;