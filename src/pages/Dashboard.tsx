import { useState } from 'react';
import { Send, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { VoiceOrb } from '@/components/features/VoiceOrb';
import { ChatMessages } from '@/components/features/ChatMessages';
import { SystemBar } from '@/components/features/SystemBar';
import { useJarvis } from '@/hooks/useJarvis';
import { useSystemStats } from '@/hooks/useSystemStats';

export default function Dashboard() {
  const [textInput, setTextInput] = useState('');
  const {
    messages, listeningState, interimText, isSupported, isSpeaking,
    activateListen, deactivateListen, handleCommand, speak, settings,
  } = useJarvis();
  const stats = useSystemStats();

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
    'Open YouTube', 'Search React', 'What time is it?', 'Tell me a joke',
  ];

  return (
    <div className="flex flex-col h-full bg-[#050810]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-[#0d1f35] bg-[#080c18] flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff88] opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ff88]" style={{ boxShadow: '0 0 4px #00ff88' }} />
          </span>
          <span className="text-[10px] font-mono text-[#3a7a5a] uppercase tracking-widest">
            System Operational
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-[10px] font-mono text-[#2a4a5a]">{date}</div>
          {isSpeaking && (
            <button
              onClick={() => window.speechSynthesis?.cancel()}
              className="flex items-center gap-1 px-2 py-1 text-[10px] font-mono text-[#ffcc00] border border-[#ffcc0030] rounded hover:bg-[#ffcc0010] transition-all"
            >
              <VolumeX className="w-3 h-3" />
              Stop
            </button>
          )}
        </div>
      </div>

      {/* Main panel */}
      <div className="flex-1 flex min-h-0">
        {/* Center: Orb + quick commands */}
        <div className="flex-1 flex flex-col items-center justify-center hex-grid scan-overlay relative">
          {/* Corner brackets */}
          <div className="absolute top-4 left-4 w-8 h-8 border-l border-t border-[#00d4ff15] pointer-events-none" />
          <div className="absolute top-4 right-4 w-8 h-8 border-r border-t border-[#00d4ff15] pointer-events-none" />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-l border-b border-[#00d4ff15] pointer-events-none" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-r border-b border-[#00d4ff15] pointer-events-none" />

          {/* Top-left system label */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[9px] font-mono text-[#1a3a4a] tracking-[0.3em] uppercase">
            VOICE INTERFACE
          </div>

          <VoiceOrb
            state={listeningState}
            onActivate={activateListen}
            onDeactivate={deactivateListen}
            isSupported={isSupported}
          />

          {/* Quick commands */}
          <div className="mt-6 flex flex-wrap gap-2 justify-center px-8">
            {quickCommands.map(cmd => (
              <button
                key={cmd}
                onClick={() => handleCommand(cmd)}
                className="px-3 py-1.5 text-[10px] font-mono text-[#3a7a8a] border border-[#0d1f35] rounded hover:text-[#00d4ff] hover:border-[#00d4ff30] hover:bg-[#00d4ff08] transition-all"
              >
                {cmd}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Chat panel */}
        <div className="w-72 lg:w-80 border-l border-[#0d1f35] flex flex-col bg-[#080c18] flex-shrink-0">
          {/* Chat header */}
          <div className="px-4 py-3 border-b border-[#0d1f35] flex items-center justify-between flex-shrink-0">
            <span className="text-[10px] font-mono text-[#3a6a7a] uppercase tracking-widest">
              Communications
            </span>
            <div className="flex items-center gap-2">
              {isSupported ? (
                <Mic className="w-3 h-3 text-[#00d4ff]" />
              ) : (
                <MicOff className="w-3 h-3 text-[#3a6a7a]" />
              )}
              {isSpeaking && <Volume2 className="w-3 h-3 text-[#00ff88] animate-pulse" />}
              <span className="text-[9px] text-[#2a4a5a] font-mono">{messages.length}</span>
            </div>
          </div>

          {/* Messages */}
          <ChatMessages messages={messages} interimText={interimText} />

          {/* Text input */}
          <form onSubmit={onSubmit} className="p-3 border-t border-[#0d1f35] flex-shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                placeholder="Type a command..."
                className="flex-1 bg-[#050810] border border-[#0d1f35] rounded px-3 py-2 text-[11px] font-mono text-[#a8d8e8] placeholder-[#1a3a4a] focus:outline-none focus:border-[#00d4ff30] transition-colors"
              />
              <button
                type="submit"
                disabled={!textInput.trim()}
                className="w-8 h-8 rounded flex items-center justify-center bg-[#00d4ff12] border border-[#00d4ff25] text-[#00d4ff] hover:bg-[#00d4ff20] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* System bar */}
      <SystemBar stats={stats} />
    </div>
  );
}
