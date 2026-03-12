import React, { useState, useEffect, useRef } from 'react';

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

  useEffect(() => {
    const width = Math.min(320, window.innerWidth - 32);
    const x = (window.innerWidth - width) / 2;
    const y = window.innerHeight - 450; 
    setPosition({ 
        x: Math.max(16, x), 
        y: Math.max(16, y) 
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
    const maxX = window.innerWidth - (numpadRef.current?.offsetWidth || 320);
    const maxY = window.innerHeight - (numpadRef.current?.offsetHeight || 400);
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

  // Material 3 Styling
  const containerClass = isKid 
    ? "fixed z-50 w-[300px] bg-white border-2 border-indigo-100 shadow-2xl rounded-[32px] overflow-hidden select-none touch-none"
    : "fixed z-50 w-[300px] bg-[#1e1e1e] shadow-2xl rounded-[32px] overflow-hidden select-none touch-none ring-1 ring-white/10";

  const btnBase = "w-16 h-16 rounded-full flex items-center justify-center text-2xl font-medium transition-transform active:scale-95 select-none outline-none";
  
  // Theme Colors
  const numColor = isKid ? "bg-indigo-50 text-indigo-900 hover:bg-indigo-100" : "bg-[#2d2f31] text-white hover:bg-[#3d3f41]";
  const opColor = isKid ? "bg-orange-100 text-orange-900 hover:bg-orange-200" : "bg-[#422d2d] text-[#ffb4ab] hover:bg-[#533939]";
  const enterColor = isKid ? "bg-indigo-500 text-white hover:bg-indigo-600" : "bg-[#a8c7fa] text-[#042e85] hover:bg-[#8ab4f8]";

  return (
    <div 
        ref={numpadRef}
        className={containerClass}
        style={{ left: position.x, top: position.y }}
    >
        {/* Drag Handle Area */}
        <div 
            className={`h-10 flex items-center justify-center cursor-grab active:cursor-grabbing ${isKid ? 'bg-white' : 'bg-[#1e1e1e]'}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
        >
            <div className={`w-12 h-1.5 rounded-full ${isKid ? 'bg-indigo-100' : 'bg-[#444746]'}`} />
        </div>

        <div className={`px-4 pb-6 grid grid-cols-3 gap-3 ${isKid ? 'bg-white' : 'bg-[#1e1e1e]'}`}>
            {[7, 8, 9, 4, 5, 6, 1, 2, 3].map(num => (
                <button 
                    key={num} 
                    className={`${btnBase} ${numColor}`}
                    onClick={() => onInput(num.toString())}
                >
                    {num}
                </button>
            ))}
            
            <button className={`${btnBase} ${opColor}`} onClick={onDelete}>
                <span className="material-symbol">backspace</span>
            </button>
            
            <button className={`${btnBase} ${numColor}`} onClick={() => onInput('0')}>
                0
            </button>
            
            <button className={`${btnBase} ${enterColor}`} onClick={onEnter}>
                <span className="material-symbol">check</span>
            </button>
        </div>
    </div>
  );
};

export default DraggableNumpad;