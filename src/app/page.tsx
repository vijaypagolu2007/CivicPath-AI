"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Checklist } from '@/components/Checklist';
import { MockBallot } from '@/components/MockBallot';
import { Quiz } from '@/components/Quiz';
import { Certificate } from '@/components/Certificate';
import { AuthModal } from '@/components/AuthModal';
import { BoothFinder } from '@/components/BoothFinder';
import { AIAssistant } from '@/components/AIAssistant';
import { Toast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Stepper, Step } from '@/components/ui/Stepper';
import { ChevronRight, ChevronLeft, GraduationCap, LogIn, LogOut, MapPin, UserPlus, Award } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/lib/useAuth';
import { getLocalData, saveLocalData, trackEvent } from '@/lib/store';

export default function Home() {
  const { user, logout, loading: authLoading, authStatus } = useAuth();
  const [onboarded, setOnboarded] = useState(false);
  const [voterType, setVoterType] = useState<'first' | 'returning' | null>(null);
  const [toast, setToast] = useState<{ message: string, type: 'welcome' | 'success' } | null>(null);
  
  // Linear Flow: checklist -> ballot -> quiz -> certificate
  const FLOW_STEPS: Step[] = [
    { id: 'checklist', label: 'Checklist' },
    { id: 'ballot', label: 'Mock Ballot' },
    { id: 'quiz', label: 'Civic Quiz' },
    { id: 'certificate', label: 'Certificate' },
  ];
  
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    // Handle persistent onboarding state
    const data = getLocalData();
    if (data.voterType) {
      const timer = setTimeout(() => {
        setVoterType(data.voterType as 'first' | 'returning');
        setOnboarded(true);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, []);

  // Show welcome toast when user status is determined
  useEffect(() => {
    if (user && authStatus) {
      const message = authStatus === 'returning' 
        ? `Welcome back, ${user.displayName}! We've restored your progress.` 
        : `Hello ${user.displayName}! Your progress will now be saved securely.`;
      
      console.log(`[Toast] Triggering ${authStatus} welcome for ${user.displayName}`);
      
      // Slight delay to allow modal close animation to finish
      const timer = setTimeout(() => {
        setToast({ message, type: 'welcome' });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [user, authStatus]);

  const handleOnboard = async (type: 'first' | 'returning') => {
    setVoterType(type);
    setOnboarded(true);
    saveLocalData({ voterType: type });
    trackEvent("onboarding_selected", { type });
    
    // Auto-open auth modal for first-time voters to suggest saving progress
    if (type === 'first' && !user) {
      setTimeout(() => setIsAuthModalOpen(true), 1500);
    }
  };

  const handleNext = () => {
    if (currentStepIndex < FLOW_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleExport = () => {
    window.print();
    trackEvent("certificate_exported");
  };

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <span className="mr-2 h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-[0.3em]">Loading</p>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-white text-gray-900 print:bg-white flex flex-col font-sans">
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <AIAssistant />
      <Toast 
        isVisible={!!toast} 
        message={toast?.message || ''} 
        type={toast?.type} 
        onClose={() => setToast(null)} 
      />

      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 print:hidden">
        <div className="max-w-5xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-md">
              <GraduationCap className="text-white" size={24} aria-hidden="true" />
            </div>
            <div>
              <h1 className="font-semibold text-xl tracking-tight leading-tight text-secondary-900">CivicPath AI</h1>
              <p className="text-[10px] font-medium text-primary-600 uppercase tracking-wide mt-1">
                India <span className="opacity-50">|</span> {voterType === 'first' ? 'New Voter' : 'Refresher'}
              </p>
            </div>
          </div>
          <div>
            {!user ? (
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowMap(!showMap)}
                  className="gap-2 text-[10px] uppercase tracking-wide hidden sm:flex text-gray-500"
                >
                  <MapPin size={14} /> {showMap ? "Close Map" : "Locate Booth"}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="gap-2 text-[10px] uppercase tracking-wide"
                >
                  <LogIn size={14} aria-hidden="true" /> Sign In
                </Button>
              </div>
            ) : (
              <div className="flex items-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowMap(!showMap)}
                  className="gap-2 text-[10px] uppercase tracking-wide hidden sm:flex text-gray-500 mr-2"
                >
                  <MapPin size={14} /> {showMap ? "Close Map" : "Locate Booth"}
                </Button>
                <div className="flex items-center gap-3">
                  <div className="hidden sm:block text-right">
                    <p className="text-xs font-medium text-secondary-900 leading-tight">{user?.displayName}</p>
                    <p className="text-[9px] font-medium text-primary-600 uppercase tracking-wide">Progress Saved</p>
                  </div>
                  {user?.photoURL ? (
                    <Image src={user.photoURL} alt="Profile" width={40} height={40} className="rounded-full border-2 border-primary-100" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-secondary-100 text-secondary-900 flex items-center justify-center font-semibold">
                      {user?.displayName?.[0] || 'U'}
                    </div>
                  )}
                  <button 
                    onClick={async () => {
                      if(logout) await logout();
                    }}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
                    title="Log Out"
                    aria-label="Log out"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-16">
        {showMap ? (
          <div className="animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-secondary-900">Locate Your Polling Booth</h2>
              <Button variant="ghost" onClick={() => setShowMap(false)}>Return to Guide</Button>
            </div>
            <BoothFinder />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {!onboarded ? (
            <motion.div 
              key="onboarding"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto text-center"
            >
              <div className="bg-primary-50 w-24 h-24 rounded-xl flex items-center justify-center mx-auto mb-8">
                <Award className="text-primary-600" size={48} />
              </div>
              <h2 className="text-4xl md:text-5xl font-semibold text-secondary-900 mb-4 tracking-tight">Your Path to the Polls</h2>
              <p className="text-gray-500 font-medium md:text-lg mb-12">Select your experience level to personalize your interactive voting guide.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <button 
                  onClick={() => handleOnboard('first')}
                  className="group flex flex-col items-center p-8 md:p-10 rounded-xl border-2 border-gray-100 hover:border-primary-500 hover:bg-primary-50 transition-all duration-200 ease-in-out text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-500"
                  aria-label="Start First-Time Voter guide"
                >
                  <div className="bg-primary-100 p-4 rounded-2xl mb-6 group-hover:bg-primary-600 group-hover:text-white transition-colors text-primary-600">
                    <UserPlus size={32} />
                  </div>
                  <span className="font-semibold text-2xl text-secondary-900 text-center mb-2">First-Time Voter</span>
                  <span className="text-xs text-gray-500 text-center font-medium">Step-by-step registration & basics</span>
                </button>
                
                <button 
                  onClick={() => handleOnboard('returning')}
                  className="group flex flex-col items-center p-8 md:p-10 rounded-xl border-2 border-gray-100 hover:border-secondary-500 hover:bg-secondary-50 transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-secondary-500"
                  aria-label="Start Returning Voter guide"
                >
                  <div className="bg-secondary-100 p-4 rounded-2xl mb-6 group-hover:bg-secondary-600 group-hover:text-white transition-colors text-secondary-600">
                    <GraduationCap size={32} />
                  </div>
                  <span className="font-semibold text-2xl text-secondary-900 text-center mb-2">Returning Voter</span>
                  <span className="text-xs text-gray-500 text-center font-medium">Quick refresher & EVM simulation</span>
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="flow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full print:p-0"
            >
              {/* Stepper only visible when not printing */}
              <div className="print:hidden mb-12">
                <Stepper steps={FLOW_STEPS} currentStepIndex={currentStepIndex} />
              </div>

              {/* Step Content */}
              <div className="bg-gray-50/30 rounded-[3rem] p-4 md:p-8 border border-gray-100 print:border-none print:bg-white print:p-0 mb-12 min-h-[500px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={FLOW_STEPS[currentStepIndex].id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {currentStepIndex === 0 && <Checklist voterType={voterType} user={user} />}
                    {currentStepIndex === 1 && <MockBallot />}
                    {currentStepIndex === 2 && <Quiz user={user} />}
                    {currentStepIndex === 3 && <Certificate user={user} onExport={handleExport} />}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Bottom Navigation */}
              <div className="flex items-center justify-between border-t border-gray-100 pt-8 print:hidden">
                <div>
                  {currentStepIndex > 0 && (
                    <Button variant="ghost" onClick={handleBack} className="gap-2">
                      <ChevronLeft size={18} /> Back
                    </Button>
                  )}
                </div>
                
                {currentStepIndex < FLOW_STEPS.length - 1 && (
                  <Button variant="primary" onClick={handleNext} className="gap-2 px-8">
                    Continue <ChevronRight size={18} />
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        )}
     </div>
    </main>
  );
}
