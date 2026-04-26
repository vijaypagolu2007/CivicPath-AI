"use client";

import React, { useState, useEffect } from 'react';
import { electionData, Candidate } from '@/data/india';
import { Fingerprint, Monitor, Check, RotateCcw, AlertCircle, Volume2, ShieldAlert, XCircle } from 'lucide-react';

import { saveSession, trackEvent } from '@/lib/store';
import { Button } from '@/components/ui/Button';

export const MockBallot = () => {
  const [step, setStep] = useState<'id' | 'ink' | 'voting' | 'vvpat' | 'finished' | 'error'>('id');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [vvpatVisible, setVvpatVisible] = useState(false);
  const [isBeeping, setIsBeeping] = useState(false);
  const [simulatingError, setSimulatingError] = useState(false);

  const playBeep = () => {
    setIsBeeping(true);
    
    try {
      // Web Audio API for authentic EVM beep sound
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtxClass();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(2200, audioCtx.currentTime); // High pitch like an EVM
      
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime); // Volume

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        audioCtx.close();
      }, 1500); // 1.5 seconds typical EVM beep length
    } catch (e) {
      console.warn("Audio context not supported", e);
    }
    
    setTimeout(() => setIsBeeping(false), 1500);
  };

  const handleIdentityConfirm = () => {
    if (simulatingError) {
      setStep('error');
      trackEvent("edge_case_triggered", { case: "name_missing" });
    } else {
      setStep('ink');
    }
  };

  const handleVote = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setStep('vvpat');
    setVvpatVisible(true);
    playBeep();

    setTimeout(() => {
      setVvpatVisible(false);
      setTimeout(() => {
        setStep('finished');
        
        // Security simulation: Create a deterministic "crypto signature" for the mock vote
        const voteHash = btoa(`${candidate.id}-${Date.now()}`).substring(0, 16);
        trackEvent("mock_ballot_completed", { 
          candidate: candidate.name, 
          security_hash: voteHash,
          timestamp: new Date().toISOString()
        });
      }, 800);
    }, 7000);
  };

  const reset = () => {
    setStep('id');
    setSelectedCandidate(null);
    setVvpatVisible(false);
    setSimulatingError(false);
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      {/* Simulation Header */}
      <div className="mb-12 text-center">
        <h3 className="text-4xl font-semibold text-gray-900 mb-2">Polling Booth Simulator</h3>
        <p className="text-gray-500 font-medium max-w-lg mx-auto">Experience the secure, step-by-step process of casting your vote in India.</p>
      </div>

      {/* Progress Stepper */}
      <div className="flex justify-between items-center mb-16 px-4 md:px-12 relative" aria-label="Voting Process Progress">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2" />
        {['Verification', 'Inking', 'Ballot', 'Completed'].map((label, idx) => {
          const currentIdx = ['id', 'ink', 'voting', 'finished'].indexOf(step === 'vvpat' ? 'voting' : step === 'error' ? 'id' : step);
          const isActive = idx === currentIdx;
          const isCompleted = idx < currentIdx;
          const isError = step === 'error' && idx === 0;
          
          return (
            <div key={label} className="flex flex-col items-center flex-1 relative z-10">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ease-in-out ${
                isError ? 'bg-red-500 text-white animate-shake' :
                isCompleted ? 'bg-green-500 text-white rotate-[360deg]' : 
                isActive ? 'bg-primary-600 text-white shadow-lg shadow-primary-200 scale-125' : 'bg-white border-2 border-gray-100 text-gray-300'
              }`}>
                {isError ? <XCircle size={20} /> : isCompleted ? <Check size={20} /> : <span className="font-medium text-sm">{idx + 1}</span>}
              </div>
              <span className={`text-[10px] uppercase tracking-wide mt-4 font-semibold transition-colors ${isError ? 'text-red-500' : isActive ? 'text-primary-600' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden min-h-[500px] flex items-stretch">
        {/* Left Side: Context / Instructions */}
        <div className="hidden lg:flex w-80 bg-gray-50 border-r border-gray-100 p-10 flex-col">
          <div className="bg-primary-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-primary-100">
            <AlertCircle size={24} />
          </div>
          <h4 className="text-xl font-medium text-gray-900 mb-4">Instructions</h4>
          <div className="space-y-6 flex-1 text-left">
            <div className={`transition-opacity duration-200 ${step === 'id' || step === 'error' ? 'opacity-100' : 'opacity-30'}`}>
              <p className="text-xs font-medium text-primary-600 uppercase mb-1">Step 1</p>
              <p className="text-sm text-gray-600 leading-relaxed font-medium">Verify your identity with the Polling Officer using your EPIC or ID.</p>
            </div>
            <div className={`transition-opacity duration-200 ${step === 'ink' ? 'opacity-100' : 'opacity-30'}`}>
              <p className="text-xs font-medium text-primary-600 uppercase mb-1">Step 2</p>
              <p className="text-sm text-gray-600 leading-relaxed font-medium">Get the indelible ink mark on your finger and sign the register.</p>
            </div>
            <div className={`transition-opacity duration-200 ${step === 'voting' ? 'opacity-100' : 'opacity-30'}`}>
              <p className="text-xs font-medium text-primary-600 uppercase mb-1">Step 3</p>
              <p className="text-sm text-gray-600 leading-relaxed font-medium">Select your candidate on the EVM. Watch the VVPAT for confirmation.</p>
            </div>
          </div>
          <div className="pt-6 border-t border-gray-100">
            <div className="flex items-center gap-2 text-gray-400">
              <Volume2 size={16} />
              <span className="text-[10px] font-medium uppercase tracking-wide text-left">Audio Feedback Enabled</span>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Area */}
        <div className="flex-1 relative bg-white flex flex-col" role="region" aria-live="polite" aria-label="Current Simulation Step">
          {/* Action Header for Steps (Back Button) */}
          {['id', 'ink', 'voting'].includes(step) && (
            <div className="p-4 border-b border-gray-50 flex justify-start">
               {step === 'ink' && (
                 <button 
                   onClick={() => setStep('id')} 
                   aria-label="Back to Identity Verification"
                   className="text-xs font-medium text-gray-400 hover:text-primary-600 flex items-center gap-1 transition-colors rounded outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:text-primary-600 px-2 py-1"
                 >
                   <RotateCcw size={14} className="-scale-x-100" /> Back to Verification
                 </button>
               )}
               {step === 'voting' && (
                 <button 
                   onClick={() => setStep('ink')} 
                   aria-label="Back to Inking Stage"
                   className="text-xs font-medium text-gray-400 hover:text-primary-600 flex items-center gap-1 transition-colors rounded outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:text-primary-600 px-2 py-1"
                 >
                   <RotateCcw size={14} className="-scale-x-100" /> Back to Inking
                 </button>
               )}
            </div>
          )}

          <div className="flex-1 relative">
            {step === 'id' && (
            <div className="p-12 h-full flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-primary-50 w-24 h-24 rounded-2xl flex items-center justify-center mb-8 rotate-3 shadow-sm">
                <Monitor className="text-primary-600" size={40} />
              </div>
              <h3 className="text-3xl font-semibold text-gray-900 mb-4 tracking-tight">Identity Verification</h3>
              <p className="text-gray-500 font-medium mb-8 max-w-sm">Officer 1 will check your name in the Electoral Roll and announce it loudly.</p>
              
              <div className="flex flex-col gap-4 w-full max-w-sm">
                <Button 
                  onClick={handleIdentityConfirm}
                  size="lg"
                  className="w-full relative shadow-md shadow-primary-100"
                >
                  Confirm Verification
                </Button>
                
                <Button 
                  variant="outline"
                  size="lg"
                  onClick={() => setSimulatingError(!simulatingError)}
                  className={`w-full flex items-center justify-center gap-2 transition-all duration-200 ease-in-out ${
                    simulatingError ? 'bg-red-50 text-red-600 border-red-200' : 'bg-gray-50 text-gray-400 border-gray-100'
                  }`}
                >
                  <ShieldAlert size={14} />
                  {simulatingError ? 'Simulating: Name Missing' : 'Test Edge Case: Name Missing'}
                </Button>
              </div>
            </div>
          )}

          {step === 'error' && (
            <div className="p-12 h-full flex flex-col items-center justify-center text-center animate-in shake duration-200">
              <div className="bg-red-50 w-24 h-24 rounded-2xl flex items-center justify-center mb-8 rotate-3 shadow-sm text-red-600">
                <XCircle size={48} />
              </div>
              <h3 className="text-3xl font-semibold text-gray-900 mb-4 tracking-tight">Name Not Found!</h3>
              <p className="text-gray-500 font-medium mb-10 max-w-sm">
                Your name was not found in the Electoral Roll for this booth. 
                <br /><br />
                <span className="text-red-600 font-medium">Action Required:</span> Visit the Help Desk or speak with the Presiding Officer. You cannot vote if your name is missing from the list.
              </p>
              <Button 
                onClick={reset}
                variant="secondary"
                size="lg"
                className="shadow-md"
              >
                Go Back & Try Again
              </Button>
            </div>
          )}

          {step === 'ink' && (
            <div className="p-12 h-full flex flex-col items-center justify-center text-center animate-in slide-in-from-right-12 duration-200">
              <div className="bg-purple-50 w-24 h-24 rounded-2xl flex items-center justify-center mb-8 -rotate-3 shadow-sm">
                <Fingerprint className="text-purple-600" size={40} />
              </div>
              <h3 className="text-3xl font-semibold text-gray-900 mb-4 tracking-tight">Indelible Inking</h3>
              <p className="text-gray-500 font-medium mb-10 max-w-sm">Officer 2 will apply the mark to your left forefinger and take your signature.</p>
              <Button 
                onClick={() => setStep('voting')}
                size="lg"
                className="bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-100 group"
              >
                Sign & Continue
              </Button>
            </div>
          )}

          {step === 'voting' && (
            <div className="p-8 h-full animate-in slide-in-from-bottom-12 duration-300">
              <div className="flex flex-col xl:flex-row gap-10 h-full">
                {/* EVM Section */}
                <div className="flex-1 flex flex-col">
                  <div className="bg-slate-800 rounded-2xl p-8 shadow-lg relative border-4 border-slate-700">
                    <div className="flex justify-between items-center mb-8">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-3 bg-slate-900 rounded-full border border-slate-700 shadow-sm" />
                        <h4 className="text-slate-500 font-semibold uppercase tracking-wide text-[10px]">Ballot Unit (BU)</h4>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-medium text-green-500 uppercase animate-pulse">Ready to Poll</span>
                        <div className="w-4 h-4 rounded-full bg-green-500 shadow-[0_0_20px_rgba(34,197,94,1)]" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      {electionData.mockBallot.candidates.map((candidate) => (
                        <div key={candidate.id} className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between border-2 border-transparent hover:border-primary-400 focus-visible:ring-2 focus-visible:ring-primary-500 transition-all duration-200 ease-in-out shadow-sm">
                          <div className="flex items-center gap-4 text-left">
                            <span className="text-2xl font-semibold text-slate-300 w-8">{candidate.id}</span>
                            <div className="w-px h-10 bg-slate-200 mx-2" />
                            <div>
                              <div className="font-medium text-slate-900 text-lg">{candidate.name}</div>
                              <div className="text-[10px] text-primary-600 font-semibold uppercase tracking-tighter">{candidate.focus}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-8">
                            <span className="text-3xl filter grayscale group-hover:grayscale-0">{candidate.symbol}</span>
                            <button 
                              onClick={() => handleVote(candidate)}
                              className="w-12 h-12 bg-primary-600 text-white rounded-xl flex items-center justify-center outline-none focus:ring-4 focus:ring-offset-2 focus:ring-primary-500 hover:bg-primary-700 active:translate-y-1 transition-all duration-200 ease-in-out shadow-lg"
                              aria-label={`Vote for ${candidate.name}`}
                              title={`Vote for ${candidate.name}`}
                            >
                              <div className="w-6 h-6 rounded-full border-2 border-white/40" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* VVPAT Section */}
                <div className="w-full xl:w-72 flex flex-col">
                  <div className="bg-gray-100 rounded-2xl p-8 border-b-[12px] border-gray-300 shadow-md flex-1 relative">
                    <h4 className="text-gray-400 font-semibold uppercase tracking-wide text-[10px] mb-6">VVPAT System</h4>
                    <div className="bg-black rounded-2xl aspect-[3/4] flex items-center justify-center overflow-hidden border-8 border-gray-400 shadow-sm relative">
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
                      <div className="bg-gray-900/50 w-full h-full flex flex-col items-center justify-center gap-1 opacity-20 text-center">
                         <div className="w-12 h-0.5 bg-gray-700" />
                         <div className="w-12 h-0.5 bg-gray-700" />
                         <div className="w-12 h-0.5 bg-gray-700" />
                      </div>
                    </div>
                    <div className="mt-8 text-center">
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Verification Window</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'vvpat' && (
            <div className="p-8 h-full">
              <div className="flex flex-col xl:flex-row gap-10 h-full">
                {/* Disabled EVM */}
                <div className="flex-1 opacity-40 grayscale pointer-events-none">
                  <div className="bg-slate-800 rounded-2xl p-8 shadow-lg relative border-4 border-slate-700">
                    <div className="flex justify-between items-center mb-8">
                      <div className="w-10 h-3 bg-slate-900 rounded-full" />
                      <div className={`w-4 h-4 rounded-full ${isBeeping ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,1)]' : 'bg-slate-600'}`} />
                    </div>
                    <div className="space-y-3">
                      {electionData.mockBallot.candidates.map((c) => (
                        <div key={c.id} className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between">
                          <div className="flex items-center gap-4 text-left">
                            <span className="text-2xl font-semibold text-slate-300 w-8">{c.id}</span>
                            <div className="font-medium text-slate-900 text-lg">{c.name}</div>
                          </div>
                          <span className="text-3xl">{c.symbol}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Active VVPAT */}
                <div className="w-full xl:w-72">
                  <div className="bg-gray-100 rounded-2xl p-8 border-b-[12px] border-gray-300 shadow-lg h-full flex flex-col">
                    <h4 className="text-gray-400 font-semibold uppercase tracking-wide text-[10px] mb-6 text-center">VVPAT System</h4>
                    <div className="bg-black rounded-2xl aspect-[3/4] flex items-center justify-center overflow-hidden border-8 border-gray-400 shadow-lg relative">
                      {vvpatVisible && (
                        <div className="bg-white w-4/5 h-4/5 p-6 flex flex-col items-center justify-between animate-[slipDown_1s_ease-out] shadow-lg">
                          <div className="w-full flex justify-between items-start border-b border-gray-100 pb-2">
                             <div className="text-[8px] font-medium text-gray-300">ECI - FORM 17A</div>
                             <div className="text-[8px] font-medium text-gray-300">#{selectedCandidate?.id}</div>
                          </div>
                          <div className="flex-1 flex flex-col items-center justify-center">
                            <div className="text-5xl mb-3">{selectedCandidate?.symbol}</div>
                            <div className="font-semibold text-sm text-center uppercase tracking-tight">{selectedCandidate?.name}</div>
                          </div>
                          <div className="w-full text-center border-t border-gray-100 pt-2">
                            <div className="text-[8px] font-semibold text-primary-600 uppercase tracking-wide">Vote Verified</div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="mt-8 text-center">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-[10px] font-semibold rounded-full shadow-lg shadow-red-100 animate-pulse uppercase tracking-wide">
                        Don't Leave Booth (7s)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'finished' && (
            <div className="p-12 h-full flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-300">
              <div className="bg-green-50 w-24 h-24 rounded-full flex items-center justify-center mb-8 shadow-sm">
                <Check className="text-green-600" size={40} />
              </div>
              <h3 className="text-4xl font-semibold text-gray-900 mb-4 tracking-tight">Vote Successfully Cast!</h3>
              <p className="text-gray-500 font-medium mb-12 max-w-sm">The loud <span className="text-primary-600 font-medium">BEEP</span> confirmed your vote was stored in the secure Control Unit.</p>
              
              <div className="bg-gray-50 border border-gray-100 p-8 rounded-xl mb-12 w-full max-w-sm flex items-center gap-6 shadow-sm text-left">
                <div className="text-5xl bg-white w-20 h-20 rounded-2xl flex items-center justify-center shadow-sm">
                  {selectedCandidate?.symbol}
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Your Vote</div>
                  <div className="font-semibold text-xl text-gray-900">{selectedCandidate?.name}</div>
                  <div className="text-sm font-medium text-primary-600">{selectedCandidate?.focus}</div>
                </div>
              </div>

              <button 
                onClick={reset}
                aria-label="Reset EVM Simulation"
                className="flex items-center gap-2 text-gray-400 font-medium hover:text-primary-600 transition-colors uppercase text-xs tracking-wide rounded outline-none focus-visible:ring-2 focus-visible:ring-primary-500 px-3 py-2"
              >
                <RotateCcw size={16} /> Reset Simulation
              </button>
            </div>
          )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slipDown {
          0% { transform: translateY(-120%); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
      `}</style>
    </div>
  );
};
