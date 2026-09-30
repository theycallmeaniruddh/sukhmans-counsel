import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Plus,
  Compass
} from 'lucide-react';
import { generateStudyPlan } from '../utils/api';
import { SYLLABUS_CHIPS } from '../utils/topics';

export default function StudyPlanner() {
  // Auto-calculate days remaining to December 6, 2026
  const targetExamDate = new Date('2026-12-06T14:00:00+05:30').getTime();
  const today = new Date().getTime();
  const calculatedDays = Math.max(1, Math.floor((targetExamDate - today) / (1000 * 60 * 60 * 24)));

  const [selectedTopics, setSelectedTopics] = useState([
    "Fundamental Rights & DPSP",
    "Supreme Court Landmark Benches",
    "Critical Reasoning Assumptions"
  ]);
  const [customTopicInput, setCustomTopicInput] = useState('');
  const [dailyHours, setDailyHours] = useState(4);
  const [loading, setLoading] = useState(false);
  const [timeline, setTimeline] = useState(() => {
    try {
      const saved = localStorage.getItem('sukhman_study_plan');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Planner storage parse error:", e);
    }
    return null;
  });

  const toggleTopic = (chip) => {
    if (selectedTopics.includes(chip)) {
      setSelectedTopics(selectedTopics.filter(t => t !== chip));
    } else {
      setSelectedTopics([...selectedTopics, chip]);
    }
  };

  const addCustomTopic = (e) => {
    e.preventDefault();
    if (!customTopicInput.trim()) return;
    if (!selectedTopics.includes(customTopicInput.trim())) {
      setSelectedTopics([...selectedTopics, customTopicInput.trim()]);
    }
    setCustomTopicInput('');
  };

  const handleGeneratePlan = async () => {
    setLoading(true);
    try {
      const data = await generateStudyPlan(selectedTopics, calculatedDays, dailyHours);
      if (data && data.plan) {
        setTimeline(data.plan);
        localStorage.setItem('sukhman_study_plan', JSON.stringify(data.plan));
      }
    } catch (err) {
      console.error("Failed to generate plan:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="pb-16 space-y-8"
    >
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-500/20 text-purple-200 border border-violet-500/30">
            Roadmap to NLS
          </span>
          <span className="text-xs text-gold-400 font-semibold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {calculatedDays} Days Remaining
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight">
          Strategic Study Planner 📅
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
          Craft a day-by-day timetable accounting for your weak domains, the October 31, 2026 registration deadline, and November admit card release.
        </p>
      </div>

      {/* Inputs Configuration Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-electric-violet/30 shadow-2xl bg-[#0d0d2b]/85 space-y-6">
        {/* Days Remaining & Hours Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Days Remaining Box */}
          <div className="p-4 rounded-2xl bg-[#130f34]/80 border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                Countdown to Dec 6, 2026
              </span>
              <span className="text-3xl font-bold font-heading gold-gradient-text">
                {calculatedDays} Days
              </span>
              <p className="text-[11px] text-slate-400 mt-1">
                Registration Deadline: Oct 31, 2026
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-xl">
              ⚖️
            </div>
          </div>

          {/* Daily Study Hours Slider (1-8) */}
          <div className="p-4 rounded-2xl bg-[#130f34]/80 border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                Daily Study Capacity
              </span>
              <span className="text-base font-bold font-heading text-purple-300">
                {dailyHours} Hours / Day
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="8"
              step="1"
              value={dailyHours}
              onChange={(e) => setDailyHours(Number(e.target.value))}
              className="w-full h-2 bg-navy-800 rounded-lg appearance-none cursor-pointer accent-electric-violet"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-2">
              <span>1 hr (Maintenance)</span>
              <span>4 hrs (Ideal Pace)</span>
              <span>8 hrs (Intensive Sprint)</span>
            </div>
          </div>
        </div>

        {/* Weak Topics Chips Selection */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-electric-light" />
              Select Target Weak Topics (CLAT 2027 Syllabus)
            </label>
            <span className="text-xs text-slate-400">
              {selectedTopics.length} selected
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {SYLLABUS_CHIPS.map((chip) => {
              const isSelected = selectedTopics.includes(chip);
              return (
                <button
                  key={chip}
                  type="button"
                  onClick={() => toggleTopic(chip)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-electric-violet/30 text-white border border-electric-violet shadow-md shadow-electric-violet/20 font-semibold'
                      : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
                  }`}
                >
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-electric-light" />}
                  <span>{chip}</span>
                </button>
              );
            })}
          </div>

          {/* Add Custom Topic Input */}
          <form onSubmit={addCustomTopic} className="flex gap-2 max-w-md">
            <input
              type="text"
              value={customTopicInput}
              onChange={(e) => setCustomTopicInput(e.target.value)}
              placeholder="Add custom topic (e.g. Torts Vicarious Liability)..."
              className="flex-1 px-3.5 py-2 rounded-xl glass-input text-xs"
            />
            <button
              type="submit"
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>
        </div>

        {/* Generate Plan Button */}
        <button
          onClick={handleGeneratePlan}
          disabled={loading}
          className="w-full btn-gradient-shimmer py-4 px-6 text-white font-bold text-sm tracking-wide shadow-xl flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Counsel is synthesizing your custom timeline...
            </span>
          ) : (
            <>
              <span>Generate Personalized Study Roadmap</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Rendered Scrollable Timeline */}
      {timeline && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-heading text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gold-400" />
              Your Customized Milestone Roadmap
            </h2>
            <span className="text-xs text-gold-400 font-semibold">
              Daily Target: {dailyHours} Hours
            </span>
          </div>

          <div className="relative border-l-2 border-electric-violet/40 ml-4 pl-6 space-y-6">
            {timeline.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="relative group"
              >
                {/* Timeline Bullet Node */}
                <div className="absolute -left-[31px] top-4 w-4 h-4 rounded-full bg-electric-violet border-4 border-[#07071a] shadow-[0_0_10px_rgba(124,58,237,0.8)]" />

                {/* Day Card */}
                <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-white/10 bg-[#0d0d2b]/80 group-hover:border-electric-violet/50 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2.5 py-0.5 rounded-lg bg-gold-500/20 text-gold-300 border border-gold-500/40 text-xs font-bold">
                        {item.date || `Day ${item.day || idx + 1}`}
                      </span>
                      <span className="text-xs font-semibold text-purple-300">
                        {item.phase || 'Core Mastery'}
                      </span>
                    </div>

                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {item.hours || dailyHours} hours scheduled
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-white mb-3">
                    {item.topic}
                  </h3>

                  {/* Tasks List */}
                  {item.tasks && (
                    <ul className="space-y-2 mb-4">
                      {item.tasks.map((task, tIdx) => (
                        <li key={tIdx} className="text-xs sm:text-sm text-slate-300 flex items-start gap-2.5 leading-relaxed">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                          <span>{task}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Milestone Note */}
                  {item.milestone && (
                    <div className="pt-3 border-t border-white/10 flex items-center gap-2 text-xs text-slate-400 italic">
                      <Sparkles className="w-3.5 h-3.5 text-gold-400 flex-shrink-0" />
                      <span>{item.milestone}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
