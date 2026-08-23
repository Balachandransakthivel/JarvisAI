import { useState } from 'react';
import { Send, Mic, MicOff, Volume2, Terminal as TermIcon, ChevronRight } from 'lucide-react';
import { useJarvis } from '@/hooks/useJarvis';
import { ChatMessages } from '@/components/features/ChatMessages';

interface CommandFeedProps {
  onClose: () => void;
}

export function CommandFeed({ onClose }: CommandFeedProps) {
  const {
    messages,
    listeningState,
    interimText,
    isSupported,
    isSpeaking,
    activateListen,
    deactivateListen,
    handleCommand,
  } = useJarvis();

  const [textInput, setTextInput] = useState('');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    handleCommand(textInput);
    setTextInput('');
  };

  return (
    <div className="w-full h-full flex flex-col bg-[rgba(10,8,6,0.78)] backdrop-blur-xl relative z-10">
      
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#ff730020] flex items-center justify-between flex-shrink-0 bg-[rgba(16,10,5,0.2)]">
        <div className="flex items-center gap-2">
          <TermIcon className="w-3.5 h-3.5 text-[#ff7300]" />
          <span className="text-[10px] font-display font-bold text-[#ff7300] uppercase tracking-widest text-glow-orange">
            COMMAND FEED
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Actionable Mic Button */}
          <button
            type="button"
            onClick={listeningState === 'listening' ? deactivateListen : activateListen}
            disabled={!isSupported}
            className={`p-1.5 rounded-md border transition-all duration-300 flex items-center justify-center ${
              listeningState === 'listening'
                ? 'bg-[#ff730015] border-[#ff730040] text-[#ffb700] hover:bg-[#ff730025]'
                : 'bg-transparent border-transparent text-[#ff7300] hover:bg-[#ff730010] hover:border-[#ff730020]'
            }`}
            title={
              !isSupported
                ? 'Voice Recognition Unsupported'
                : listeningState === 'listening'
                ? 'Stop Voice Listening'
                : 'Start Voice Listening'
            }
          >
            {isSupported ? (
              <Mic className={`w-3.5 h-3.5 ${listeningState === 'listening' ? 'animate-pulse' : ''}`} />
            ) : (
              <MicOff className="w-3.5 h-3.5 text-[#ff3333]" />
            )}
          </button>

          {isSpeaking && (
            <div className="flex items-center justify-center p-1.5 rounded-md bg-[#ffb70010] border border-[#ffb70020]">
              <Volume2 className="w-3.5 h-3.5 text-[#ffb700] animate-pulse" />
            </div>
          )}

          <span className="text-[9px] font-mono text-[#ff8c00] bg-[rgba(255,115,0,0.1)] border border-[#ff730030] px-1.5 py-0.5 rounded">
            SEC: {messages.length}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md border border-transparent hover:bg-[#ff730010] hover:border-[#ff730020] text-[#ff7300] hover:text-[#ffb700] transition-all flex items-center justify-center"
            title="Collapse Command Feed"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto min-h-0 bg-[rgba(5,4,4,0.3)]">
        <ChatMessages messages={messages} interimText={interimText} />
      </div>

      {/* Command Feed Input Form */}
      <form onSubmit={onSubmit} className="p-3 border-t border-[#ff730020] bg-[rgba(16,10,5,0.45)] relative">
        <div className="flex gap-2 relative z-10">
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#ff7300] font-mono text-[10px] font-extrabold select-none">
              $
            </span>
            <input
              type="text"
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              placeholder="Direct command..."
              className="w-full bg-[#05040470] border border-[#ff730025] rounded pl-6 pr-2 py-1.5 text-[11px] font-mono text-[#ffd8b8] placeholder-[rgba(255,140,0,0.2)] focus:outline-none focus:border-[#ff730055] transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={!textInput.trim()}
            className="px-3 rounded bg-[#ff730015] border border-[#ff730030] text-[#ff7300] hover:bg-[#ff730025] hover:text-white transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
