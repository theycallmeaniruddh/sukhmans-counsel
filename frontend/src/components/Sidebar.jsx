import React from 'react';
import { motion } from 'framer-motion';
import {
  Home,
  BookOpen,
  Moon,
  Zap,
  Calendar,
  Newspaper,
  Bookmark,
  LogOut,
  RotateCcw
} from 'lucide-react';
import CounselAvatar from './CounselAvatar';
import { resetAllData } from '../utils/api';

export default function Sidebar({ activeTab, setActiveTab, onLogout, isMobileOpen, setIsMobileOpen }) {
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'prep', label: 'CLAT Prep', icon: BookOpen, badge: 'Tutor' },
    { id: 'chill', label: 'Chill Space', icon: Moon, badge: 'Relax' },
    { id: 'quiz', label: 'Quiz Arena', icon: Zap, badge: 'MCQ' },
    { id: 'planner', label: 'Study Planner', icon: Calendar },
    { id: 'affairs', label: 'Current Affairs', icon: Newspaper },
    { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
  ];

  const handleResetAll = async () => {
    if (window.confirm("Reset all quiz stats, chat conversations, and logs to 0 for a completely fresh start?")) {
      try {
        await resetAllData();
      } catch (e) {
        console.warn("Reset error:", e);
      }
      localStorage.removeItem('sukhman_quiz_history');
      localStorage.removeItem('sukhman_wrong_answers');
      localStorage.removeItem('sukhman_chats_prep');
      localStorage.removeItem('sukhman_chats_chill');
      localStorage.removeItem('sukhman_study_plan');
      window.location.reload();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-[#0f0f2d]/95 backdrop-blur-2xl border-r border-electric-violet/20 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="text-2xl filter drop-shadow">⚖️</span>
            <div>
              <h1 className="font-heading text-lg font-bold gold-gradient-text tracking-wide">
                Sukhman's Counsel
              </h1>
              <p className="text-[11px] text-pink-300/80 font-medium">
                Path to NLS Bangalore
              </p>
            </div>
          </div>

          {/* Counsel Status Card */}
          <div className="glass-panel p-2.5 rounded-xl border border-electric-violet/30 bg-[#16143c]/60">
            <CounselAvatar size="sm" showStatus={true} />
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <motion.button
                key={item.id}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.15 }}
                onClick={() => {
                  setActiveTab(item.id);
                  if (setIsMobileOpen) setIsMobileOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                  isActive
                    ? 'bg-gradient-to-r from-electric-violet/30 to-transparent text-white border-l-4 border-gold-500 shadow-md shadow-electric-violet/10 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-gold-400' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      item.id === 'chill'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-electric-violet/20 text-purple-200 border border-electric-violet/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Bottom Profile & Logout */}
        <div className="p-4 border-t border-white/10 bg-[#0c0c24]/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white shadow-md">
                👑
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white tracking-wide">
                  Sukhman
                </span>
                <span className="text-[10px] text-gold-400 font-semibold">
                  CLAT 2027 Aspirant
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetAll}
                title="Reset all stats and data to 0"
                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onLogout}
                title="Logout"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
