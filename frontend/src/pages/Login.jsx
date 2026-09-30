import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { KeyRound, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { getDailyQuote } from '../utils/quotes';

export default function Login({ onLoginSuccess }) {
  const [password, setPassword] = useState('Sukhman0118');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dailyQuote = getDailyQuote();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const cleanKey = password.trim();
      if (cleanKey !== 'Sukhman0118') {
        setError('Secret key does not match. (Hint: Sukhman0118)');
        setIsSubmitting(false);
        return;
      }

      const res = await onLoginSuccess(cleanKey);
      if (res === false) {
        setError('Secret key does not match. (Hint: Sukhman0118)');
      }
    } catch {
      setError('An error occurred during authentication. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative z-10 select-none">
      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* Central Glassmorphism Card */}
        <div className="glass-panel glass-panel-glow rounded-3xl p-8 sm:p-10 border border-electric-violet/30 shadow-2xl relative overflow-hidden bg-[#0d0d2b]/80 backdrop-blur-2xl">
          {/* Subtle decorative background glow */}
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-electric-violet/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-pink-500/15 rounded-full blur-3xl" />

          {/* Header */}
          <div className="text-center mb-8 relative z-10">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-[#251347] to-[#120d2f] border border-electric-violet/50 flex items-center justify-center shadow-lg shadow-electric-violet/25">
              <span className="text-3xl filter drop-shadow">⚖️</span>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl font-bold gold-gradient-text tracking-tight mb-2">
              Sukhman's Counsel
            </h1>

            <p className="text-sm font-medium text-rose-300/90 tracking-wide flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              Your path to NLS starts here
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            {/* Read-only Username */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Law Scholar
              </label>
              <div className="relative">
                <input
                  type="text"
                  value="Sukhman"
                  readOnly
                  className="w-full px-4 py-3 rounded-xl glass-input bg-[#121235]/90 border border-gold-500/30 text-gold-300 font-semibold cursor-default text-sm shadow-inner"
                />
                <ShieldCheck className="absolute right-3.5 top-3.5 w-4 h-4 text-gold-400" />
              </div>
            </div>

            {/* Secret Key Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Your Secret Key
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter secret key..."
                  className="w-full px-4 py-3 rounded-xl glass-input border border-electric-violet/30 text-white placeholder-slate-500 text-sm focus:border-electric-violet transition-all"
                  autoFocus
                />
                <KeyRound className="absolute right-3.5 top-3.5 w-4 h-4 text-electric-light opacity-80" />
              </div>
              {error && (
                <p className="text-xs text-rose-400 mt-2 font-medium">
                  {error}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-gradient-shimmer py-3.5 px-6 font-semibold text-sm text-white tracking-wide shadow-xl flex items-center justify-center gap-2 group transition-transform active:scale-[0.98]"
            >
              <span>{isSubmitting ? 'Opening Your Sanctum...' : 'Enter Your Counsel'}</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Target footer badge */}
          <div className="mt-7 text-center border-t border-white/10 pt-4">
            <span className="text-[11px] text-slate-400 font-medium">
              Target: <span className="text-gold-400 font-semibold">CLAT 2027</span> • Dec 6, 2026 • NLS Bangalore
            </span>
          </div>
        </div>

        {/* Daily Rotating Law/CLAT Motivational Quote Below Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-6 text-center max-w-sm mx-auto px-4"
        >
          <p className="text-xs italic text-slate-400 leading-relaxed font-heading">
            "{dailyQuote.quote}"
          </p>
          <span className="text-[10px] text-gold-400 font-semibold uppercase tracking-widest mt-1 block">
            — {dailyQuote.author}
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}
