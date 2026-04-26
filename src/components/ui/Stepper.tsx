import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export type Step = {
  id: string;
  label: string;
};

interface StepperProps {
  steps: Step[];
  currentStepIndex: number;
}

export const Stepper = ({ steps, currentStepIndex }: StepperProps) => {
  return (
    <div className="w-full relative mb-12">
      <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gray-100 -translate-y-1/2 z-0" />
      <motion.div 
        className="absolute top-1/2 left-0 h-[2px] bg-primary-500 -translate-y-1/2 z-0 origin-left"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: currentStepIndex / (steps.length - 1 || 1) }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />
      
      <div className="relative z-10 flex justify-between">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentStepIndex;
          const isActive = idx === currentStepIndex;
          
          return (
            <div key={step.id} className="flex flex-col items-center group">
              <motion.div 
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-medium text-sm transition-colors duration-300 ${
                  isCompleted 
                    ? 'bg-primary-500 text-white shadow-md shadow-primary-200' 
                    : isActive 
                      ? 'bg-secondary-500 text-white shadow-lg shadow-secondary-200 border-2 border-secondary-500' 
                      : 'bg-white border-2 border-gray-200 text-gray-400'
                }`}
                animate={isActive ? { scale: 1.1 } : { scale: 1 }}
              >
                {isCompleted ? <Check size={18} /> : (idx + 1)}
              </motion.div>
              <div className={`mt-3 text-[10px] sm:text-xs font-medium uppercase tracking-wider transition-colors duration-300 max-w-[80px] text-center ${
                isActive ? 'text-secondary-900' : isCompleted ? 'text-primary-600' : 'text-gray-400'
              }`}>
                {step.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
