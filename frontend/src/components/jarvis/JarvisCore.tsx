import React from 'react';
import { motion } from 'framer-motion';
import type { ListeningState, AgentPlanStep } from '@/types';
import { Activity, ShieldAlert, Cpu, CheckCircle2, Loader2, Volume2 } from 'lucide-react';

interface JarvisCoreProps {
  state: ListeningState;
  activePlanSteps?: AgentPlanStep[];
  onActivate?: () => void;
  onDeactivate?: () => void;
  isSupported?: boolean;
}

export const JarvisCore: React.FC<JarvisCoreProps> = ({
  state,
  activePlanSteps = [],
  onActivate,
  onDeactivate,
  isSupported = true
}) => {
  const isListening = state === 'listening' || state === 'wake-word';
  const isThinking = state === 'processing' || state === 'thinking';
  const isExecuting = state === 'executing';
  const isSpeaking = state === 'speaking';
  const isError = state === 'error';

  const handleClick = () => {
    if (isListening || isSpeaking || isExecuting) {
      onDeactivate?.();
    } else {
      onActivate?.();
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      {/* Dynamic Background Halo Pulse */}
      <motion.div
        animate={{
          scale: isListening ? [1, 1.35, 1.15] : isThinking ? [1, 1.2, 1] : isSpeaking ? [1, 1.25, 1.05] : [1, 1.08, 1],
          opacity: isListening ? [0.4, 0.8, 0.5] : isThinking ? [0.3, 0.7, 0.4] : 0.25,
        }}
        transition={{ repeat: Infinity, duration: isListening ? 1.8 : isThinking ? 1.2 : 3, ease: "easeInOut" }}
        className={`absolute w-72 h-72 rounded-full blur-3xl ${
          isListening ? 'bg-[#00d4ff]/30' : isThinking ? 'bg-[#ff7300]/30' : isError ? 'bg-[#ff3300]/40' : 'bg-[#ff7300]/15'
        }`}
      />

      {/* Rotating Outer Radial Ring 1 */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: isThinking ? 4 : 20, ease: "linear" }}
        className={`w-64 h-64 rounded-full border border-dashed flex items-center justify-center p-2 relative ${
          isListening ? 'border-[#00d4ff]/60 shadow-[0_0_25px_rgba(0,212,255,0.3)]' :
          isThinking ? 'border-[#ff7300]/80 shadow-[0_0_25px_rgba(255,115,0,0.4)]' :
          isError ? 'border-[#ff3300]' : 'border-[#ff7300]/30'
        }`}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#ff7300] shadow-[0_0_8px_#ff7300]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 rounded-full bg-[#00d4ff] shadow-[0_0_8px_#00d4ff]" />
      </motion.div>

      {/* Rotating Inner Counter Ring 2 */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: isThinking ? 3 : 15, ease: "linear" }}
        className="absolute w-52 h-52 rounded-full border border-dotted border-[#ffb700]/40"
      />

      {/* Audio Visualizer Waveform Ring around Core when Speaking */}
      {isSpeaking && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {[...Array(16)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ height: [8, Math.random() * 45 + 15, 8] }}
              transition={{ repeat: Infinity, duration: 0.4 + (i % 4) * 0.1, ease: 'easeInOut' }}
              className="w-1 bg-[#00d4ff] rounded-full mx-1 shadow-[0_0_10px_#00d4ff]"
            />
          ))}
        </div>
      )}

      {/* Main Interactive Holographic Core Orb Button */}
      <motion.button
        onClick={handleClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          scale: isListening ? 1.15 : isThinking ? 1.05 : 1,
        }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className={`relative z-10 w-44 h-44 rounded-full flex flex-col items-center justify-center border-2 backdrop-blur-xl transition-all duration-500 cursor-pointer shadow-2xl ${
          isListening ? 'bg-[#002844]/80 border-[#00d4ff] shadow-[0_0_45px_rgba(0,212,255,0.6)]' :
          isThinking ? 'bg-[#3d1800]/80 border-[#ff7300] shadow-[0_0_45px_rgba(255,115,0,0.6)]' :
          isExecuting ? 'bg-[#152000]/80 border-[#a8ff00] shadow-[0_0_45px_rgba(168,255,0,0.5)]' :
          isError ? 'bg-[#3d0000]/80 border-[#ff3300] shadow-[0_0_45px_rgba(255,51,0,0.6)]' :
          'bg-[rgba(15,10,6,0.85)] border-[#ff7300]/40 hover:border-[#ff7300]/80 shadow-[0_0_30px_rgba(255,115,0,0.2)]'
        }`}
      >
        {/* Core State Display Icon & Text */}
        {isListening ? (
          <div className="flex flex-col items-center space-y-2 text-[#00d4ff]">
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
              <Activity className="w-10 h-10 animate-pulse text-glow-cyan" />
            </motion.div>
            <span className="text-[11px] font-display font-black tracking-[0.25em] uppercase">LISTENING</span>
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] animate-ping" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff]" />
            </div>
          </div>
        ) : isThinking ? (
          <div className="flex flex-col items-center space-y-2 text-[#ff7300]">
            <Loader2 className="w-10 h-10 animate-spin text-glow-orange" />
            <span className="text-[11px] font-display font-black tracking-[0.25em] uppercase">THINKING</span>
            <span className="text-[9px] font-mono text-[#ffb700] tracking-widest">⟳ ◉ ⟳</span>
          </div>
        ) : isExecuting ? (
          <div className="flex flex-col items-center space-y-2 text-[#a8ff00]">
            <Cpu className="w-10 h-10 animate-bounce" />
            <span className="text-[11px] font-display font-black tracking-[0.25em] uppercase">EXECUTING</span>
            <span className="text-[8px] font-mono text-[#a8ff00] uppercase tracking-widest">AGENT ACTION</span>
          </div>
        ) : isSpeaking ? (
          <div className="flex flex-col items-center space-y-2 text-[#00d4ff]">
            <Volume2 className="w-10 h-10 animate-pulse" />
            <span className="text-[11px] font-display font-black tracking-[0.25em] uppercase">SPEAKING</span>
            <span className="text-[8px] font-mono text-[#00d4ff] uppercase">AUDIO OUTPUT</span>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center space-y-2 text-[#ff3300]">
            <ShieldAlert className="w-10 h-10 animate-bounce" />
            <span className="text-[11px] font-display font-black tracking-[0.25em] uppercase">ERROR</span>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2 text-[#ff7300] hover:text-[#ffb700] transition-colors">
            <div className="text-xl font-display tracking-widest text-glow-orange flex items-center gap-1 font-extrabold">
              ◉ ◉
            </div>
            <span className="text-[12px] font-display font-black tracking-[0.3em] uppercase">JARVIS</span>
            <span className="text-[8.5px] font-mono text-[#ff8c00] opacity-80 uppercase tracking-wider">
              {isSupported ? 'CLICK TO SPEAK' : 'TERMINAL READY'}
            </span>
          </div>
        )}
      </motion.button>

      {/* Execution Tree Breakdown Overlay (Action Timeline breakdown requirement) */}
      {activePlanSteps.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 w-full max-w-md glass-hud rounded-lg p-3 border border-[#ff7300]/30 font-mono text-[10px]"
        >
          <div className="flex items-center justify-between text-[#ff7300] font-bold uppercase tracking-wider mb-2 pb-1 border-b border-[#ff7300]/20">
            <span>JARVIS EXECUTING PLAN</span>
            <span className="text-[#a8ff00]">{activePlanSteps.filter(s => s.status === 'completed').length}/{activePlanSteps.length}</span>
          </div>
          <div className="space-y-1 text-[#ffd8b8]">
            {activePlanSteps.map((step, idx) => (
              <div key={idx} className="flex items-center justify-between gap-2">
                <span className="truncate">
                  {idx === activePlanSteps.length - 1 ? '└─ ' : '├─ '}
                  {step.description}
                </span>
                {step.status === 'completed' ? (
                  <CheckCircle2 className="w-3 h-3 text-[#a8ff00] flex-shrink-0" />
                ) : step.status === 'started' ? (
                  <Loader2 className="w-3 h-3 text-[#00d4ff] animate-spin flex-shrink-0" />
                ) : (
                  <span className="text-gray-500 text-[8px]">PENDING</span>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};
