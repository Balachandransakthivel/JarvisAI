import { useState, useEffect } from 'react';
import { Brain, Trash2, X, Search, Calendar, Tag } from 'lucide-react';
import { getBackendMemories, deleteBackendMemory } from '@/lib/api';
import { Card3D } from '@/components/ui/Card3D';
import type { MemoryItem } from '@/types';

const CATEGORY_COLORS: Record<MemoryItem['category'], string> = {
  fact: '#ff7300',      // Orange
  preference: '#ffb700',// Gold/Amber
  task: '#ff5500',      // Red-Orange
  reminder: '#ff3333',  // Red
  general: '#8a4a22',   // Warm Copper
};

export default function MemoryPage() {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [search, setSearch] = useState('');

  const load = async () => {
    const data = await getBackendMemories();
    if (data) setMemories(data);
  };
  
  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    const ok = await deleteBackendMemory(id);
    if (ok) load();
  };

  const handleClearAll = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/memory/clear', { method: 'POST' });
      if (res.ok) load();
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = memories.filter(m =>
    m.key.toLowerCase().includes(search.toLowerCase()) ||
    m.value.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full bg-transparent flex flex-col relative select-none">
      
      {/* HUD Header */}
      <div className="px-6 py-4 border-b border-[#ff730020] bg-[rgba(8,6,4,0.65)] backdrop-blur-md flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#ff730010] border border-[#ff730035] shadow-[0_0_12px_rgba(255,115,0,0.15)]">
              <Brain className="w-5 h-5 text-[#ff7300]" style={{ filter: 'drop-shadow(0 0 4px #ff7300)' }} />
            </div>
            <div>
              <h1 className="font-display font-bold text-[#ff7300] text-[13px] tracking-[0.25em] text-glow-orange">
                MEMORY LOG INDEX
              </h1>
              <p className="text-[9.5px] text-[#ff8c00] font-mono tracking-wider mt-0.5 uppercase opacity-85">
                Stark Memory Matrix // {memories.length} files indexed
              </p>
            </div>
          </div>
          {memories.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono text-[#ff3333] border border-[#ff333330] bg-[#ff33330c] rounded-md hover:bg-[#ff33331a] transition-all duration-300 transform active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Purge Database
            </button>
          )}
        </div>

        {/* Cyber Search HUD */}
        <div className="relative max-w-xl">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a4a22]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Query memory keys or data tags..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#030407] border border-[#ff730025] rounded-md text-[11px] font-mono text-[#ffd8b8] placeholder-[rgba(255,115,0,0.25)] focus:outline-none focus:border-[#ff730045] focus:ring-1 focus:ring-[#ff730030] transition-all"
          />
        </div>
      </div>

      {/* Memory List */}
      <div className="flex-1 overflow-y-auto p-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-80 gap-5 text-[#8a4a22]">
            <div className="relative">
              <Brain className="w-16 h-16 opacity-15" />
              <div className="absolute inset-0 w-16 h-16 border border-dashed border-[#ff730015] rounded-full animate-spin ring-gyro-cw" />
            </div>
            <div className="text-center space-y-1.5">
              <p className="font-display font-semibold text-[11px] tracking-widest text-[#8a4a22] uppercase">
                {search ? 'Search parameters failed' : 'Memory index empty'}
              </p>
              <p className="font-mono text-[9px] max-w-sm leading-relaxed text-[#8a4a22] opacity-75 uppercase tracking-wider">
                Vocalize memory entries to log:<br />
                "Remember that [key] is [value]"<br />
                "Remember that my passkey is 8844"
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(mem => {
              const catColor = CATEGORY_COLORS[mem.category] || '#ff7300';
              return (
                <Card3D
                  key={mem.id}
                  glowColor={catColor}
                  className="h-full"
                >
                  <div className="flex flex-col justify-between h-full relative">
                    <div className="absolute -top-2 -right-2">
                      <button
                        onClick={() => handleDelete(mem.id)}
                        className="w-6 h-6 flex items-center justify-center rounded-md border border-transparent text-[#ff3333] hover:bg-[#ff333315] hover:border-[#ff333335] transition-all duration-300 transform active:scale-90"
                        title="Delete record"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-3.5 pr-4">
                      {/* Category Label */}
                      <div className="flex items-center gap-1.5">
                        <Tag className="w-3 h-3" style={{ color: catColor }} />
                        <span
                          className="text-[8px] font-display font-bold uppercase tracking-[0.2em]"
                          style={{ color: catColor }}
                        >
                          {mem.category}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="space-y-1.5">
                        <div className="text-[11.5px] font-display font-bold text-[#ff7300] tracking-wide uppercase break-words text-glow-orange">
                          {mem.key}
                        </div>
                        <div className="text-[11px] font-mono text-[#e5dacb] leading-relaxed break-words border-l border-[#ff730020] pl-2.5">
                          {mem.value}
                        </div>
                      </div>
                    </div>

                    {/* Metadata Footer */}
                    <div className="flex items-center gap-1.5 mt-5 pt-3 border-t border-[#ff730015] text-[8.5px] font-mono text-[#8a4a22] tracking-wider uppercase">
                      <Calendar className="w-3 h-3 text-[#8a4a22]" />
                      <span>INDEXED // {new Date(mem.timestamp).toLocaleDateString()}</span>
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
