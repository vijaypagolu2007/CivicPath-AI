"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/useAuth';
import { X, GraduationCap, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await login();
      onClose();
    } catch (err) {
      setError("Google Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className="p-8 md:p-10 text-center">
              <button 
                onClick={onClose} 
                className="absolute top-6 right-6 p-2 rounded-full text-gray-400 hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>

              <div className="bg-primary-50 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
                <GraduationCap className="text-primary-600" size={40} />
              </div>

              <h3 className="text-3xl font-black text-secondary-900 mb-2 tracking-tight">CivicPath AI</h3>
              <p className="text-gray-500 font-medium mb-10 uppercase tracking-widest text-[10px]">Secure Your Progress</p>

              <div className="space-y-4">
                {error && (
                  <div className="flex items-center justify-center gap-2 mb-4 text-red-700 text-xs font-bold bg-red-50 p-3 rounded-xl border border-red-100" role="alert">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}
                
                <Button 
                  onClick={handleGoogleLogin} 
                  isLoading={loading}
                  variant="outline"
                  size="lg"
                  className="w-full gap-3 shadow-sm border-gray-200"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" className="w-5 h-5" aria-hidden="true" />
                  Continue with Google
                </Button>
              </div>
            </div>
            <div className="h-2 bg-gradient-to-r from-secondary-500 to-primary-500" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
