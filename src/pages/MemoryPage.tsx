import { useState, useEffect } from 'react';
import { Brain, Trash2, X, Search } from 'lucide-react';
import { getMemory, deleteMemory, clearMemory } from '@/lib/memory';
import type { MemoryItem } from '@/types';

const CATEGORY_COLORS: Record<MemoryItem['category'], string> = {
  fact: '#00d4ff',
  preference: '#a78bfa',
  task: '#ffcc00',
  reminder: '#ff4444',
  general: '#3a7a8a',
};

export default function MemoryPage() {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [search, setSearch] = useState('');

  const load = () => setMemories(getMemory());
  useEffect(load, []);

  const filtered = memories.filter(m =>
    m.key.toLowerCase().includes(search.toLowerCase()) ||
    m.value.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full bg-[#050810] flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#0d1f35] bg-[#080c18] flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded flex items-center justify-center bg-[#00d4ff12] border border-[#00d4ff30]">
              <Brain className="w-4 h-4 text-[#00d4ff]" style={{ filter: 'drop-shadow(0 0 4px #00d4ff)' }} />
            </div>
            <div>
              <h1 className="font-display font-bold text-[#00d4ff] text-xs tracking-[0.2em] text-glow">
                MEMORY BANK
              </h1>
              <p className="text-[9px] text-[#3a6a7a] font-mono mt-0.5">
                {memories.length} item{memories.length !== 1 ? 's' : ''} stored
              </p>
            </div>
          </div>
          {memories.length > 0 && (
            <button
              onClick={() => { clearMemory(); load(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono text-[#ff4444] border border-[#ff444428] rounded hover:bg-[#ff44440c] transition-all"
            >
              <Trash2 className="w-3 h-3" />
              Clear All
            </button>
          )}
        </div>
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-[#2a4a5a]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search memories..."
            className="w-full pl-8 pr-4 py-2 bg-[#050810] border border-[#0d1f35] rounded text-[11px] font-mono text-[#a8d8e8] placeholder-[#1a3a4a] focus:outline-none focus:border-[#00d4ff30]"
          />
        </div>
      </div>

      {/* Memory list */}
      <div className="flex-1 overflow-y-auto p-5">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4 text-[#2a4a5a]">
            <Brain className="w-14 h-14 opacity-20" />
            <p className="font-mono text-sm">
              {search ? 'No matching memories' : 'No memories stored yet'}
            </p>
            <p className="font-mono text-[10px] text-center leading-relaxed text-[#1a3a4a]">
              Try saying:<br />
              "Remember my name is Bala"<br />
              "Remember my favorite language is Python"<br />
              "Remember my interview is on Monday"
            </p>
          </div>
        ) : (
          <div className="grid gap-2.5">
            {filtered.map(mem => (
              <div
                key={mem.id}
                className="group bg-[#080c18] border border-[#0d1f35] rounded-lg p-4 hover:border-[#00d4ff20] transition-all hud-panel"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className="text-[8px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded border"
                        style={{
                          color: CATEGORY_COLORS[mem.category],
                          borderColor: `${CATEGORY_COLORS[mem.category]}30`,
                          background: `${CATEGORY_COLORS[mem.category]}10`,
                        }}
                      >
                        {mem.category}
                      </span>
                    </div>
                    <div className="text-[12px] font-mono text-[#a8d8e8] font-medium truncate">{mem.key}</div>
                    <div className="text-[11px] font-mono text-[#5a8a9a] mt-0.5">{mem.value}</div>
                  </div>
                  <div className="flex items-start gap-2 flex-shrink-0">
                    <span className="text-[9px] font-mono text-[#1a3a4a] whitespace-nowrap">
                      {new Date(mem.timestamp).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => { deleteMemory(mem.id); load(); }}
                      className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded text-[#ff4444] hover:bg-[#ff444415] transition-all"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
