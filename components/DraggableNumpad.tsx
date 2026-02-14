import React, { useState, useEffect, useRef } from 'react';
import { Delete, Check, GripHorizontal } from 'lucide-react';

interface DraggableNumpadProps {
  onInput: (digit: string) => void;
  onEnter: () => void;
  onDelete: () => void;
  isKid: boolean;
}

const DraggableNumpad: React.FC<DraggableNumpadProps> = ({ onInput, onEnter, onDelete, isKid }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const numpadRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize position to center bottom
  useEffect(() => {
    // Wait for mount to get window dimensions
    const width = Math.min(300, window.innerWidth - 40);
    const x = (window.innerWidth - width) / 2;
    const y = window.innerHeight - 400; // Positioned near bottom
    setPosition({ 
        x: Math.max(20, x), 
        y: Math.max(20, y) 
    });
    setIsInitialized(true);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    if (numpadRef.current) {
        const rect = numpadRef.current.getBoundingClientRect();
        dragStartRef.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const newX = e.clientX - dragStartRef.current.x;
    const newY = e.clientY - dragStartRef.current.y;
    
    // Simple boundary clamping
    const maxX = window.innerWidth - (numpadRef.current?.offsetWidth || 300);
    const maxY = window.innerHeight - (numpadRef.current?.offsetHeight || 300);
    
    setPosition({ 
        x: Math.max(0, Math.min(newX, maxX)), 
        y: Math.max(0, Math.min(newY, maxY)) 
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  if (!isInitialized) return null;

  // Styles
  const baseClass = isKid 
    ? "fixed z-50 w-[280px] sm:w-[320px] bg-white/95 backdrop-blur-xl border-4 border-sky-200 shadow-[0_10px_40px_rgba(14,165,233,0.3)] rounded-[32px] overflow-hidden select-none touch-none"
    : "fixed z-50 w-[280px] sm:w-[320px] glass border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden select-none touch-none";
    
  const btnBase = "flex items-center justify-center text-2xl font-bold transition-all active:scale-90 h-16 rounded-xl select-none outline-none touch-manipulation";
  
  const numBtnClass = isKid
    ? `${btnBase} bg-white text-sky-600 border-2 border-sky-100 shadow-[0_4px_0_#e0f2fe] active:shadow-none active:translate-y-1 hover:bg-sky-50`
    : `${btnBase} bg-white/5 text-white hover:bg-white/10 border border-white/5 active:bg-white/20`;
    
  const actionBtnClass = isKid
    ? `${btnBase} bg-green-400 text-white shadow-[0_4px_0_#15803d] active:shadow-none active:translate-y-1 hover:bg-green-500`
    : `${btnBase} bg-indigo-600 text-white hover:bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)] active:bg-indigo-700`;
    
  const delBtnClass = isKid
    ? `${btnBase} bg-red-400 text-white shadow-[0_4px_0_#b91c1c] active:shadow-none active:translate-y-1 hover:bg-red-500`
    : `${btnBase} bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 active:bg-red-500/40`;

  const headerClass = isKid
    ? "h-10 bg-sky-100 flex items-center justify-center cursor-grab active:cursor-grabbing border-b border-sky-200"
    : "h-8 bg-white/5 flex items-center justify-center cursor-grab active:cursor-grabbing border-b border-white/5";

  return (
    <div 
        ref={numpadRef}
        className={baseClass}
        style={{ left: position.x, top: position.y }}
    >
        {/* Drag Handle */}
        <div 
            className={headerClass}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
        >
            <GripHorizontal className={`w-12 h-6 ${isKid ? 'text-sky-300' : 'text-slate-500'}`} />
        </div>

        <div className={`p-4 grid grid-cols-3 gap-3 ${isKid ? 'bg-sky-50/50' : 'bg-transparent'}`}>
            {[7, 8, 9, 4, 5, 6, 1, 2, 3].map(num => (
                <button 
                    key={num} 
                    className={numBtnClass}
                    onClick={() => onInput(num.toString())}
                >
                    {num}
                </button>
            ))}
            
            <button className={delBtnClass} onClick={onDelete}>
                <Delete className="w-6 h-6" />
            </button>
            
            <button className={numBtnClass} onClick={() => onInput('0')}>
                0
            </button>
            
            <button className={actionBtnClass} onClick={onEnter}>
                <Check className="w-8 h-8" />
            </button>
        </div>
    </div>
  );
};

export default DraggableNumpad;