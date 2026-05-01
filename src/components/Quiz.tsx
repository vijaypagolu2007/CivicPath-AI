"use client";

import React, { useState, useEffect } from 'react';
import { electionData } from '@/data/india';
import { Check, X, Award, RotateCcw, ArrowRight, ShieldCheck, Printer } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { saveSession, loadSession, trackEvent } from '@/lib/store';

export const Quiz = ({ user }: { user: FirebaseUser | null }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [certMeta, setCertMeta] = useState<{ name: string; date: string } | null>(null);

  useEffect(() => {
    const init = async () => {
      const data = await loadSession(user?.uid);
      if (data.quizScore !== undefined && data.quizScore === electionData.quiz.length) {
        setShowResults(true);
        setScore(data.quizScore);
        if (data.certificateMeta) setCertMeta(data.certificateMeta);
      }
    };
    init();
  }, [user]);

  const handleOptionSelect = (idx: number) => {
    if (showExplanation) return;
    setSelectedOption(idx);
    setShowExplanation(true);
    if (idx === electionData.quiz[currentQuestion].correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuestion = async () => {
    setSelectedOption(null);
    setShowExplanation(false);
    if (currentQuestion < electionData.quiz.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setShowResults(true);
      await saveSession({ quizScore: score }, user?.uid);
      trackEvent("quiz_completed", { score });
      
      if (score === electionData.quiz.length) {
        const meta = { name: user?.displayName || "Citizen", date: new Date().toLocaleDateString() };
        setCertMeta(meta);
        await saveSession({ certificateMeta: meta }, user?.uid);
        trackEvent("certificate_generated");
      }
    }
  };

  const resetQuiz = async () => {
    setCurrentQuestion(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setScore(0);
    setShowResults(false);
    setCertMeta(null);
    await saveSession({ quizScore: 0, certificateMeta: undefined }, user?.uid);
  };

  if (showResults) {
    const isMaster = score === electionData.quiz.length;

    return (
      <div className="max-w-4xl mx-auto py-10 px-6">
        {isMaster ? (
          <div className="animate-in zoom-in-95 duration-300">
            {/* Certificate UI */}
            <div className="bg-white border-8 border-double border-blue-900 p-8 md:p-16 rounded-xl shadow-lg relative overflow-hidden mb-12">
              {/* Seal Backdrop */}
              <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-primary-50 rounded-full opacity-50" />
              
              <div className="relative z-10 text-center">
                <div className="flex justify-center mb-8">
                  <div className="bg-blue-900 p-4 rounded-full shadow-md">
                    <ShieldCheck className="text-white" size={48} />
                  </div>
                </div>
                
                <h3 className="text-xs font-semibold text-blue-900 uppercase tracking-[0.4em] mb-4">Certificate of Excellence</h3>
                <h4 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-8 tracking-tighter">CIVIC MASTER</h4>
                
                <div className="w-24 h-1 bg-blue-900 mx-auto mb-8" />
                
                <p className="text-lg text-gray-600 font-medium mb-12 max-w-lg mx-auto leading-relaxed">
                  This certifies that <span className="font-medium text-gray-900">{certMeta?.name || "You"}</span> has successfully demonstrated exhaustive knowledge of the 
                  <span className="font-medium text-gray-900"> Indian Electoral Process</span>, achieving a perfect score.
                </p>
                
                <div className="flex flex-col md:flex-row justify-between items-center gap-10 border-t border-gray-100 pt-10">
                  <div className="text-left">
                    <div className="font-semibold text-sm text-gray-900 uppercase mb-1">Status</div>
                    <div className="text-primary-600 font-medium">Informed Citizen</div>
                  </div>
                  <div className="bg-yellow-100 p-4 rounded-2xl rotate-12 shadow-md">
                     <Award className="text-yellow-600" size={32} />
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-sm text-gray-900 uppercase mb-1">Date</div>
                    <div className="text-primary-600 font-medium">{certMeta?.date || new Date().toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4">
               <button 
                onClick={() => {
                  window.print();
                  trackEvent("certificate_printed");
                }}
                className="flex items-center gap-2 bg-blue-900 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-black transition-all duration-200 ease-in-out hover:scale-[1.02]"
              >
                <Printer size={18} /> Print Certificate
              </button>
              {!user && (
                <button 
                  onClick={() => {
                    const btn = document.getElementById('signin-btn');
                    if (btn) btn.click();
                  }}
                  className="flex items-center gap-2 bg-primary-600 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-primary-700 transition-all duration-200 ease-in-out shadow-md shadow-primary-100"
                >
                  <ShieldCheck size={18} /> Save to Cloud
                </button>
              )}
              <button 
                onClick={resetQuiz}
                className="flex items-center gap-2 bg-gray-100 text-gray-900 px-8 py-4 rounded-2xl font-semibold hover:bg-gray-200 transition-all duration-200 ease-in-out"
              >
                <RotateCcw size={18} /> Try Again
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center animate-in fade-in duration-200">
            <div className="bg-primary-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
              <Award className="text-blue-400" size={48} />
            </div>
            <h3 className="text-4xl font-semibold text-gray-900 mb-4 tracking-tight">Quiz Complete!</h3>
            <p className="text-gray-500 font-medium mb-8 text-lg">You scored <span className="text-primary-600 font-semibold">{score} / {electionData.quiz.length}</span>. Achieve 100% to unlock your Civic Master Certificate.</p>
            
            <button 
              onClick={resetQuiz}
              className="bg-primary-600 text-white px-10 py-4 rounded-2xl font-semibold hover:bg-primary-700 transition-all duration-200 ease-in-out shadow-md shadow-primary-100"
            >
              Restart Quiz
            </button>
          </div>
        )}
      </div>
    );
  }

  const q = electionData.quiz[currentQuestion];

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-3">
          <div className="bg-primary-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-semibold text-xs">
            {currentQuestion + 1}
          </div>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Question {currentQuestion + 1} of {electionData.quiz.length}</span>
        </div>
        <div className="flex gap-1.5">
          {electionData.quiz.map((_, idx) => (
            <div key={idx} className={`w-10 h-1.5 rounded-full transition-all duration-200 ease-in-out ${idx <= currentQuestion ? 'bg-primary-600 text-white shadow-[0_0_8px_rgba(37,99,235,0.4)]' : 'bg-gray-100'}`} />
          ))}
        </div>
      </div>

      <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-50 mb-8">
        <h3 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-10 leading-tight tracking-tight text-left">{q.question}</h3>

        <div className="space-y-4">
          {q.options.map((option, idx) => {
            let stateClass = "border-gray-100 bg-gray-50 hover:border-blue-200 hover:bg-white";
            if (showExplanation) {
              if (idx === q.correctAnswer) stateClass = "border-green-500 bg-green-50/50 shadow-sm ring-2 ring-green-100";
              else if (idx === selectedOption) stateClass = "border-red-400 bg-red-50/50 opacity-80";
              else stateClass = "border-gray-50 opacity-40 grayscale-[0.5]";
            }

            return (
              <button
                key={idx}
                disabled={showExplanation}
                onClick={() => handleOptionSelect(idx)}
                className={`w-full text-left p-6 rounded-2xl border-2 font-medium transition-all duration-200 ease-in-out flex justify-between items-center gap-4 ${stateClass}`}
              >
                <div className="flex items-center gap-4">
                   <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs transition-colors ${
                     showExplanation && idx === q.correctAnswer ? 'bg-green-500 border-green-500 text-white' : 'border-gray-200 text-gray-400'
                   }`}>
                     {String.fromCharCode(65 + idx)}
                   </div>
                   <span className="text-lg">{option}</span>
                </div>
                {showExplanation && idx === q.correctAnswer && <Check className="text-green-600" size={24} />}
                {showExplanation && idx === selectedOption && idx !== q.correctAnswer && <X className="text-red-600" size={24} />}
              </button>
            );
          })}
        </div>
      </div>

      {showExplanation && (
        <div className="animate-in slide-in-from-bottom-6 duration-200">
          <div className={`p-8 rounded-xl mb-8 border-2 text-left ${selectedOption === q.correctAnswer ? 'bg-green-50 border-green-100 text-green-900' : 'bg-red-50 border-red-100 text-red-900'}`}>
            <div className="flex items-start gap-4">
               <div className={`p-2 rounded-xl ${selectedOption === q.correctAnswer ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                 {selectedOption === q.correctAnswer ? <ShieldCheck size={20} /> : <AlertCircle size={20} />}
               </div>
               <div>
                  <p className="font-semibold text-lg mb-1 tracking-tight">{selectedOption === q.correctAnswer ? "Correct Analysis!" : "Not Quite Right"}</p>
                  <p className="text-sm font-medium opacity-80 leading-relaxed">{q.explanation}</p>
               </div>
            </div>
          </div>
          <button 
            onClick={nextQuestion}
            className="w-full flex items-center justify-center gap-3 bg-gray-900 text-white py-6 rounded-xl font-semibold hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ease-in-out shadow-md"
          >
            {currentQuestion === electionData.quiz.length - 1 ? "Complete Verification" : "Continue to Next Segment"} <ArrowRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

const AlertCircle = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
);
