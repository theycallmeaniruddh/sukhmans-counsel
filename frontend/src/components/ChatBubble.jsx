import React from 'react';
import { motion } from 'framer-motion';
import CounselAvatar from './CounselAvatar';

export default function ChatBubble({ message, isUser, timestamp, mode = 'prep' }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: isUser ? 30 : -30, y: 10 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex items-start gap-3 my-3.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      {isUser ? (
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-500 to-amber-500 border border-pink-400/50 flex items-center justify-center text-sm shadow-md flex-shrink-0">
          👑
        </div>
      ) : (
        <div className="flex-shrink-0">
          <CounselAvatar size="sm" />
        </div>
      )}

      {/* Message Content */}
      <div className={`max-w-[82%] sm:max-w-[75%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div className="flex items-center gap-2 mb-1 px-1">
          <span className="text-[11px] font-semibold text-slate-400">
            {isUser ? 'Sukhman 👑' : 'Counsel ⚖️'}
          </span>
          {timestamp && (
            <span className="text-[9px] text-slate-500">{timestamp}</span>
          )}
        </div>

        <div
          className={`p-4 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? 'bg-gradient-to-r from-electric-violet to-purple-600 text-white rounded-tr-none shadow-lg shadow-electric-violet/20 border border-violet-400/30'
              : mode === 'chill'
              ? 'glass-panel rounded-tl-none border-pink-500/30 text-slate-100 bg-[#1e0e28]/70 shadow-md shadow-pink-900/10'
              : 'glass-panel rounded-tl-none border-electric-violet/30 text-slate-100 bg-[#110e2f]/70 shadow-md shadow-electric-violet/10'
          }`}
        >
          <div className="whitespace-pre-wrap font-sans space-y-2">
            {message}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
