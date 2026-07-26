import { useEffect, useRef } from 'react';
import type { Message } from '@/types';
import { cn } from '@/lib/utils';

interface ChatMessagesProps {
  messages: Message[];
  interimText: string;
}

const INTENT_COLORS: Record<string, string> = {
  boot: '#3a6a7a',
  greeting: '#00d4ff',
  time: '#00d4ff',
  date: '#00d4ff',
  open_website: '#00ff88',
  search: '#00ff88',
  youtube_search: '#ff4444',
  memory_set: '#ffcc00',
  memory_get: '#ffcc00',
  math: '#a78bfa',
  joke: '#fb923c',
  identity: '#00d4ff',
  capabilities: '#00d4ff',
  unknown: '#3a6a7a',
};

export function ChatMessages({ messages, interimText }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, interimText]);

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
      {messages.map(msg => {
        const isUser = msg.role === 'user';
        const intentColor = msg.intent ? (INTENT_COLORS[msg.intent] ?? '#3a6a7a') : '#3a6a7a';

        return (
          <div key={msg.id} className={cn('flex gap-2', isUser ? 'flex-row-reverse' : 'flex-row')}>
            {/* Avatar */}
            <div
              className={cn(
                'w-6 h-6 rounded flex-shrink-0 flex items-center justify-center',
                'text-[9px] font-display font-bold mt-0.5 border',
                isUser
                  ? 'bg-[#0050ff15] border-[#0050ff30] text-[#4488ff]'
                  : 'bg-[#00d4ff12] border-[#00d4ff30] text-[#00d4ff]'
              )}
              style={isUser ? {} : { boxShadow: '0 0 6px rgba(0,212,255,0.15)' }}
            >
              {isUser ? 'U' : 'J'}
            </div>

            {/* Bubble */}
            <div
              className={cn(
                'max-w-[84%] rounded-lg px-3 py-2 border',
                isUser
                  ? 'bg-[#0050ff0a] border-[#0050ff25]'
                  : 'bg-[#00d4ff06] border-[#00d4ff18]'
              )}
            >
              {/* Intent tag for JARVIS */}
              {!isUser && msg.intent && msg.intent !== 'boot' && (
                <div
                  className="text-[8px] font-mono uppercase tracking-widest mb-1 opacity-60"
                  style={{ color: intentColor }}
                >
                  {msg.intent.replace(/_/g, ' ')}
                </div>
              )}
              <p className="text-[12px] font-mono leading-relaxed text-[#a8d8e8]">
                {msg.content}
              </p>
              <div className="text-[9px] font-mono text-[#2a4a5a] mt-1">
                {new Date(msg.timestamp).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        );
      })}

      {/* Interim transcript */}
      {interimText && (
        <div className="flex gap-2 flex-row-reverse opacity-50">
          <div className="w-6 h-6 rounded flex-shrink-0 flex items-center justify-center text-[9px] font-display font-bold mt-0.5 border bg-[#0050ff15] border-[#0050ff30] text-[#4488ff]">
            U
          </div>
          <div className="max-w-[84%] rounded-lg px-3 py-2 border border-dashed bg-[#0050ff06] border-[#0050ff20]">
            <p className="text-[12px] font-mono leading-relaxed text-[#6a9ab0] italic">
              {interimText}
            </p>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
