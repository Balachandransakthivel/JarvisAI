import { useState, useEffect } from 'react';
import { History as HistIcon, Trash2, CheckCircle2, XCircle, Search, Terminal, Calendar } from 'lucide-react';
import { getBackendHistory, clearBackendHistory } from '@/lib/api';
import { Card3D } from '@/components/ui/Card3D';
import type { CommandHistory } from '@/types';

export default function HistoryPage() {
  const [history, setHistory] = useState<CommandHistory[]>([]);
  const [search, setSearch] = useState('');

  const load = async () => {
    const data = await getBackendHistory();
    if (data) setHistory(data);
  };
  
  useEffect(() => {
    load();
  }, []);

  const handleClear = async () => {
    const ok = await clearBackendHistory();
    if (ok) load();
  };

  const filtered = history.filter(h =>
    h.command.toLowerCase().includes(search.toLowerCase()) ||
    h.response.toLowerCase().includes(search.toLowerCase()) ||
    h.intent.toLowerCase().includes(search.toLowerCase())
  );

  const successCount = history.filter(h => h.success).length;

  return (
    <div className="h-full bg-transparent flex flex-col relative select-none">
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#ff730020] bg-[rgba(8,6,4,0.65)] backdrop-blur-md flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#ff730010] border border-[#ff730035] shadow-[0_0_12px_rgba(255,115,0,0.15)]">
              <HistIcon className="w-5 h-5 text-[#ff7300]" style={{ filter: 'drop-shadow(0 0 4px #ff7300)' }} />
            </div>
            <div>
              <h1 className="font-display font-bold text-[#ff7300] text-[13px] tracking-[0.25em] text-glow-orange">
                OPERATION LEDGER
              </h1>
              <p className="text-[9.5px] text-[#ff8c00] font-mono tracking-wider mt-0.5 uppercase opacity-85">
                {history.length} events logged &nbsp;·&nbsp;
                <span className="text-[#ffb700]">{successCount} VERIFIED</span>
                {history.length > successCount && (
                  <span className="text-[#ff3333]"> &nbsp;· {history.length - successCount} ERRORS</span>
                )}
              </p>
            </div>
          </div>
          {history.length > 0 && (
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono text-[#ff3333] border border-[#ff333330] bg-[#ff33330c] rounded-md hover:bg-[#ff33331a] transition-all duration-300 transform active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Wipe Logs
            </button>
          )}
        </div>

        {/* Search Input */}
        <div className="relative max-w-xl">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a4a22]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search operations, transcripts, or intents..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#030407] border border-[#ff730025] rounded-md text-[11px] font-mono text-[#ffd8b8] placeholder-[rgba(255,115,0,0.25)] focus:outline-none focus:border-[#ff730045] focus:ring-1 focus:ring-[#ff730030] transition-all"
          />
        </div>
      </div>

      {/* History Log List */}
      <div className="flex-1 overflow-y-auto p-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-80 gap-5 text-[#8a4a22]">
            <div className="relative">
              <Terminal className="w-16 h-16 opacity-15" />
              <div className="absolute inset-0 w-16 h-16 border border-dashed border-[#ff730015] rounded-full animate-spin ring-gyro-cw" />
            </div>
            <div className="text-center space-y-1.5">
              <p className="font-display font-semibold text-[11px] tracking-widest text-[#8a4a22] uppercase">
                {search ? 'Query filters failed' : 'Terminal history empty'}
              </p>
              <p className="font-mono text-[9px] text-[#8a4a22] opacity-75 uppercase tracking-wider">
                System telemetry logs will populate as operations execute
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map(item => {
              const statusColor = item.success ? '#ffb700' : '#ff3333';
              return (
                <Card3D
                  key={item.id}
                  glowColor={statusColor}
                  className="h-full"
                >
                  <div className="flex flex-col justify-between h-full space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {item.success ? (
                          <CheckCircle2 className="w-4 h-4 text-[#ffb700]" />
                        ) : (
                          <XCircle className="w-4 h-4 text-[#ff3333]" />
                        )}
                        <span className="text-[9px] font-display font-bold uppercase tracking-[0.2em] px-2 py-0.5 rounded border"
                              style={{
                                color: statusColor,
                                borderColor: `${statusColor}30`,
                                background: `${statusColor}10`,
                              }}>
                          {item.intent.replace(/_/g, ' ')}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1 text-[8.5px] font-mono text-[#8a4a22] uppercase">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {new Date(item.timestamp).toLocaleString('en-US', {
                            month: 'short', day: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 flex-1">
                      <div className="text-[11.5px] font-mono font-bold text-[#ff7300] leading-relaxed break-words">
                        &gt; "{item.command}"
                      </div>
                      <div className="text-[10.5px] font-mono text-[#e5dacb] leading-relaxed border-l-2 border-[#ff730020] pl-3 italic">
                        "{item.response.length > 180 ? item.response.slice(0, 180) + '…' : item.response}"
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[8px] font-mono text-[#8a4a22] tracking-widest uppercase opacity-80">
                      <span>VERDICT // {item.success ? 'ACCEPTED' : 'ABORTED'}</span>
                      <span>·</span>
                      <span>HOST // STARK_NET</span>
                    </div>
                  </div>
                </Card3D>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
