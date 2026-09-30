import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  RotateCcw,
  Bookmark,
  XCircle,
  ArrowRight,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useQuiz } from '../hooks/useQuiz';
import QuizCard from '../components/QuizCard';
import { QUICK_PREP_TOPICS } from '../utils/topics';
import { saveBookmarkToDb } from '../utils/api';

export default function QuizArena({ onNavigateToBookmarks, initialTopic, onClearInitialTopic }) {
  const {
    topic,
    setTopic,
    questionCount,
    setQuestionCount,
    questions,
    currentIndex,
    loading,
    isFinished,
    error,
    startQuiz,
    resetQuiz,
    handleSelectAnswer,
    handleNext,
    wrongAnswers,
    calculateCurrentStats
  } = useQuiz();

  const [hasStarted, setHasStarted] = useState(() => Boolean(initialTopic));
  const [showWrongReview, setShowWrongReview] = useState(false);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState('');

  const isQuizActive = hasStarted || Boolean(initialTopic);
  const currentStats = calculateCurrentStats();

  useEffect(() => {
    if (initialTopic) {
      startQuiz(initialTopic, questionCount);
    }
  }, [initialTopic]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleReset = () => {
    resetQuiz();
    setHasStarted(false);
    setShowWrongReview(false);
    if (onClearInitialTopic) {
      onClearInitialTopic();
    }
  };

  useEffect(() => {
    if (isFinished && currentStats.percentage >= 80) {
      // Trigger gold & violet celebratory confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#7c3aed', '#f59e0b', '#ec4899', '#ffffff']
      });
    }
  }, [isFinished, currentStats.percentage]);

  const handleStart = () => {
    setHasStarted(true);
    setShowWrongReview(false);
    startQuiz(topic, questionCount);
  };

  const handleBookmarkQuestion = (questionData) => {
    try {
      const saved = JSON.parse(localStorage.getItem('sukhman_saved_articles') || '[]');
      const newEntry = {
        id: Date.now(),
        type: 'question',
        category: 'Quiz Question',
        headline: questionData.q.slice(0, 90) + '...',
        summary: questionData.explanation,
        relevance: `Topic: ${topic} • Answer: Option ${String.fromCharCode(65 + questionData.correct)}`,
        date: new Date().toLocaleDateString()
      };
      localStorage.setItem('sukhman_saved_articles', JSON.stringify([newEntry, ...saved]));
      saveBookmarkToDb({
        item_type: 'article',
        title: newEntry.headline,
        content: newEntry,
        topic
      });
      setSavedSuccessMsg('Saved question to Bookmarks! 🔖');
      setTimeout(() => setSavedSuccessMsg(''), 3000);
    } catch (e) {
      console.warn("Bookmark error:", e);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="pb-12"
    >
      {/* Quiz Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              Exam Drill Simulator
            </span>
            <span className="text-xs text-slate-400">CLAT 2027 Pattern</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight">
            Quiz Arena ⚡
          </h1>
        </div>

        {isQuizActive && !isFinished && !loading && questions.length > 0 && (
          <div className="flex items-center gap-4 bg-[#110e2f]/80 px-4 py-2 rounded-xl border border-electric-violet/30">
            <div className="text-xs text-slate-400">
              Score: <span className="text-gold-400 font-bold">{currentStats.clatScore} pts</span>
            </div>
            <div className="text-xs text-slate-400">
              Accuracy: <span className="text-emerald-400 font-bold">{currentStats.percentage}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Configuration View Before Quiz Starts */}
      {!isQuizActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto glass-panel rounded-3xl p-6 sm:p-10 border border-electric-violet/30 shadow-2xl bg-[#0d0d2b]/85 text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/10">
            ⚡
          </div>

          <h2 className="text-2xl font-bold font-heading text-white mb-2">
            Configure Your CLAT Drill
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mb-8 max-w-md mx-auto">
            Generate customized, passage & inference-based MCQs crafted specifically for Sukhman's journey to NLS Bangalore.
          </p>

          <div className="space-y-6 text-left max-w-lg mx-auto">
            {/* Topic Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Drill Topic
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Constitutional Law, Law of Torts, Logical Reasoning"
                className="w-full px-4 py-3 rounded-xl glass-input border border-electric-violet/30 text-white text-sm"
              />

              {/* Quick Topic Chips */}
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {QUICK_PREP_TOPICS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTopic(t)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      topic.toLowerCase() === t.toLowerCase()
                        ? 'bg-amber-500/30 text-amber-200 border border-amber-500/60 font-semibold'
                        : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Count Selector (Slider 10-50, default 20) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Number of Questions
                </label>
                <span className="text-sm font-bold font-heading gold-gradient-text px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                  {questionCount} Questions
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                step="5"
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full h-2 bg-navy-800 rounded-lg appearance-none cursor-pointer accent-gold-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>10 (Quick Sprint)</span>
                <span>20 (Recommended)</span>
                <span>50 (Full Mock)</span>
              </div>
            </div>

            {/* Generate Quiz Button */}
            <button
              type="button"
              onClick={handleStart}
              className="w-full btn-gradient-shimmer py-4 px-6 text-white font-bold text-sm tracking-wide shadow-xl flex items-center justify-center gap-2 mt-4 touch-manipulation cursor-pointer"
            >
              <span>Generate Quiz</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Loading Animation State */}
      {isQuizActive && loading && (
        <div className="min-h-[350px] flex flex-col items-center justify-center text-center p-8">
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-full border-4 border-electric-violet/30 border-t-gold-400 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center text-2xl">
              ⚡
            </div>
          </div>
          <h3 className="text-xl font-bold font-heading text-white mb-2">
            Counsel is crafting your quiz... ⚡
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm">
            Applying CLAT 2027 negative-marking difficulty, tricky statutory principles, and inference traps.
          </p>
        </div>
      )}

      {/* Fallback if questions empty or error occurred */}
      {isQuizActive && !loading && !isFinished && questions.length === 0 && (
        <div className="max-w-md mx-auto text-center p-8 glass-panel rounded-3xl border border-amber-500/30 bg-[#0d0d2b]/85 mt-6">
          <div className="text-3xl mb-3">⚡</div>
          <h3 className="text-lg font-bold text-white mb-2">Quiz Setup Notice</h3>
          <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
            {error || "Could not retrieve questions right now. Tap below to generate your CLAT mock set."}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              type="button"
              onClick={() => startQuiz(topic, questionCount)}
              className="btn-gradient-shimmer px-5 py-2.5 text-xs font-semibold text-white shadow-lg"
            >
              Generate Now
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs text-slate-300 hover:text-white transition-all"
            >
              Change Topic
            </button>
          </div>
        </div>
      )}

      {/* Active Quiz In Progress */}
      {isQuizActive && !loading && !isFinished && questions.length > 0 && (
        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="w-full max-w-3xl mx-auto">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-medium">
              <span>Question {currentIndex + 1} of {questions.length}</span>
              <span>{Math.round(((currentIndex) / questions.length) * 100)}% Completed</span>
            </div>
            <div className="w-full h-2 rounded-full bg-navy-800 overflow-hidden border border-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                transition={{ duration: 0.3 }}
                className="h-full bg-gradient-to-r from-electric-violet to-gold-500 rounded-full"
              />
            </div>
          </div>

          {savedSuccessMsg && (
            <div className="max-w-md mx-auto text-center p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold">
              {savedSuccessMsg}
            </div>
          )}

          {/* Render Question Card */}
          <QuizCard
            questionData={questions[currentIndex]}
            currentIndex={currentIndex}
            totalQuestions={questions.length}
            onSelectAnswer={handleSelectAnswer}
            onNext={handleNext}
            onBookmark={handleBookmarkQuestion}
          />
        </div>
      )}

      {/* End Screen Results */}
      {isFinished && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto glass-panel rounded-3xl p-8 sm:p-10 border border-electric-violet/40 shadow-2xl bg-[#0d0d2b]/90 text-center"
        >
          {/* Badge Display */}
          <div className="inline-block px-4 py-1.5 rounded-full text-sm font-bold bg-amber-500/20 text-amber-300 border border-amber-500/50 mb-4 shadow-lg shadow-amber-500/10">
            {currentStats.badge}
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-white mb-2">
            Drill Complete, Sukhman!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mb-8">
            Topic: <span className="text-electric-light font-semibold">{topic}</span>
          </p>

          {/* Gold Score Display */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="p-4 rounded-2xl bg-[#141038] border border-white/10">
              <span className="text-xs text-slate-400 font-medium block mb-1">CLAT Net Score</span>
              <span className="text-2xl sm:text-3xl font-bold font-heading gold-gradient-text">
                {currentStats.clatScore}
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">+1 / -0.25</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#141038] border border-white/10">
              <span className="text-xs text-slate-400 font-medium block mb-1">Accuracy</span>
              <span className="text-2xl sm:text-3xl font-bold font-heading text-emerald-400">
                {currentStats.percentage}%
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">
                {currentStats.correct} / {questions.length} Correct
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#141038] border border-white/10">
              <span className="text-xs text-slate-400 font-medium block mb-1">Incorrect</span>
              <span className="text-2xl sm:text-3xl font-bold font-heading text-rose-400">
                {currentStats.wrong}
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">Saved for review</span>
            </div>
          </div>

          {/* Action Buttons: Review Wrong Answers + Save to Bookmarks + Try Another Topic */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {wrongAnswers.length > 0 && (
              <button
                onClick={() => setShowWrongReview(!showWrongReview)}
                className="px-5 py-3 rounded-xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-200 text-xs font-semibold transition-all flex items-center gap-2"
              >
                <XCircle className="w-4 h-4 text-rose-400" />
                <span>{showWrongReview ? 'Hide Wrong Answers' : `Review ${wrongAnswers.length} Wrong Answers`}</span>
              </button>
            )}

            <button
              onClick={() => onNavigateToBookmarks && onNavigateToBookmarks()}
              className="px-5 py-3 rounded-xl border border-gold-500/40 bg-gold-500/10 hover:bg-gold-500/20 text-gold-300 text-xs font-semibold transition-all flex items-center gap-2"
            >
              <Bookmark className="w-4 h-4 text-gold-400" />
              <span>Go to Bookmarks</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="btn-gradient-shimmer px-6 py-3 text-white text-xs font-semibold flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Try Another Topic</span>
            </button>
          </div>

          {/* Wrong Answers Accordion Review */}
          {showWrongReview && wrongAnswers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-8 text-left space-y-4 border-t border-white/10 pt-6"
            >
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-rose-400" />
                Incorrect Questions Breakdown:
              </h3>
              {wrongAnswers.map((w, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#130f32] border border-rose-500/30 text-xs space-y-2">
                  <p className="font-medium text-white">{w.question}</p>
                  <div className="flex items-center gap-2 text-rose-300">
                    <span className="font-bold">Your selection:</span>
                    <span>{w.options[w.selected]}</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-300">
                    <span className="font-bold">Correct answer:</span>
                    <span>{w.options[w.correct]}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-navy-950/60 border border-white/5 text-slate-300 text-[11px] leading-relaxed">
                    <span className="font-semibold text-gold-400">Counsel's Note: </span>
                    {w.explanation}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
