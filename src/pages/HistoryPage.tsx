import { useState, useEffect } from 'react';
import { History, Trash2, CheckCircle2, XCircle, Search, Terminal } from 'lucide-react';
import { getHistory, clearHistory } from '@/lib/memory';
import type { CommandHistory } from '@/types';

export default function HistoryPage() {
  const [history, setHistory] = useState<CommandHistory[]>([]);
  const [search, setSearch] = useState('');

  const load = () => setHistory(getHistory());
  useEffect(load, []);

  const filtered = history.filter(h =>
    h.command.toLowerCase().includes(search.toLowerCase()) ||
    h.response.toLowerCase().includes(search.toLowerCase()) ||
    h.intent.toLowerCase().includes(search.toLowerCase())
  );

  const successCount = history.filter(h => h.success).length;

  return (
    <div className="h-full bg-[#050810] flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#0d1f35] bg-[#080c18] flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded flex items-center justify-center bg-[#00d4ff12] border border-[#00d4ff30]">
              <History className="w-4 h-4 text-[#00d4ff]" style={{ filter: 'drop-shadow(0 0 4px #00d4ff)' }} />
            </div>
            <div>
              <h1 className="font-display font-bold text-[#00d4ff] text-xs tracking-[0.2em] text-glow">
                COMMAND LOG
              </h1>
              <p className="text-[9px] text-[#3a6a7a] font-mono mt-0.5">
                {history.length} commands &nbsp;·&nbsp;
                <span className="text-[#00ff88]">{successCount} succeeded</span>
                {history.length > successCount && (
                  <span className="text-[#ff4444]"> &nbsp;· {history.length - successCount} failed</span>
                )}
              </p>
            </div>
          </div>
          {history.length > 0 && (
            <button
              onClick={() => { clearHistory(); load(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono text-[#ff4444] border border-[#ff444428] rounded hover:bg-[#ff44440c] transition-all"
            >
              <Trash2 className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-[#2a4a5a]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search commands..."
            className="w-full pl-8 pr-4 py-2 bg-[#050810] border border-[#0d1f35] rounded text-[11px] font-mono text-[#a8d8e8] placeholder-[#1a3a4a] focus:outline-none focus:border-[#00d4ff30]"
          />
        </div>
      </div>

      {/* History list */}
      <div className="flex-1 overflow-y-auto p-5">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4 text-[#2a4a5a]">
            <Terminal className="w-14 h-14 opacity-20" />
            <p className="font-mono text-sm">
              {search ? 'No matching commands' : 'No command history yet'}
            </p>
            <p className="font-mono text-[10px] text-[#1a3a4a]">
              Commands will appear here after you use JARVIS
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map(item => (
              <div
                key={item.id}
                className="bg-[#080c18] border border-[#0d1f35] rounded-lg p-3.5 hover:border-[#00d4ff20] transition-all hud-panel"
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    {item.success ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00ff88] flex-shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-[#ff4444] flex-shrink-0" />
                    )}
                    <span className="text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded border border-[#00d4ff20] text-[#00d4ff60] bg-[#00d4ff08]">
                      {item.intent.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-[#1a3a4a] whitespace-nowrap">
                    {new Date(item.timestamp).toLocaleString('en-US', {
                      month: 'short', day: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="text-[12px] font-mono text-[#a8d8e8] font-medium mb-1.5">
                  "{item.command}"
                </div>
                <div className="text-[11px] font-mono text-[#4a7a8a] leading-relaxed">
                  → {item.response.length > 120 ? item.response.slice(0, 120) + '…' : item.response}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
