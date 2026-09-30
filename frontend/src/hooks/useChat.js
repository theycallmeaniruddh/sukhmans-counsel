import { useState, useEffect } from 'react';
import { sendPrepChat, sendChillChat } from '../utils/api';

export function useChat(mode = 'prep') {
  const storageKey = `sukhman_chats_${mode}`;

  const [conversations, setConversations] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Storage parse error:", e);
    }

    // Default initial conversation
    const initialGreeting = mode === 'chill'
      ? "Hey Sukhman 💜 This is your space — no CLAT allowed here unless you want to. What's on your mind?"
      : "Welcome to your CLAT 2027 Prep Arena, Sukhman 👑! I am Counsel, your dedicated tutor. Every concept we master brings you one step closer to NLS Bangalore. Pick a quick topic below or fire away with any legal or analytical question!";

    return [
      {
        id: 'conv_1',
        title: mode === 'chill' ? 'Chill Session' : 'First Prep Session',
        createdAt: new Date().toLocaleDateString(),
        messages: [
          {
            role: 'counsel',
            content: initialGreeting,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]
      }
    ];
  });

  const [activeConvId, setActiveConvId] = useState(() => {
    return conversations[0]?.id || 'conv_1';
  });

  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(conversations));
    } catch (e) {
      console.warn("Error saving conversations to localStorage:", e);
    }
  }, [conversations, storageKey]);

  const activeConversation = conversations.find(c => c.id === activeConvId) || conversations[0];

  const sendMessage = async (text) => {
    if (!text.trim() || isTyping) return;

    const userMsg = {
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Update state with user message immediately
    setConversations(prev =>
      prev.map(c => {
        if (c.id === activeConvId) {
          const updatedTitle = c.messages.length <= 1 ? (text.slice(0, 28) + '...') : c.title;
          return {
            ...c,
            title: updatedTitle,
            messages: [...c.messages, userMsg]
          };
        }
        return c;
      })
    );

    setIsTyping(true);

    try {
      const currentMessages = activeConversation.messages.concat(userMsg);
      const apiCall = mode === 'chill' ? sendChillChat : sendPrepChat;
      const response = await apiCall(currentMessages, text);

      const aiMsg = {
        role: 'counsel',
        content: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setConversations(prev =>
        prev.map(c => {
          if (c.id === activeConvId) {
            return {
              ...c,
              messages: [...c.messages, aiMsg]
            };
          }
          return c;
        })
      );
    } catch (err) {
      console.error("Chat sending error:", err);
    } finally {
      setIsTyping(false);
    }
  };

  const createNewChat = () => {
    const newId = `conv_${Date.now()}`;
    const newGreeting = mode === 'chill'
      ? "Hey Sukhman 💜 A fresh start. What would make you feel happy and relaxed right now?"
      : "New session started, Sukhman 👑. Which CLAT 2027 domain shall we tackle today? NLS Bangalore awaits!";

    const newConv = {
      id: newId,
      title: `Session ${conversations.length + 1}`,
      createdAt: new Date().toLocaleDateString(),
      messages: [
        {
          role: 'counsel',
          content: newGreeting,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    };

    setConversations(prev => [newConv, ...prev]);
    setActiveConvId(newId);
  };

  const deleteChat = (convId) => {
    if (conversations.length <= 1) return;
    setConversations(prev => prev.filter(c => c.id !== convId));
    if (activeConvId === convId) {
      const remaining = conversations.filter(c => c.id !== convId);
      setActiveConvId(remaining[0]?.id);
    }
  };

  return {
    conversations,
    activeConvId,
    setActiveConvId,
    activeConversation,
    sendMessage,
    createNewChat,
    deleteChat,
    isTyping
  };
}
