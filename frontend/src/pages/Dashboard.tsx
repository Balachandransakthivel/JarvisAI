import { useState, useEffect } from 'react';
import { Send, VolumeX, Shield, Radio, Activity, Cpu, HardDrive, Smartphone, Sparkles } from 'lucide-react';
import { JarvisCore } from '@/components/jarvis/JarvisCore';
import { SystemBar } from '@/components/features/SystemBar';
import { Card3D } from '@/components/ui/Card3D';
import { useJarvis } from '@/hooks/useJarvis';
import { useSystemStats } from '@/hooks/useSystemStats';
import type { AgentPlanStep } from '@/types';

export default function Dashboard() {
  const [textInput, setTextInput] = useState('');
  const [activePlanSteps, setActivePlanSteps] = useState<AgentPlanStep[]>([]);
  const {
    listeningState, isSupported, isSpeaking,
    activateListen, deactivateListen, handleCommand, settings,
  } = useJarvis();
  const stats = useSystemStats();

  // Listen to WebSocket agent events for real-time action breakdown HUD updates
  useEffect(() => {
    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket('ws://localhost:8000/api/ws');
      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.event === 'agent.plan') {
            const steps = data.plan?.steps || [];
            setActivePlanSteps(steps.map((s: any) => ({ ...s, status: 'pending' })));
          } else if (data.event === 'tool.started') {
            setActivePlanSteps(prev => prev.map(s => s.tool === data.tool ? { ...s, status: 'started' } : s));
          } else if (data.event === 'tool.completed') {
            setActivePlanSteps(prev => prev.map(s => s.tool === data.tool ? { ...s, status: 'completed' } : s));
          } else if (data.event === 'agent.completed') {
            setTimeout(() => setActivePlanSteps([]), 4000);
          }
        } catch {
          // ignore
        }
      };
    } catch {
      // WS error
    }
    return () => {
      ws?.close();
    };
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    handleCommand(textInput);
    setTextInput('');
  };

  const date = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const quickCommands = [
    'Open Chrome and search weather',
    'Take a screenshot',
    'Open YouTube',
    'Check my connected phones',
    'Lock workstation',
  ];

  return (
    <div className="flex flex-col h-full bg-[#050404] scan-overlay relative">
      {/* Top dashboard HUD bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[#0d2238] bg-[rgba(8,6,4,0.65)] backdrop-blur-md flex-shrink-0 z-10">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00d4ff] opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00d4ff]" style={{ boxShadow: '0 0 6px #00d4ff' }} />
          </span>
          <span className="text-[10px] font-display font-bold text-[#00d4ff] uppercase tracking-[0.2em] text-glow-cyan">
            JARVIS REASONING ENGINE ONLINE
          </span>
        </div>
        
        {/* Telemetry Bar Readout */}
        <div className="hidden md:flex items-center gap-6 text-[9.5px] font-mono text-[#ff8c00] tracking-wider">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-[#ff7300]" />
            <span>CPU {stats.cpu}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-[#ffb700]" />
            <span>RAM {stats.ram}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-[#00d4ff]" />
            <span>DEVICES 3</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#a8ff00]">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>AI ENGINE ●</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-[10px] font-mono text-[#ff8c00] tracking-wide uppercase opacity-70">{date}</div>
          {isSpeaking && (
            <button
              onClick={deactivateListen}
              className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono text-[#ffb700] border border-[#ffb70040] bg-[#ffb70010] rounded hover:bg-[#ffb70020] transition-all duration-300"
            >
              <VolumeX className="w-3 h-3" />
              MUTE
            </button>
          )}
        </div>
      </div>

      {/* Main panel */}
      <div className="flex-1 flex min-h-0 relative z-0">
        
        {/* Center: Visual Holographic Reel Area */}
        <div className="flex-1 flex flex-col items-center justify-between hex-grid relative px-6 py-6 overflow-y-auto">
          
          {/* Sci-Fi Brackets */}
          <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-[#ff730025] pointer-events-none" />
          <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-[#ff730025] pointer-events-none" />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-[#ff730025] pointer-events-none" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-[#ff730025] pointer-events-none" />

          {/* Core HUD Header Label */}
          <div className="text-[9px] font-display font-semibold text-[#8a4a22] tracking-[0.4em] uppercase">
            JARVIS CENTRAL INTERFACE EMITTER
          </div>

          <div className="absolute left-6 top-1/3 text-[8px] font-mono text-[#8a4a22] space-y-1 hidden lg:block opacity-60">
            <p>LATENCY: 4MS</p>
            <p>REFRESH: 144HZ</p>
            <p>AGENT ENGINE: ACTIVE</p>
          </div>

          <div className="absolute right-6 top-1/3 text-[8px] font-mono text-[#8a4a22] text-right space-y-1 hidden lg:block opacity-60">
            <p>OPERATOR: {settings.userName || 'BALA'}</p>
            <p>PROVIDER: {settings.aiProvider || 'GEMINI'}</p>
            <p>SYSTEM: ONLINE</p>
          </div>

          {/* Central AI Core Component */}
          <div className="flex-1 flex items-center justify-center my-2">
            <JarvisCore
              state={listeningState}
              activePlanSteps={activePlanSteps}
              onActivate={activateListen}
              onDeactivate={deactivateListen}
              isSupported={isSupported}
            />
          </div>

          {/* Controls: Directives & Console Input */}
          <div className="w-full max-w-xl space-y-3 z-10 mt-2">
            <Card3D className="w-full" glowColor="#ff8c00">
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-1.5 text-[9px] font-mono text-[#ff8c00] uppercase tracking-widest font-semibold">
                  <Activity className="w-3.5 h-3.5 animate-pulse" />
                  JARVIS AGENT DIRECTIVES
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {quickCommands.map(cmd => (
                    <button
                      key={cmd}
                      onClick={() => handleCommand(cmd)}
                      className="px-3 py-1 text-[9.5px] font-mono text-[#e5dacb] border border-[#ff730025] rounded-md bg-[rgba(16,10,5,0.4)] hover:text-[#ff8c00] hover:border-[#ff8c0045] hover:bg-[#ff8c000a] transition-all duration-300 transform active:scale-95"
                    >
                      {cmd}
                    </button>
                  ))}
                </div>
              </div>
            </Card3D>

            {/* Terminal Input */}
            <form onSubmit={onSubmit} className="w-full glass-hud rounded-lg p-2.5 relative">
              <div className="flex gap-2.5 relative z-10">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#ff7300] font-mono text-[11px] font-extrabold select-none">
                    $
                  </span>
                  <input
                    type="text"
                    value={textInput}
                    onChange={e => setTextInput(e.target.value)}
                    placeholder='Give JARVIS a command (e.g. "Open Chrome and search weather")...'
                    className="w-full bg-transparent border-b border-[#ff730025] pl-8 pr-12 py-1.5 text-[11.5px] font-mono text-[#ffd8b8] placeholder-[rgba(255,140,0,0.3)] focus:outline-none focus:border-[#ff730055] transition-all"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[8px] font-mono text-[#ff8c00] opacity-50 uppercase tracking-widest">
                    [exec]
                  </span>
                </div>
                <button
                  type="submit"
                  disabled={!textInput.trim()}
                  className="w-8 h-8 rounded-md flex items-center justify-center bg-[#ff730015] border border-[#ff730030] text-[#ff7300] hover:bg-[#ff730025] hover:text-white transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed transform active:scale-95 flex-shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* System status dashboard telemetry bar */}
      <SystemBar stats={stats} />
    </div>
  );
}
