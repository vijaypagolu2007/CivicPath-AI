"use client";

import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const SUGGESTED_QUESTIONS = [
  "How to register?",
  "Upcoming dates?",
  "Valid IDs?",
];

export const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: "Hi! I'm CivicPath AI [V2.5 - 2026 Grounded]. Ask me anything about the **2026 State Elections**, voter registration, or polling protocols. (Current Date: April 2026)." }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input.trim() };
    const allMessages = [...messages, userMessage];
    setMessages(allMessages);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: allMessages })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "API Error");
      
      const responseText = data.text || "I couldn't process that.";
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: responseText }]);
    } catch (error: any) {
      let errorMessage = "Sorry, I'm a bit overwhelmed with requests. Please wait a minute and try again!";
      if (!error.message.includes("quota")) {
         errorMessage = `I ran into an issue: ${error.message}`;
      }
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: errorMessage }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 bg-black text-white p-4 rounded-full shadow-lg hover:bg-gray-800 transition-colors flex items-center justify-center border border-gray-700"
          >
            <MessageSquare size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 w-[90vw] sm:w-[400px] h-[600px] max-h-[80vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-black text-white p-2 rounded-lg">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">CivicPath AI</h3>
                  <p className="text-xs text-gray-500">Election Assistant</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto w-full p-5 space-y-6 bg-white">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex w-full gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                    msg.role === 'user' ? 'bg-black text-white' : 'bg-gray-100 text-black border border-gray-200'
                  }`}>
                    {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                  </div>
                  <div className={`p-3.5 text-sm max-w-[80%] rounded-2xl ${
                    msg.role === 'user' 
                      ? 'bg-black text-white rounded-tr-sm' 
                      : 'bg-gray-50 text-gray-900 border border-gray-100 rounded-tl-sm'
                  }`}>
                    <div className={`prose prose-sm max-w-none ${msg.role === 'user' ? 'prose-invert' : ''}`}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex w-full gap-3">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-gray-100 text-black border border-gray-200 flex items-center justify-center">
                    <Bot size={14} />
                  </div>
                  <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl rounded-tl-sm flex items-center gap-1">
                    <motion.div className="w-1.5 h-1.5 bg-gray-400 rounded-full" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                    <motion.div className="w-1.5 h-1.5 bg-gray-400 rounded-full" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                    <motion.div className="w-1.5 h-1.5 bg-gray-400 rounded-full" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
                  </div>
                </div>
              )}
              <div ref={bottomRef} className="h-1" />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-100">
              {messages.length < 3 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => {
                        setInput(q);
                        setTimeout(() => document.getElementById('chat-send-btn')?.click(), 50);
                      }}
                      className="text-xs text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
              
              <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
                <input
                  type="text" value={input} onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question..."
                  className="flex-1 bg-gray-50 border border-gray-200 focus:border-black focus:ring-1 focus:ring-black rounded-lg px-4 py-2.5 text-sm outline-none transition-all placeholder:text-gray-400"
                />
                <button 
                  id="chat-send-btn"
                  type="submit" 
                  disabled={!input.trim() || isTyping} 
                  className="bg-black text-white h-10 w-10 rounded-lg flex items-center justify-center hover:bg-gray-800 disabled:opacity-50 transition-colors shrink-0"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
