"use client";

import React, { useState, useEffect } from 'react';
import { electionData } from '@/data/india';
import { CheckCircle2, Circle, ExternalLink, Info, Star } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { saveSession, loadSession, trackEvent } from '@/lib/store';
import { motion } from 'framer-motion';

export const Checklist = ({ voterType, user }: { voterType: 'first' | 'returning' | null, user: FirebaseUser | null }) => {
  const [completed, setCompleted] = useState<number[]>([]);

  useEffect(() => {
    const init = async () => {
      const data = await loadSession(user?.uid);
      if (data.checklistCompletion) setCompleted(data.checklistCompletion);
    };
    init();
  }, [user]);

  const toggleTask = async (id: number) => {
    const updated = completed.includes(id) 
      ? completed.filter(i => i !== id) 
      : [...completed, id];
    
    setCompleted(updated);
    await saveSession({ checklistCompletion: updated }, user?.uid);
    
    if (updated.length === electionData.checklist.length) {
      trackEvent("checklist_completed");
    }
  };

  const progress = Math.round((completed.length / electionData.checklist.length) * 100);

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div className="text-left">
            <div className="flex items-center gap-2 mb-2">
               <h3 className="text-3xl font-semibold text-secondary-900 tracking-tight">Voter Readiness</h3>
               {voterType === 'first' && (
                 <span className="bg-primary-600 text-white text-[10px] font-semibold px-2 py-1 rounded-lg flex items-center gap-1 uppercase tracking-wide">
                   <Star size={10} fill="currentColor" /> Priority
                 </span>
               )}
            </div>
            <p className="text-gray-500 font-medium">
              {voterType === 'first' 
                ? "Since you're a first-time voter, focus on Step 1 and 2 first." 
                : "A quick refresher to ensure your records are up to date."}
            </p>
          </div>
          <div className="text-right">
            <span className="text-4xl font-semibold text-primary-600 leading-tight">{progress}%</span>
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Readiness Score</p>
          </div>
        </div>
        <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden p-1 border border-gray-50">
          <motion.div 
            className="bg-primary-500 h-full rounded-full shadow-[0_0_15px_rgba(249,115,22,0.3)]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {electionData.checklist.map((item, index) => {
          const isDone = completed.includes(item.id);
          const isPriority = voterType === 'first' && item.id <= 2;
          
          return (
            <motion.button 
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => toggleTask(item.id)}
              className={`group w-full block outline-none focus-visible:ring-4 focus-visible:ring-primary-500 cursor-pointer p-6 rounded-2xl border-2 transition-all duration-200 ease-in-out duration-300 text-left ${
                isDone 
                  ? 'border-green-500 bg-green-50/50 shadow-sm' 
                  : isPriority 
                    ? 'border-primary-200 bg-primary-50/30'
                    : 'border-gray-100 bg-white hover:border-primary-200 hover:shadow-md'
              }`}
            >
              <div className="flex items-start gap-5">
                <div className={`mt-1 transition-transform duration-300 ${isDone ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {isDone ? (
                    <CheckCircle2 className="text-green-500" size={28} />
                  ) : (
                    <Circle className={`transition-colors ${isPriority ? 'text-primary-300' : 'text-gray-200 group-hover:text-primary-300'}`} size={28} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-3">
                      <h4 className={`font-medium text-xl ${isDone ? 'text-green-800' : 'text-secondary-900'} transition-colors`}>
                        {item.task}
                      </h4>
                      {isPriority && !isDone && (
                        <span className="text-[8px] font-semibold text-primary-600 border border-primary-200 px-2 py-0.5 rounded-full uppercase tracking-tighter">Required for First-timers</span>
                      )}
                    </div>
                    {item.link && (
                      <a 
                        href={item.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-gray-50 p-2 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200 ease-in-out focus-visible:ring-2 focus-visible:ring-primary-500"
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`External link for ${item.task}`}
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                  </div>
                  <p className={`text-sm mb-4 ${isDone ? 'text-green-700/70' : 'text-gray-500'}`}>{item.description}</p>
                  
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border transition-colors ${
                    isDone 
                      ? 'bg-green-500 text-white border-green-500' 
                      : 'bg-white text-primary-600 border-primary-100 group-hover:bg-primary-600 group-hover:text-white group-hover:border-primary-600'
                  }`}>
                    <Info size={14} />
                    {isDone ? "Action Completed" : item.action}
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
      
      {progress === 100 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-12 p-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl text-center shadow-lg"
        >
          <div className="bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-md">
            <CheckCircle2 className="text-white" size={40} />
          </div>
          <h4 className="text-3xl font-semibold text-white mb-2">You're Fully Prepared!</h4>
          <p className="text-green-50 font-medium">Your voter readiness is at 100%. You are an informed and empowered citizen.</p>
        </motion.div>
      )}
    </div>
  );
};
