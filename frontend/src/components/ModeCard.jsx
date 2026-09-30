import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function ModeCard({ title, subtitle, icon: Icon, theme = 'violet', onClick, tag }) {
  const themeStyles = {
    violet: {
      border: 'border-electric-violet/40 hover:border-electric-violet',
      glow: 'hover:shadow-[0_0_28px_rgba(124,58,237,0.45)]',
      gradient: 'from-violet-900/30 via-[#130f33]/60 to-[#07071a]/90',
      tagBg: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
      btnText: 'text-violet-300 group-hover:text-white',
      accentColor: '#7c3aed'
    },
    rose: {
      border: 'border-pink-500/40 hover:border-pink-500',
      glow: 'hover:shadow-[0_0_28px_rgba(236,72,153,0.45)]',
      gradient: 'from-pink-950/30 via-[#220d24]/60 to-[#07071a]/90',
      tagBg: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
      btnText: 'text-pink-300 group-hover:text-white',
      accentColor: '#ec4899'
    },
    gold: {
      border: 'border-gold-500/40 hover:border-gold-500',
      glow: 'hover:shadow-[0_0_28px_rgba(245,158,11,0.45)]',
      gradient: 'from-amber-950/30 via-[#26170d]/60 to-[#07071a]/90',
      tagBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      btnText: 'text-amber-300 group-hover:text-white',
      accentColor: '#f59e0b'
    }
  };

  const currentTheme = themeStyles[theme] || themeStyles.violet;

  return (
    <motion.button
      type="button"
      whileHover={{ y: -5, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (onClick) onClick();
        }
      }}
      className={`group w-full text-left cursor-pointer rounded-2xl p-6 relative overflow-hidden border backdrop-blur-xl bg-gradient-to-br ${currentTheme.gradient} ${currentTheme.border} ${currentTheme.glow} transition-all duration-300 touch-manipulation select-none`}
    >
      {/* Background Subtle Accent Light */}
      <div
        className="absolute -top-12 -right-12 w-36 h-36 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none"
        style={{ backgroundColor: currentTheme.accentColor }}
      />

      <div className="relative z-10 flex flex-col justify-between h-full min-h-[160px]">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Icon className="w-6 h-6 text-white" />
            </div>
            {tag && (
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${currentTheme.tagBg}`}>
                {tag}
              </span>
            )}
          </div>

          <h3 className="text-xl font-bold font-heading text-white tracking-wide group-hover:text-gold-300 transition-colors">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
            {subtitle}
          </p>
        </div>

        <div className="mt-5 flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
          <span className={currentTheme.btnText}>Open Section</span>
          <ArrowRight className={`w-3.5 h-3.5 transform group-hover:translate-x-1.5 transition-transform ${currentTheme.btnText}`} />
        </div>
      </div>
    </motion.button>
  );
}
