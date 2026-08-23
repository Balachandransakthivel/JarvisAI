import { useEffect, useRef } from 'react';
import type { Message } from '@/types';
import { cn } from '@/lib/utils';

interface ChatMessagesProps {
  messages: Message[];
  interimText: string;
}

const INTENT_COLORS: Record<string, string> = {
  boot: '#8a4a22',
  greeting: '#ff8c00',
  time: '#ff8c00',
  date: '#ff8c00',
  open_website: '#00ff88',
  search: '#00ff88',
  youtube_search: '#ff3333',
  memory_set: '#ffb700',
  memory_get: '#ffb700',
  math: '#d946ef',
  joke: '#fb923c',
  identity: '#ff8c00',
  capabilities: '#ff8c00',
  unknown: '#8a4a22',
};

export function ChatMessages({ messages, interimText }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, interimText]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
      {messages.map(msg => {
        const isUser = msg.role === 'user';
        const intentColor = msg.intent ? (INTENT_COLORS[msg.intent] ?? '#8a4a22') : '#8a4a22';

        return (
          <div key={msg.id} className={cn('flex gap-2.5', isUser ? 'flex-row-reverse' : 'flex-row')}>
            {/* Avatar */}
            <div
              className={cn(
                'w-6.5 h-6.5 rounded flex-shrink-0 flex items-center justify-center',
                'text-[10px] font-display font-bold mt-0.5 border',
                isUser
                  ? 'bg-[#ffb70010] border-[#ffb70030] text-[#ffb700]'
                  : 'bg-[#ff730015] border-[#ff730035] text-[#ff7300]'
              )}
              style={isUser ? {} : { boxShadow: '0 0 6px rgba(255,115,0,0.18)' }}
            >
              {isUser ? 'U' : 'J'}
            </div>

            {/* Bubble */}
            <div
              className={cn(
                'max-w-[82%] rounded-lg px-3.5 py-2.5 border',
                isUser
                  ? 'bg-[rgba(255,183,0,0.03)] border-[#ffb70020]'
                  : 'bg-[rgba(255,115,0,0.04)] border-[#ff730022]'
              )}
            >
              {/* Intent tag for JARVIS */}
              {!isUser && msg.intent && msg.intent !== 'boot' && (
                <div
                  className="text-[8px] font-display font-extrabold uppercase tracking-widest mb-1"
                  style={{ color: intentColor }}
                >
                  {msg.intent.replace(/_/g, ' ')}
                </div>
              )}
              <p className="text-[12px] font-mono leading-relaxed text-[#e5dacb]">
                {msg.content}
              </p>
              <div className="text-[9px] font-mono text-[#8a4a22] mt-1.5 opacity-70">
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
        <div className="flex gap-2.5 flex-row-reverse opacity-50">
          <div className="w-6.5 h-6.5 rounded flex-shrink-0 flex items-center justify-center text-[10px] font-display font-bold mt-0.5 border bg-[#ffb70010] border-[#ffb70030] text-[#ffb700]">
            U
          </div>
          <div className="max-w-[82%] rounded-lg px-3.5 py-2.5 border border-dashed bg-[rgba(255,183,0,0.03)] border-[#ffb70025]">
            <p className="text-[12px] font-mono leading-relaxed text-[#ffb700] italic">
              {interimText}
            </p>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
