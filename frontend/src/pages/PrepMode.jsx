import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Send,
  Plus,
  Trash2,
  Sparkles,
  MessageSquare,
  X
} from 'lucide-react';
import { useChat } from '../hooks/useChat';
import ChatBubble from '../components/ChatBubble';
import CounselAvatar from '../components/CounselAvatar';
import { QUICK_PREP_TOPICS } from '../utils/topics';

export default function PrepMode() {
  const {
    conversations,
    activeConvId,
    setActiveConvId,
    activeConversation,
    sendMessage,
    createNewChat,
    deleteChat,
    isTyping
  } = useChat('prep');

  const [input, setInput] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages, isTyping]);

  const handleSend = (e) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;
    sendMessage(input);
    setInput('');
  };

  const handleTopicClick = (topic) => {
    const prompt = `Let's drill into ${topic} for CLAT 2027! Can you explain the most critical principles, landmark cases, and typical passage traps examiners test for NLS Bangalore?`;
    sendMessage(prompt);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className="h-[calc(100dvh-5.5rem)] lg:h-[calc(100dvh-4.5rem)] min-h-[520px] flex flex-col glass-panel rounded-2xl border border-electric-violet/30 overflow-hidden bg-[#0a0a24]/90 shadow-2xl relative"
    >
      {/* Top Header Bar */}
      <div className="px-4 sm:px-5 py-3.5 border-b border-white/10 bg-[#0f0f2d]/90 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <CounselAvatar size="sm" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold font-heading text-white">
                CLAT 2027 Prep Sanctum
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-purple-200 border border-violet-500/40 font-semibold hidden sm:inline-block">
                NLS Bangalore Focus
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400">
              Exam: Dec 6, 2026 (2–4 PM) • 120 Qs (+1 / -0.25)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="md:hidden px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-white/5 border border-white/10"
          >
            Sessions ({conversations.length})
          </button>
          <button
            onClick={createNewChat}
            className="btn-gradient-shimmer px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 shadow-md"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        </div>
      </div>

      {/* Main Chat Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Backdrop */}
        {showHistory && (
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm z-20 md:hidden"
            onClick={() => setShowHistory(false)}
          />
        )}

        {/* Chat History Sidebar (Desktop + Mobile Drawer) */}
        <div
          className={`${
            showHistory ? 'absolute inset-y-0 left-0 w-64 z-30 shadow-2xl' : 'hidden'
          } md:block md:relative md:w-60 border-r border-white/10 bg-[#090920]/95 flex flex-col`}
        >
          <div className="p-3 border-b border-white/10 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-electric-light" />
              Prep Sessions
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={createNewChat}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10"
                title="Start New Chat"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setShowHistory(false)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 md:hidden"
                title="Close Drawer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {conversations.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  setActiveConvId(c.id);
                  setShowHistory(false);
                }}
                className={`group flex items-center justify-between p-2.5 rounded-xl text-xs cursor-pointer transition-all ${
                  c.id === activeConvId
                    ? 'bg-gradient-to-r from-electric-violet/30 to-transparent border-l-2 border-electric-violet text-white font-semibold'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="truncate pr-2">
                  <p className="truncate">{c.title || 'Prep Session'}</p>
                  <span className="text-[10px] text-slate-500">{c.createdAt}</span>
                </div>
                {conversations.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChat(c.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-400 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#07071a]/50">
          {/* Quick Topic Chips Bar */}
          <div className="px-4 py-2 border-b border-white/5 bg-[#0e0e2e]/50 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-semibold text-gold-400 uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Drill:
            </span>
            {QUICK_PREP_TOPICS.map((topic) => (
              <button
                key={topic}
                onClick={() => handleTopicClick(topic)}
                className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 hover:bg-electric-violet/25 hover:text-white text-slate-300 border border-white/10 hover:border-electric-violet/40 transition-all whitespace-nowrap"
              >
                {topic}
              </button>
            ))}
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4">
            {activeConversation?.messages?.map((msg, index) => (
              <ChatBubble
                key={index}
                message={msg.content}
                isUser={msg.role === 'user'}
                timestamp={msg.timestamp}
                mode="prep"
              />
            ))}

            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 my-2"
              >
                <CounselAvatar size="sm" />
                <div className="p-3.5 rounded-2xl glass-panel bg-[#120e2f]/80 border border-electric-violet/30 flex items-center gap-2 text-xs text-electric-light">
                  <span className="w-2 h-2 rounded-full bg-electric-violet animate-ping" />
                  <span>Counsel is formulating legal arguments for Sukhman...</span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Form */}
          <form
            onSubmit={handleSend}
            className="p-3 md:p-4 border-t border-white/10 bg-[#0d0d2b]/90 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Counsel any CLAT 2027 principle, case law, or logic problem..."
              className="flex-1 px-4 py-3 rounded-xl glass-input border border-electric-violet/30 text-white placeholder-slate-400 text-sm focus:border-electric-violet"
            />
            <button
              type="submit"
              disabled={isTyping || !input.trim()}
              className="btn-gradient-shimmer px-5 py-3 text-white font-semibold text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              <span>Ask</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
