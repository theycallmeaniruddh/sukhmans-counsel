import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Bookmark,
  XCircle,
  RotateCcw,
  Trash2,
  BookOpen,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { fetchBookmarks, deleteBookmarkFromDb } from '../utils/api';

export default function Bookmarks({ onReattemptTopic }) {
  const [activeTab, setActiveTab] = useState('articles'); // 'articles' or 'wrong_answers'
  const [savedArticles, setSavedArticles] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sukhman_saved_articles') || '[]');
    } catch {
      return [];
    }
  });
  const [wrongAnswers, setWrongAnswers] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sukhman_wrong_answers') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    let ignore = false;
    fetchBookmarks()
      .then(remote => {
        if (!ignore && remote?.bookmarks && remote.bookmarks.length > 0) {
          const remoteArticles = [];
          const remoteWrong = [];
          remote.bookmarks.forEach(b => {
            try {
              const parsed = typeof b.content === 'string' ? JSON.parse(b.content) : b.content;
              if (b.item_type === 'article') {
                remoteArticles.push({ ...parsed, dbId: b.id });
              } else if (b.item_type === 'wrong_answer') {
                remoteWrong.push({ ...parsed, dbId: b.id });
              }
            } catch {
              // fallback
            }
          });

          if (remoteArticles.length > 0) {
            setSavedArticles(prev => {
              if (prev.length === 0) {
                localStorage.setItem('sukhman_saved_articles', JSON.stringify(remoteArticles));
                return remoteArticles;
              }
              return prev;
            });
          }

          if (remoteWrong.length > 0) {
            setWrongAnswers(prev => {
              if (prev.length === 0) {
                localStorage.setItem('sukhman_wrong_answers', JSON.stringify(remoteWrong));
                return remoteWrong;
              }
              return prev;
            });
          }
        }
      })
      .catch(e => {
        console.warn("Remote bookmark sync error:", e);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const removeArticle = (id) => {
    const item = savedArticles.find(a => a.id === id);
    if (item && item.dbId) {
      deleteBookmarkFromDb(item.dbId);
    }
    const updated = savedArticles.filter(a => a.id !== id);
    setSavedArticles(updated);
    localStorage.setItem('sukhman_saved_articles', JSON.stringify(updated));
  };

  const removeWrongAnswer = (id) => {
    const item = wrongAnswers.find(w => w.id === id);
    if (item && item.dbId) {
      deleteBookmarkFromDb(item.dbId);
    }
    const updated = wrongAnswers.filter(w => w.id !== id);
    setWrongAnswers(updated);
    localStorage.setItem('sukhman_wrong_answers', JSON.stringify(updated));
  };

  const clearAllWrong = () => {
    setWrongAnswers([]);
    localStorage.removeItem('sukhman_wrong_answers');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="pb-16 space-y-6"
    >
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gold-500/20 text-gold-300 border border-gold-500/30">
            Personal Repository
          </span>
          <span className="text-xs text-slate-400">Target: CLAT 2027</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight">
          Sukhman's Bookmarks & Error Log 🔖
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Review saved legal affairs, landmark doctrines, and dissect every incorrect mock attempt to eliminate negative marking.
        </p>
      </div>

      {/* Two Tabs Selector */}
      <div className="flex items-center gap-3 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveTab('articles')}
          className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'articles'
              ? 'bg-electric-violet/30 text-white border border-electric-violet shadow-lg shadow-electric-violet/20 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Saved Articles & Cases ({savedArticles.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('wrong_answers')}
          className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'wrong_answers'
              ? 'bg-rose-500/30 text-rose-200 border border-rose-500 shadow-lg shadow-rose-500/20 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <XCircle className="w-4 h-4 text-rose-400" />
          <span>Wrong Answers Review ({wrongAnswers.length})</span>
        </button>
      </div>

      {/* Tab 1: Saved Articles */}
      {activeTab === 'articles' && (
        <div className="space-y-4">
          {savedArticles.length === 0 ? (
            <div className="glass-panel rounded-2xl p-12 text-center border border-white/10 bg-[#0d0d2b]/60">
              <Bookmark className="w-12 h-12 mx-auto mb-3 text-slate-500 opacity-60" />
              <h3 className="text-base font-bold text-slate-200 mb-1">
                No Bookmarked Articles Yet
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Visit the Current Affairs Digest or Quiz Arena and click the bookmark icon to save key legal updates for revision.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedArticles.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  className="glass-panel rounded-2xl p-5 border border-white/10 bg-[#0d0d2b]/80 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-violet-500/20 text-purple-200 border border-violet-500/40">
                        {item.category || 'Article'}
                      </span>
                      <button
                        onClick={() => removeArticle(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 className="text-sm font-bold text-white mb-2 leading-snug">
                      {item.headline}
                    </h4>
                    <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                      {item.summary}
                    </p>
                  </div>

                  {item.relevance && (
                    <div className="p-2.5 rounded-xl bg-[#141238] border border-electric-violet/30 text-[11px] text-purple-200">
                      <span className="font-semibold text-gold-400">CLAT Relevance: </span>
                      {item.relevance}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Wrong Answers */}
      {activeTab === 'wrong_answers' && (
        <div className="space-y-4">
          {wrongAnswers.length > 0 && (
            <div className="flex justify-end">
              <button
                onClick={clearAllWrong}
                className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All Mistakes</span>
              </button>
            </div>
          )}

          {wrongAnswers.length === 0 ? (
            <div className="glass-panel rounded-2xl p-12 text-center border border-white/10 bg-[#0d0d2b]/60">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-400 opacity-80" />
              <h3 className="text-base font-bold text-slate-200 mb-1">
                Zero Mistakes Recorded! 👑
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Any questions you miss during Quiz Arena will automatically land here with Counsel's breakdown and a one-click re-attempt button.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {wrongAnswers.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  className="glass-panel rounded-2xl p-5 border border-rose-500/30 bg-[#120c22]/85 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px] font-bold">
                        {item.topic || 'CLAT Legal Reasoning'}
                      </span>
                      {item.date && (
                        <span className="text-[10px] text-slate-500">{item.date}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onReattemptTopic && onReattemptTopic(item.topic)}
                        className="px-3 py-1 rounded-lg bg-gold-500/20 hover:bg-gold-500/30 text-gold-300 border border-gold-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Re-attempt Topic</span>
                      </button>

                      <button
                        onClick={() => removeWrongAnswer(item.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm font-medium text-white whitespace-pre-line leading-relaxed">
                    {item.question}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {item.selected !== undefined && item.options && (
                      <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200">
                        <span className="font-bold block mb-0.5">Your Choice:</span>
                        <span>{item.options[item.selected]}</span>
                      </div>
                    )}
                    {item.correct !== undefined && item.options && (
                      <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200">
                        <span className="font-bold block mb-0.5">Correct Answer:</span>
                        <span>{item.options[item.correct]}</span>
                      </div>
                    )}
                  </div>

                  {item.explanation && (
                    <div className="p-3 rounded-xl bg-navy-950/80 border border-white/5 text-slate-300 text-xs leading-relaxed">
                      <div className="flex items-center gap-1 text-gold-400 font-semibold mb-1">
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Counsel's Analysis:</span>
                      </div>
                      <p>{item.explanation}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
