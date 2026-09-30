import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Bookmark,
  RefreshCw,
  Scale,
  Globe,
  TrendingUp,
  Building,
  Sparkles
} from 'lucide-react';
import { fetchCurrentAffairs, saveBookmarkToDb } from '../utils/api';

export default function CurrentAffairs({ onNavigateToBookmarks }) {
  const [digest, setDigest] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookmarkedIds, setBookmarkedIds] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('sukhman_saved_articles') || '[]');
      return saved.map(item => item.id);
    } catch {
      return [];
    }
  });
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const loadDigest = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCurrentAffairs();
      if (data && data.digest) {
        setDigest(data.digest);
      }
    } catch (err) {
      console.error("Failed to load current affairs:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    fetchCurrentAffairs()
      .then(data => {
        if (!ignore && data?.digest) {
          setDigest(data.digest);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error("Failed to load current affairs:", err);
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handleBookmark = (item) => {
    try {
      const saved = JSON.parse(localStorage.getItem('sukhman_saved_articles') || '[]');
      const isAlreadyBookmarked = bookmarkedIds.includes(item.id);

      if (isAlreadyBookmarked) {
        const filtered = saved.filter(s => s.id !== item.id);
        localStorage.setItem('sukhman_saved_articles', JSON.stringify(filtered));
        setBookmarkedIds(bookmarkedIds.filter(id => id !== item.id));
        setFeedbackMsg('Removed from bookmarks');
      } else {
        const updated = [item, ...saved];
        localStorage.setItem('sukhman_saved_articles', JSON.stringify(updated));
        setBookmarkedIds([...bookmarkedIds, item.id]);
        saveBookmarkToDb({
          item_type: 'article',
          title: item.headline,
          content: item,
          topic: item.category || 'Current Affairs'
        });
        setFeedbackMsg('Saved article to Bookmarks! 🔖');
      }
      setTimeout(() => setFeedbackMsg(''), 2500);
    } catch (e) {
      console.warn("Bookmark toggle error:", e);
    }
  };

  const getCategoryBadge = (category) => {
    switch (category?.toLowerCase()) {
      case 'legal':
        return {
          bg: 'bg-violet-500/20 text-purple-300 border-violet-500/40',
          icon: Scale
        };
      case 'national':
        return {
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          icon: Building
        };
      case 'international':
        return {
          bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          icon: Globe
        };
      case 'economy':
        return {
          bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          icon: TrendingUp
        };
      default:
        return {
          bg: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
          icon: Sparkles
        };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="pb-16 space-y-6"
    >
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-500/20 text-purple-200 border border-violet-500/30">
              High-Yield GK & Legal Digest
            </span>
            <span className="text-xs text-gold-400 font-semibold">
              CLAT 2027 Syllabus (2025–2026 Focus)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight">
            Current Affairs Digest 📰
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Supreme Court judgments, constitutional reforms, treaties, and socio-legal milestones curated for Sukhman.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadDigest}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl glass-panel text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-2 border border-white/10 hover:border-electric-violet/50 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-gold-400' : ''}`} />
            <span>Refresh Digest</span>
          </button>

          <button
            onClick={onNavigateToBookmarks}
            className="px-4 py-2.5 rounded-xl bg-gold-500/15 hover:bg-gold-500/25 border border-gold-500/30 text-gold-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>View Saved ({bookmarkedIds.length})</span>
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold text-center transition-all">
          {feedbackMsg}
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="glass-panel rounded-2xl p-6 border border-white/10 bg-[#0d0d2b]/60 animate-pulse space-y-3"
            >
              <div className="w-24 h-4 bg-white/10 rounded-full" />
              <div className="w-3/4 h-5 bg-white/10 rounded" />
              <div className="w-full h-12 bg-white/5 rounded" />
              <div className="w-1/2 h-4 bg-white/10 rounded" />
            </div>
          ))}
        </div>
      ) : (
        /* Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {digest.map((item, idx) => {
            const badge = getCategoryBadge(item.category);
            const BadgeIcon = badge.icon;
            const isBookmarked = bookmarkedIds.includes(item.id);

            return (
              <motion.div
                key={item.id || idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="glass-panel glass-panel-glow rounded-2xl p-6 border border-white/10 bg-[#0d0d2b]/80 flex flex-col justify-between hover:border-electric-violet/40 transition-all"
              >
                <div>
                  {/* Top Category Badge & Bookmark */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${badge.bg}`}>
                      <BadgeIcon className="w-3 h-3" />
                      <span>{item.category}</span>
                    </span>

                    <button
                      onClick={() => handleBookmark(item)}
                      title={isBookmarked ? "Remove Bookmark" : "Save Article"}
                      className={`p-2 rounded-xl transition-all ${
                        isBookmarked
                          ? 'bg-gold-500/20 text-gold-400 border border-gold-500/40'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-gold-400' : ''}`} />
                    </button>
                  </div>

                  {/* Headline */}
                  <h3 className="text-base sm:text-lg font-bold font-heading text-white mb-2.5 leading-snug">
                    {item.headline}
                  </h3>

                  {/* Summary */}
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                    {item.summary}
                  </p>
                </div>

                {/* CLAT 2027 Relevance Box */}
                <div className="pt-3.5 border-t border-white/10 mt-2">
                  <div className="p-3 rounded-xl bg-[#141235]/90 border border-electric-violet/30">
                    <span className="text-[10px] font-bold text-gold-400 uppercase tracking-wider block mb-1">
                      ⚖️ CLAT 2027 Relevance:
                    </span>
                    <p className="text-xs text-purple-200/90 font-medium leading-relaxed">
                      {item.relevance}
                    </p>
                  </div>

                  {item.date && (
                    <span className="text-[10px] text-slate-500 block mt-2 text-right">
                      {item.date}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
