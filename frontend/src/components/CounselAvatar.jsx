import React from 'react';

export default function CounselAvatar({ size = 'md', showStatus = false }) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-14 h-14 text-2xl',
    xl: 'w-20 h-20 text-4xl'
  };

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        {/* Pulsing violet outer ring */}
        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-electric-violet to-rose-500 opacity-75 blur-[2px] animate-pulse" />
        
        {/* Core Avatar Container */}
        <div
          className={`relative ${sizeClasses[size] || sizeClasses.md} rounded-full flex items-center justify-center bg-gradient-to-br from-[#1b103c] to-[#0d0d29] border border-electric-violet/60 shadow-lg shadow-electric-violet/20`}
        >
          <span className="select-none filter drop-shadow">⚖️</span>
        </div>

        {/* Online Status Dot */}
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#07071a] rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
      </div>

      {showStatus && (
        <div className="flex flex-col">
          <span className="text-xs font-semibold tracking-wide text-white flex items-center gap-1.5">
            Counsel <span className="text-emerald-400 text-[10px]">online 🟢</span>
          </span>
          <span className="text-[10px] text-muted-400 text-slate-400">
            CLAT 2027 Mentor for Sukhman
          </span>
        </div>
      )}
    </div>
  );
}
