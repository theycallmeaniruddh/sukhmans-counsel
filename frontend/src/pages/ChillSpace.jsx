import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Send,
  Plus,
  Sparkles,
  MessageSquare,
  Trash2,
  X
} from 'lucide-react';
import { useChat } from '../hooks/useChat';
import ChatBubble from '../components/ChatBubble';

export default function ChillSpace() {
  const {
    conversations,
    activeConvId,
    setActiveConvId,
    activeConversation,
    sendMessage,
    createNewChat,
    deleteChat,
    isTyping
  } = useChat('chill');

  const [input, setInput] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef(null);

  const chillIdeas = [
    { label: 'Chai & Treats ☕', text: 'Counsel, what is the ultimate comfort snack and hot drink for a rainy evening?' },
    { label: 'Bollywood Reccos 🎬', text: 'Recommend me a cozy, feel-good Bollywood or classic movie to unwind with!' },
    { label: 'Vent Session 🌸', text: 'I just need to vent about how overwhelming everything feels sometimes. Be here for me?' },
    { label: 'Music & Vibes 🎧', text: 'What kind of soothing playlist or songs should I listen to right now?' }
  ];

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

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className="h-[calc(100dvh-5.5rem)] lg:h-[calc(100dvh-4.5rem)] min-h-[520px] flex flex-col glass-panel rounded-2xl border border-pink-500/30 overflow-hidden bg-[#160b1e]/85 shadow-2xl relative"
    >
      {/* Top Header Bar with Warm Rose Glow */}
      <div className="px-4 sm:px-5 py-3 border-b border-pink-500/20 bg-[#1e0e28]/90 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-rose-500 to-purple-600 flex items-center justify-center text-lg shadow-md shadow-pink-500/20">
              🌙
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-rose-400 border-2 border-[#160b1e] rounded-full" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold font-heading text-pink-100">
                Sukhman's Chill Space 💜
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 font-semibold hidden sm:inline-block">
                Zero CLAT Zone
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-pink-300/80">
              Your warm, funny AI best friend • Relax, laugh, dream, and recharge
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Sessions Toggle Button */}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="md:hidden px-2.5 py-1.5 rounded-lg text-xs font-medium text-pink-200 bg-pink-950/50 border border-pink-500/30"
          >
            Chats ({conversations.length})
          </button>

          <button
            onClick={createNewChat}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-xs font-semibold text-white flex items-center gap-1.5 shadow-md shadow-pink-900/30 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        </div>
      </div>

      {/* Main Chat Workspace + Sessions History Sidebar */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile History Backdrop */}
        {showHistory && (
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm z-20 md:hidden"
            onClick={() => setShowHistory(false)}
          />
        )}

        {/* Sessions History Sidebar (Desktop Persistent + Mobile Drawer) */}
        <div
          className={`${
            showHistory ? 'absolute inset-y-0 left-0 w-64 z-30 shadow-2xl' : 'hidden'
          } md:block md:relative md:w-60 border-r border-pink-500/20 bg-[#170921]/95 flex flex-col`}
        >
          <div className="p-3 border-b border-pink-500/20 flex items-center justify-between">
            <span className="text-xs font-bold text-pink-300 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-pink-400" />
              Chill History
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={createNewChat}
                className="p-1 rounded text-pink-300 hover:text-white hover:bg-pink-500/20 transition-colors"
                title="Start New Chill Chat"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setShowHistory(false)}
                className="p-1 rounded text-pink-300 hover:text-white hover:bg-pink-500/20 md:hidden"
                title="Close History"
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
                    ? 'bg-gradient-to-r from-pink-600/30 to-purple-600/10 border-l-2 border-pink-400 text-white font-semibold'
                    : 'text-pink-200/80 hover:bg-pink-500/10 hover:text-white'
                }`}
              >
                <div className="truncate pr-2">
                  <p className="truncate">{c.title || 'Chill Session'}</p>
                  <span className="text-[10px] text-pink-400/60">{c.createdAt}</span>
                </div>
                {conversations.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChat(c.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-400 hover:text-rose-400 transition-opacity"
                    title="Delete Chat"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Chat Messages + Input Column */}
        <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-b from-[#160b1e]/50 via-[#120719]/70 to-[#0b0410]/90">
          {/* Fun Suggestion Chips */}
          <div className="px-4 py-2 border-b border-pink-500/10 bg-[#1c0d24]/40 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[10px] sm:text-[11px] font-semibold text-rose-300 uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-pink-400" /> Vibe:
            </span>
            {chillIdeas.map((idea, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(idea.text)}
                className="px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-medium bg-pink-950/40 hover:bg-pink-900/60 text-pink-200 border border-pink-500/30 hover:border-pink-400 transition-all whitespace-nowrap"
              >
                {idea.label}
              </button>
            ))}
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto px-3 sm:px-6 md:px-8 py-4 space-y-4">
            {activeConversation?.messages?.map((msg, index) => (
              <ChatBubble
                key={index}
                message={msg.content}
                isUser={msg.role === 'user'}
                timestamp={msg.timestamp}
                mode="chill"
              />
            ))}

            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 my-2"
              >
                <div className="w-8 h-8 rounded-full bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-sm">
                  💜
                </div>
                <div className="p-3.5 rounded-2xl glass-panel bg-[#240f2e]/80 border border-pink-500/30 flex items-center gap-2 text-xs text-pink-300">
                  <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping" />
                  <span>Counsel is listening with open ears... 🌸</span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Form */}
          <form
            onSubmit={handleSend}
            className="p-2.5 sm:p-4 border-t border-pink-500/20 bg-[#1a0c24]/90 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tell Counsel what's on your mind, Sukhman... 💜"
              className="flex-1 px-3.5 py-2.5 sm:py-3 rounded-xl glass-input border border-pink-500/30 text-pink-100 placeholder-pink-400/50 text-xs sm:text-sm focus:border-pink-500 bg-[#220d2c]/80"
            />
            <button
              type="submit"
              disabled={isTyping || !input.trim()}
              className="px-4 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-pink-900/30"
            >
              <span>Share</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
