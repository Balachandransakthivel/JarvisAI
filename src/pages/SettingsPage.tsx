import { useState, useEffect } from 'react';
import { Settings, Save, Volume2, Mic, User, Zap } from 'lucide-react';
import { getSettings, saveSettings } from '@/lib/memory';
import type { JarvisSettings } from '@/types';

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="relative w-10 h-5 rounded-full transition-all duration-200 focus:outline-none flex-shrink-0"
      style={{ background: checked ? 'rgba(0,212,255,0.25)' : '#0d1f35' }}
    >
      <div
        className="absolute top-0.5 w-4 h-4 rounded-full transition-all duration-200"
        style={{
          left: checked ? 'calc(100% - 18px)' : '2px',
          background: checked ? '#00d4ff' : '#3a6a7a',
          boxShadow: checked ? '0 0 6px rgba(0,212,255,0.8)' : 'none',
        }}
      />
    </button>
  );
}

function Section({ icon: Icon, title, children }: {
  icon: React.ElementType; title: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-[#080c18] border border-[#0d1f35] rounded-lg p-5 hud-panel">
      <h2 className="flex items-center gap-2 text-[10px] font-mono text-[#00d4ff] uppercase tracking-[0.2em] mb-4">
        <Icon className="w-3.5 h-3.5" />
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <span className="text-[11px] font-mono text-[#a8d8e8]">{children}</span>;
}
function SubLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-mono text-[#3a6a7a] mt-0.5">{children}</p>;
}

export default function SettingsPage() {
  const [s, setS] = useState<JarvisSettings>(getSettings());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setS(getSettings());
  }, []);

  const set = <K extends keyof JarvisSettings>(key: K, value: JarvisSettings[K]) => {
    setS(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    saveSettings(s);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="h-full bg-[#050810] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#0d1f35] bg-[#080c18] flex-shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded flex items-center justify-center bg-[#00d4ff12] border border-[#00d4ff30]">
            <Settings className="w-4 h-4 text-[#00d4ff]" style={{ filter: 'drop-shadow(0 0 4px #00d4ff)' }} />
          </div>
          <div>
            <h1 className="font-display font-bold text-[#00d4ff] text-xs tracking-[0.2em] text-glow">
              SYSTEM CONFIG
            </h1>
            <p className="text-[9px] text-[#3a6a7a] font-mono mt-0.5">Customize JARVIS behavior</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          className={[
            'flex items-center gap-1.5 px-4 py-2 text-[10px] font-mono rounded border transition-all',
            saved
              ? 'text-[#00ff88] border-[#00ff8840] bg-[#00ff8812]'
              : 'text-[#00d4ff] border-[#00d4ff40] bg-[#00d4ff12] hover:bg-[#00d4ff20]',
          ].join(' ')}
        >
          <Save className="w-3.5 h-3.5" />
          {saved ? 'Saved!' : 'Save Config'}
        </button>
      </div>

      {/* Settings body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Profile */}
        <Section icon={User} title="Profile">
          <div>
            <label className="block text-[10px] font-mono text-[#3a6a7a] uppercase tracking-wider mb-1.5">Your Name</label>
            <input
              value={s.userName}
              onChange={e => set('userName', e.target.value)}
              className="w-full bg-[#050810] border border-[#0d1f35] rounded px-3 py-2 text-[12px] font-mono text-[#a8d8e8] focus:outline-none focus:border-[#00d4ff30] transition-colors"
              placeholder="Enter your name"
            />
            <p className="text-[10px] font-mono text-[#2a4a5a] mt-1">JARVIS will address you by this name</p>
          </div>
          <div>
            <label className="block text-[10px] font-mono text-[#3a6a7a] uppercase tracking-wider mb-1.5">Wake Word</label>
            <input
              value={s.wakeWord}
              onChange={e => set('wakeWord', e.target.value.toLowerCase())}
              className="w-full bg-[#050810] border border-[#0d1f35] rounded px-3 py-2 text-[12px] font-mono text-[#a8d8e8] focus:outline-none focus:border-[#00d4ff30] transition-colors"
              placeholder="hey jarvis"
            />
            <p className="text-[10px] font-mono text-[#2a4a5a] mt-1">Phrase to activate voice listening</p>
          </div>
        </Section>

        {/* Voice Output */}
        <Section icon={Volume2} title="Voice Output">
          <div className="flex items-center justify-between">
            <div>
              <Label>Voice Enabled</Label>
              <SubLabel>JARVIS speaks responses aloud</SubLabel>
            </div>
            <Toggle checked={s.voiceEnabled} onChange={v => set('voiceEnabled', v)} />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[10px] font-mono text-[#3a6a7a] uppercase tracking-wider">Speech Rate</label>
              <span className="text-[10px] font-mono text-[#00d4ff]">{s.voiceRate.toFixed(1)}</span>
            </div>
            <input
              type="range" min="0.5" max="2" step="0.1"
              value={s.voiceRate}
              onChange={e => set('voiceRate', parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-[9px] font-mono text-[#1a3a4a] mt-1">
              <span>Slow</span><span>Fast</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[10px] font-mono text-[#3a6a7a] uppercase tracking-wider">Voice Pitch</label>
              <span className="text-[10px] font-mono text-[#00d4ff]">{s.voicePitch.toFixed(1)}</span>
            </div>
            <input
              type="range" min="0.5" max="2" step="0.1"
              value={s.voicePitch}
              onChange={e => set('voicePitch', parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-[9px] font-mono text-[#1a3a4a] mt-1">
              <span>Deep</span><span>High</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[10px] font-mono text-[#3a6a7a] uppercase tracking-wider">Volume</label>
              <span className="text-[10px] font-mono text-[#00d4ff]">{Math.round(s.voiceVolume * 100)}%</span>
            </div>
            <input
              type="range" min="0" max="1" step="0.05"
              value={s.voiceVolume}
              onChange={e => set('voiceVolume', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </Section>

        {/* Behavior */}
        <Section icon={Mic} title="Behavior">
          {[
            {
              key: 'autoListen' as const,
              label: 'Auto Wake Word Detection',
              desc: 'Continuously listen for wake word on startup',
            },
            {
              key: 'soundEffects' as const,
              label: 'Sound Effects',
              desc: 'Audio feedback on activation (future)',
            },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-start justify-between gap-4">
              <div>
                <Label>{label}</Label>
                <SubLabel>{desc}</SubLabel>
              </div>
              <Toggle checked={s[key] as boolean} onChange={v => set(key, v)} />
            </div>
          ))}
        </Section>

        {/* Capabilities */}
        <Section icon={Zap} title="Voice Commands Reference">
          <div className="grid grid-cols-1 gap-1.5">
            {[
              ['Open YouTube / Gmail / GitHub', 'Opens website in new tab'],
              ['Search [query]', 'Searches Google'],
              ['Play [video]', 'Searches YouTube'],
              ['What time is it?', 'Reads current time'],
              ['Remember [fact]', 'Stores in memory'],
              ['What is my [key]?', 'Retrieves from memory'],
              ['Calculate [math]', 'Solves math expressions'],
              ['Tell me a joke', 'Responds with a joke'],
              ['Who are you?', 'JARVIS introduces itself'],
            ].map(([cmd, desc]) => (
              <div key={cmd} className="flex justify-between items-start gap-4 py-1.5 border-b border-[#0d1f35] last:border-0">
                <code className="text-[10px] font-mono text-[#00d4ff80]">{cmd}</code>
                <span className="text-[10px] font-mono text-[#3a6a7a] text-right">{desc}</span>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}
