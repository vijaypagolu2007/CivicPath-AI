"use client";

import React from 'react';
import { electionData } from '@/data/india';
import * as Icons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export const ProcessViewer = () => {
  return (
    <div className="space-y-12 py-6">
      {/* Refined Overview Card */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-xl font-bold opacity-90 mb-2">System: {electionData.system}</h3>
          <p className="text-lg leading-relaxed opacity-95">{electionData.overview}</p>
        </div>
        <Icons.Flag className="absolute -right-8 -bottom-8 w-48 h-48 opacity-10 rotate-12" />
      </div>

      {/* Grid of Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {electionData.steps.map((step) => {
          const IconComponent = (Icons[step.icon as keyof typeof Icons] as LucideIcon) || Icons.HelpCircle;
          return (
            <div key={step.id} className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300">
              <div className="flex flex-col gap-4">
                <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <IconComponent size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg mb-2">{step.id}. {step.title}</h4>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">{step.description}</p>
                  <div className="pt-4 border-t border-gray-50">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Key Authority</span>
                    <p className="text-xs font-semibold text-gray-700">{step.who}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Enhanced Timeline UI */}
      <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm">
        <h3 className="text-2xl font-bold text-gray-900 mb-10 flex items-center gap-3">
          <Icons.Activity className="text-blue-600" /> Election Lifecycle
        </h3>
        <div className="space-y-0">
          {electionData.timeline.map((item, index) => (
            <div key={index} className="flex group">
              <div className="flex flex-col items-center mr-6">
                <div className={`w-4 h-4 rounded-full border-4 ${index === 0 ? 'bg-blue-600 border-blue-100' : 'bg-white border-gray-200 group-hover:border-blue-300'} z-10 transition-colors`} />
                {index !== electionData.timeline.length - 1 && (
                  <div className="w-0.5 h-full bg-gray-100 group-hover:bg-blue-50 transition-colors" />
                )}
              </div>
              <div className="pb-10 flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                  <h5 className="font-bold text-gray-900 text-lg">{item.stage}</h5>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 w-fit">
                    <Icons.Clock size={12} className="mr-1" /> {item.duration}
                  </span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
