import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, HelpCircle, Bookmark, ArrowRight } from 'lucide-react';

export default function QuizCard({
  questionData,
  currentIndex,
  totalQuestions,
  onSelectAnswer,
  onNext,
  onBookmark
}) {
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const { q, options, correct, explanation } = questionData;

  const handleOptionClick = (idx) => {
    if (isRevealed) return;
    setSelectedIdx(idx);
    setIsRevealed(true);
    const isCorrect = idx === correct;
    onSelectAnswer(isCorrect, {
      question: q,
      options,
      selected: idx,
      correct,
      explanation
    });
  };

  const handleNextClick = () => {
    setSelectedIdx(null);
    setIsRevealed(false);
    setIsBookmarked(false);
    onNext();
  };

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    onBookmark(questionData);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.3 }}
        className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-electric-violet/30 shadow-2xl relative bg-[#0d0d2b]/90"
      >
        {/* Top Header & Bookmark */}
        <div className="flex items-center justify-between mb-4 sm:mb-5 border-b border-white/10 pb-3 sm:pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 sm:px-3 py-1 rounded-full bg-electric-violet/20 text-electric-light border border-electric-violet/40 text-[11px] sm:text-xs font-semibold">
              Question {currentIndex + 1} of {totalQuestions}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400">CLAT 2027: +1 / -0.25</span>
          </div>

          <button
            onClick={toggleBookmark}
            title={isBookmarked ? 'Bookmarked' : 'Save to Bookmarks'}
            className={`p-2 rounded-xl transition-all ${
              isBookmarked
                ? 'bg-gold-500/20 text-gold-400 border border-gold-500/40'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-gold-400' : ''}`} />
          </button>
        </div>

        {/* Question Text */}
        <div className="mb-6">
          <h3 className="text-base sm:text-lg font-medium text-slate-100 leading-relaxed whitespace-pre-line font-sans">
            {q}
          </h3>
        </div>

        {/* 4 Option Cards */}
        <div className="space-y-3">
          {options.map((option, idx) => {
            let optionStyles = 'border-white/10 hover:border-electric-violet/50 hover:bg-white/5 text-slate-200';
            let icon = null;

            if (isRevealed) {
              if (idx === correct) {
                // Correct answer (always green)
                optionStyles = 'border-emerald-500/80 bg-emerald-950/40 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.3)]';
                icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />;
              } else if (idx === selectedIdx) {
                // Wrong selection (red)
                optionStyles = 'border-rose-500/80 bg-rose-950/40 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.3)]';
                icon = <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />;
              } else {
                optionStyles = 'border-white/5 opacity-40 text-slate-400';
              }
            }

            return (
              <motion.button
                key={idx}
                whileHover={!isRevealed ? { x: 4 } : {}}
                onClick={() => handleOptionClick(idx)}
                disabled={isRevealed}
                className={`w-full text-left p-4 rounded-xl border glass-panel flex items-start justify-between gap-3 text-sm transition-all duration-200 ${optionStyles}`}
              >
                <span className="leading-relaxed flex-1">{option}</span>
                {icon}
              </motion.button>
            );
          })}
        </div>

        {/* Answer Explanation Box */}
        <AnimatePresence>
          {isRevealed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-5 border-t border-white/10"
            >
              <div className="p-4 rounded-xl bg-[#141238]/90 border border-electric-violet/40 mb-4">
                <div className="flex items-center gap-2 mb-1.5 text-xs font-bold uppercase tracking-wider text-gold-400">
                  <HelpCircle className="w-4 h-4" />
                  <span>Counsel's Legal Reasoning:</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {explanation}
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleNextClick}
                  className="btn-gradient-shimmer px-6 py-2.5 text-sm font-semibold text-white flex items-center gap-2 shadow-lg"
                >
                  <span>{currentIndex + 1 === totalQuestions ? 'Finish Quiz' : 'Next Question'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
