import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu } from 'lucide-react';

import ParticleBackground from './components/ParticleBackground';
import AuroraBackground from './components/AuroraBackground';
import Sidebar from './components/Sidebar';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PrepMode from './pages/PrepMode';
import ChillSpace from './pages/ChillSpace';
import QuizArena from './pages/QuizArena';
import StudyPlanner from './pages/StudyPlanner';
import CurrentAffairs from './pages/CurrentAffairs';
import Bookmarks from './pages/Bookmarks';

import { useAuth } from './hooks/useAuth';

export default function App() {
  const { isAuthenticated, login, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [drillTopicOverride, setDrillTopicOverride] = useState(null);

  // Navigate with optional drill topic override
  const handleNavigate = (tab, topic = null) => {
    if (topic) {
      setDrillTopicOverride(topic);
    } else if (tab !== 'quiz') {
      setDrillTopicOverride(null);
    }
    setActiveTab(tab);
  };

  // If user clicks "Re-attempt Topic" in Bookmarks
  const handleReattempt = (topic) => {
    setDrillTopicOverride(topic);
    setActiveTab('quiz');
  };

  // Determine aurora variant: chill space uses warmer rose tones
  const auroraVariant = activeTab === 'chill' ? 'chill' : 'default';

  return (
    <div className="min-h-screen bg-[#07071a] text-white relative font-sans overflow-x-hidden selection:bg-electric-violet selection:text-white">
      {/* 1. Persistent Animated Aurora Background */}
      <AuroraBackground variant={auroraVariant} />

      {/* 2. Persistent Drifting Star Particles (Canvas ~150 particles) */}
      <ParticleBackground />

      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          /* Login Page Screen */
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.4 }}
            className="relative z-10"
          >
            <Login onLoginSuccess={(pwd) => login(pwd || 'sukhman2025')} />
          </motion.div>
        ) : (
          /* Authenticated Application Shell */
          <motion.div
            key="app-shell"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="relative z-10 flex min-h-screen"
          >
            {/* Sidebar Navigation */}
            <Sidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onLogout={logout}
              isMobileOpen={isMobileOpen}
              setIsMobileOpen={setIsMobileOpen}
            />

            {/* Main Application Area */}
            <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
              {/* Mobile Top Navbar */}
              <header className="lg:hidden p-3.5 flex items-center justify-between border-b border-white/10 bg-[#0f0f2d]/90 backdrop-blur-xl sticky top-0 z-30">
                <button
                  onClick={() => setIsMobileOpen(true)}
                  className="p-2 rounded-xl glass-panel text-slate-300 hover:text-white"
                  title="Open Menu"
                >
                  <Menu className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-xl">⚖️</span>
                  <span className="font-heading font-bold gold-gradient-text text-base">
                    Sukhman's Counsel
                  </span>
                </div>

                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white">
                  👑
                </div>
              </header>

              {/* Page Content Container with Micro-animations */}
              <main className="flex-1 p-2.5 sm:p-5 lg:p-8 max-w-7xl mx-auto w-full flex flex-col">
                <AnimatePresence mode="wait">
                  {activeTab === 'dashboard' && (
                    <motion.div
                      key="dashboard"
                      initial={{ opacity: 0, y: 12, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -12, scale: 0.97 }}
                      transition={{ duration: 0.25 }}
                    >
                      <Dashboard onNavigate={handleNavigate} />
                    </motion.div>
                  )}

                  {activeTab === 'prep' && (
                    <motion.div
                      key="prep"
                      initial={{ opacity: 0, y: 12, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -12, scale: 0.97 }}
                      transition={{ duration: 0.25 }}
                    >
                      <PrepMode />
                    </motion.div>
                  )}

                  {activeTab === 'chill' && (
                    <motion.div
                      key="chill"
                      initial={{ opacity: 0, y: 12, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -12, scale: 0.97 }}
                      transition={{ duration: 0.25 }}
                    >
                      <ChillSpace />
                    </motion.div>
                  )}

                  {activeTab === 'quiz' && (
                    <motion.div
                      key="quiz"
                      initial={{ opacity: 0, y: 12, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -12, scale: 0.97 }}
                      transition={{ duration: 0.25 }}
                    >
                      <QuizArena
                        onNavigateToBookmarks={() => setActiveTab('bookmarks')}
                        initialTopic={drillTopicOverride}
                        onClearInitialTopic={() => setDrillTopicOverride(null)}
                      />
                    </motion.div>
                  )}

                  {activeTab === 'planner' && (
                    <motion.div
                      key="planner"
                      initial={{ opacity: 0, y: 12, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -12, scale: 0.97 }}
                      transition={{ duration: 0.25 }}
                    >
                      <StudyPlanner />
                    </motion.div>
                  )}

                  {activeTab === 'affairs' && (
                    <motion.div
                      key="affairs"
                      initial={{ opacity: 0, y: 12, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -12, scale: 0.97 }}
                      transition={{ duration: 0.25 }}
                    >
                      <CurrentAffairs
                        onNavigateToBookmarks={() => setActiveTab('bookmarks')}
                      />
                    </motion.div>
                  )}

                  {activeTab === 'bookmarks' && (
                    <motion.div
                      key="bookmarks"
                      initial={{ opacity: 0, y: 12, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -12, scale: 0.97 }}
                      transition={{ duration: 0.25 }}
                    >
                      <Bookmarks onReattemptTopic={handleReattempt} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </main>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
