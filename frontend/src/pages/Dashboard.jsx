import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Moon,
  Zap,
  Sparkles,
  Award,
  MessageSquare,
  Flame,
  CheckCircle2,
  TrendingUp,
  Tag
} from 'lucide-react';
import CountdownTimer from '../components/CountdownTimer';
import ModeCard from '../components/ModeCard';
import { getCounselDailyMessage } from '../utils/counselMessages';
import { fetchStats } from '../utils/api';

const DEFAULT_STATS = {
  chats_count: 0,
  quizzes_taken: 0,
  avg_score: 0,
  topics_covered: []
};

export default function Dashboard({ onNavigate }) {
  const [stats, setStats] = useState(DEFAULT_STATS);

  const [counterStats, setCounterStats] = useState({
    chats: 0,
    quizzes: 0,
    score: 0,
    topics: 0
  });

  const timerRef = useRef(null);

  const animateCounters = useCallback((targetStats) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const duration = 1000;
    const steps = 25;
    const intervalTime = duration / steps;
    let step = 0;

    timerRef.current = setInterval(() => {
      step++;
      const progress = step / steps;
      setCounterStats({
        chats: Math.min(targetStats.chats_count, Math.round(targetStats.chats_count * progress)),
        quizzes: Math.min(targetStats.quizzes_taken, Math.round(targetStats.quizzes_taken * progress)),
        score: Math.min(Math.round(targetStats.avg_score), Math.round(targetStats.avg_score * progress)),
        topics: Math.min(targetStats.topics_covered.length, Math.round(targetStats.topics_covered.length * progress))
      });

      if (step >= steps) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }, intervalTime);
  }, []);

  // Time-based greeting
  const getGreetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  const counselDailyMessage = getCounselDailyMessage();

  useEffect(() => {
    animateCounters(DEFAULT_STATS);

    fetchStats().then(data => {
      if (data) {
        let realQuizzes = data.quizzes_taken || 0;
        let realScore = data.avg_score || 0;
        let realTopics = data.topics_covered || [];
        
        try {
          const localHistory = JSON.parse(localStorage.getItem('sukhman_quiz_history') || '[]');
          if (localHistory.length > realQuizzes) {
            realQuizzes = localHistory.length;
            realScore = Math.round(localHistory.reduce((acc, q) => acc + (q.percentage || 0), 0) / realQuizzes);
            const localTopics = Array.from(new Set(localHistory.map(q => q.topic).filter(Boolean)));
            realTopics = Array.from(new Set([...realTopics, ...localTopics]));
          }
        } catch {}

        let realChats = data.chats_count || 0;
        try {
          const prepChats = JSON.parse(localStorage.getItem('sukhman_chats_prep') || '[]');
          const chillChats = JSON.parse(localStorage.getItem('sukhman_chats_chill') || '[]');
          let userMessages = 0;
          prepChats.forEach(c => {
            userMessages += (c.messages || []).filter(m => m.role === 'user').length;
          });
          chillChats.forEach(c => {
            userMessages += (c.messages || []).filter(m => m.role === 'user').length;
          });
          realChats = Math.max(realChats, userMessages);
        } catch {}

        const realStats = {
          chats_count: realChats,
          quizzes_taken: realQuizzes,
          avg_score: realScore,
          topics_covered: realTopics
        };

        setStats(realStats);
        animateCounters(realStats);
      }
    });

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [animateCounters]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35 }}
      className="space-y-8 pb-12"
    >
      {/* Top Greeting & Daily Counsel Message */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-violet-500/20 text-purple-200 border border-violet-500/30">
            Law Scholar Dashboard
          </span>
          <span className="text-xs text-gold-400 font-semibold flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            {stats.quizzes_taken > 0 ? `${stats.quizzes_taken}-Day Active Streak 🔥` : 'Day 1: Journey Begins 🚀'}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-heading text-white tracking-tight">
          Good {getGreetingTime()},{' '}
          <span className="gold-gradient-text">Sukhman 👑</span>
        </h1>

        {/* Daily message from Counsel */}
        <div className="glass-panel p-4 rounded-2xl border border-electric-violet/30 bg-gradient-to-r from-violet-950/40 via-navy-900/60 to-pink-950/30 flex items-start sm:items-center gap-3.5 shadow-lg">
          <div className="w-9 h-9 rounded-xl bg-electric-violet/20 border border-electric-violet/40 flex items-center justify-center flex-shrink-0 text-lg">
            💜
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-pink-300 block mb-0.5">
              Daily Message From Counsel:
            </span>
            <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
              "{counselDailyMessage}"
            </p>
          </div>
        </div>
      </div>

      {/* CLAT 2027 Countdown Timer */}
      <CountdownTimer showBanners={true} />

      {/* Quick Stats (Count-up Animation) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Prep Chats',
            value: counterStats.chats,
            suffix: '+',
            icon: MessageSquare,
            color: 'text-violet-400',
            bg: 'bg-violet-500/10 border-violet-500/30'
          },
          {
            label: 'Quizzes Taken',
            value: counterStats.quizzes,
            suffix: '',
            icon: Zap,
            color: 'text-amber-400',
            bg: 'bg-amber-500/10 border-amber-500/30'
          },
          {
            label: 'Avg Quiz Score',
            value: counterStats.score,
            suffix: '%',
            icon: TrendingUp,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10 border-emerald-500/30'
          },
          {
            label: 'Topics Covered',
            value: counterStats.topics,
            suffix: ' Domains',
            icon: Award,
            color: 'text-pink-400',
            bg: 'bg-pink-500/10 border-pink-500/30'
          }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              whileHover={{ y: -3 }}
              className="glass-panel glass-panel-glow rounded-2xl p-5 border border-white/10 bg-[#0d0d2b]/70 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400 tracking-wide">
                  {stat.label}
                </span>
                <div className={`p-2 rounded-xl border ${stat.bg}`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl sm:text-3xl font-bold font-heading text-white tracking-tight">
                  {stat.value}
                </span>
                <span className="text-sm font-semibold text-slate-400">{stat.suffix}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 3 Main Mode Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold font-heading text-white tracking-wide flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gold-400" />
            Core Sanctums
          </h2>
          <span className="text-xs text-slate-400">Select an experience</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <ModeCard
            title="CLAT Prep Mode"
            subtitle="AI Tutor with exact 2027 syllabus, case laws, landmark precedents, and negative marking strategy."
            icon={BookOpen}
            theme="violet"
            tag="Exam Tutor"
            onClick={() => onNavigate('prep')}
          />
          <ModeCard
            title="Chill Space"
            subtitle="Warm rose sanctuary. Zero CLAT pressure — talk life, food, music, memes, and recharge your mind."
            icon={Moon}
            theme="rose"
            tag="AI Best Friend"
            onClick={() => onNavigate('chill')}
          />
          <ModeCard
            title="Quiz Arena"
            subtitle="Practice high-yield passage MCQs with instant feedback, explanations, and NLS readiness badges."
            icon={Zap}
            theme="gold"
            tag="Test Simulator"
            onClick={() => onNavigate('quiz')}
          />
        </div>
      </div>

      {/* Topics Covered Tag Cloud */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10 bg-[#0d0d2b]/70">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-electric-light" />
            <h3 className="text-base font-bold font-heading text-white">
              Covered Domains & Syllabus Mastery
            </h3>
          </div>
          <span className="text-xs text-gold-400 font-semibold">Active Syllabus</span>
        </div>

        {stats.topics_covered.length === 0 ? (
          <div className="text-center py-8 px-4 rounded-xl border border-dashed border-white/10 bg-white/2">
            <p className="text-xs sm:text-sm text-slate-300 font-medium mb-1">
              Zero mock tests taken yet — fresh runway for Sukhman! 🚀
            </p>
            <p className="text-[11px] text-slate-500 mb-4">
              Take your first drill in Quiz Arena to start populating your accuracy metrics and syllabus mastery.
            </p>
            <button
              onClick={() => onNavigate('quiz')}
              className="btn-gradient-shimmer px-5 py-2 rounded-full text-xs font-semibold text-white shadow-lg inline-flex items-center gap-1.5"
            >
              <span>Launch First Drill in Quiz Arena ⚡</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2.5">
            {stats.topics_covered.map((topic, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.05 }}
                onClick={() => onNavigate('quiz')}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-white/5 hover:bg-electric-violet/20 text-slate-300 hover:text-white border border-white/10 hover:border-electric-violet/40 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{topic}</span>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
