import React from 'react';

export default function AuroraBackground({ variant = 'default' }) {
  // Can shift slightly warmer for Chill Space if requested
  const isChill = variant === 'chill';

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Base Deep Navy-Black Layer */}
      <div className="absolute inset-0 bg-[#07071a]" />

      {/* Breathing Aurora Blob 1 - Deep Violet / Purple */}
      <div
        className={`absolute -top-1/4 -left-1/4 w-[75vw] h-[75vw] rounded-full blur-[140px] opacity-40 animate-aurora-breathe transition-colors duration-1000 ${
          isChill ? 'bg-gradient-to-tr from-rose-900 via-purple-900 to-pink-950' : 'bg-gradient-to-tr from-purple-950 via-indigo-900 to-electric-dark'
        }`}
        style={{ animationDuration: '18s' }}
      />

      {/* Breathing Aurora Blob 2 - Indigo / Dark Teal */}
      <div
        className={`absolute -bottom-1/4 -right-1/4 w-[70vw] h-[70vw] rounded-full blur-[150px] opacity-35 animate-aurora-breathe transition-colors duration-1000 ${
          isChill ? 'bg-gradient-to-bl from-pink-900 via-rose-950 to-purple-900' : 'bg-gradient-to-bl from-indigo-950 via-teal-950 to-electric-violet/40'
        }`}
        style={{ animationDuration: '24s', animationDelay: '-7s' }}
      />

      {/* Subtle Central Accent Glow */}
      <div
        className="absolute top-1/3 left-1/3 w-[45vw] h-[45vw] rounded-full blur-[120px] opacity-25 animate-pulse-slow"
        style={{
          background: isChill
            ? 'radial-gradient(circle, rgba(236,72,153,0.3) 0%, rgba(124,58,237,0.1) 70%, transparent 100%)'
            : 'radial-gradient(circle, rgba(124,58,237,0.25) 0%, rgba(245,158,11,0.08) 50%, transparent 100%)'
        }}
      />
    </div>
  );
}
