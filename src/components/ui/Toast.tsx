"use client";

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Info, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'info' | 'welcome';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export const Toast = ({ message, type = 'success', isVisible, onClose, duration = 5000 }: ToastProps) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, y: 20, transition: { duration: 0.1 } }}
          className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[999] w-[calc(100%-2rem)] max-w-md"
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/20 p-5 flex items-center gap-5 relative overflow-hidden" style={{ perspective: "1000px" }}>
            <div className="h-1 absolute bottom-0 left-0 bg-primary-500 w-full animate-toast-progress" style={{ animationDuration: `${duration}ms` }} />
            
            <div className={`p-3 rounded-xl ${
              type === 'success' ? 'bg-green-50 text-green-600' :
              type === 'welcome' ? 'bg-primary-50 text-primary-600' :
              'bg-blue-50 text-blue-600'
            }`}>
              {type === 'success' ? <CheckCircle size={24} /> : <Info size={24} />}
            </div>

            <div className="flex-1">
              <p className="text-secondary-900 font-semibold text-sm">{message}</p>
            </div>

            <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
