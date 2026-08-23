import { useState, useEffect } from 'react';
import { Settings, Save, Volume2, Mic, User, Zap, Database } from 'lucide-react';
import { getBackendSettings, saveBackendSettings } from '@/lib/api';
import { getSettings, saveSettings } from '@/lib/memory';
import type { JarvisSettings } from '@/types';

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="relative w-11 h-6 rounded-full transition-all duration-300 focus:outline-none flex-shrink-0 border border-[#ff730025] shadow-[inset_0_0_8px_rgba(0,0,0,0.6)]"
      style={{ background: checked ? 'rgba(255,183,0,0.18)' : 'rgba(16,10,5,0.3)' }}
    >
      <div
        className="absolute top-0.5 w-4.5 h-4.5 rounded-full transition-all duration-300"
        style={{
          left: checked ? 'calc(100% - 20px)' : '2px',
          background: checked ? '#ffb700' : '#8a4a22',
          boxShadow: checked ? '0 0 8px rgba(255,183,0,0.9)' : 'none',
        }}
      />
    </button>
  );
}

function Section({ icon: Icon, title, children }: {
  icon: React.ElementType; title: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-[rgba(16,10,5,0.45)] backdrop-blur-md border border-[#ff730020] rounded-lg p-5 hud-panel">
      {/* HUD alignment corners */}
      <div className="absolute top-0 right-0 bottom-0 left-0 rounded-lg pointer-events-none hud-corners-secondary" />

      <h2 className="flex items-center gap-2 text-[10px] font-display font-extrabold text-[#ff7300] uppercase tracking-[0.25em] mb-4 text-glow-orange">
        <Icon className="w-4 h-4 text-[#ff7300]" />
        {title}
      </h2>
      <div className="space-y-4 relative z-10">{children}</div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <span className="text-[11.5px] font-mono text-[#e5dacb] uppercase tracking-wider">{children}</span>;
}

function SubLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-mono text-[#8a4a22] mt-0.5 tracking-wide uppercase opacity-90">{children}</p>;
}

export default function SettingsPage() {
  const [s, setS] = useState<JarvisSettings>(getSettings());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      let data = await getBackendSettings();
      if (!data) data = getSettings();
      setS(data);
    };
    loadSettings();
  }, []);

  const set = <K extends keyof JarvisSettings>(key: K, value: JarvisSettings[K]) => {
    setS(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    // Save locally
    saveSettings(s);
    // Save to Python SQLite
    await saveBackendSettings(s);
    
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="h-full bg-transparent flex flex-col overflow-hidden select-none">
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#ff730020] bg-[rgba(8,6,4,0.65)] backdrop-blur-md flex-shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#ff730010] border border-[#ff730035] shadow-[0_0_12px_rgba(255,115,0,0.15)]">
            <Settings className="w-5 h-5 text-[#ff7300]" style={{ filter: 'drop-shadow(0 0 4px #ff7300)' }} />
          </div>
          <div>
            <h1 className="font-display font-bold text-[#ff7300] text-[13px] tracking-[0.25em] text-glow-orange">
              SYSTEM LOGISTICS
            </h1>
            <p className="text-[9.5px] text-[#ff8c00] font-mono mt-0.5 tracking-wider uppercase opacity-85">
              Sync settings & voice synthesizer mapping
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          className={[
            'flex items-center gap-1.5 px-4 py-2 text-[10px] font-display font-bold rounded-md border transition-all duration-300 transform active:scale-95 shadow-md',
            saved
              ? 'text-[#ffb700] border-[#ffb70050] bg-[#ffb70015] shadow-[0_0_12px_rgba(255,183,0,0.15)]'
              : 'text-[#ff7300] border-[#ff730040] bg-[#ff730012] hover:bg-[#ff730020] hover:border-[#ff730060]',
          ].join(' ')}
        >
          <Save className="w-4 h-4" />
          {saved ? 'UPLOADING...' : 'SYNC CONFIG'}
        </button>
      </div>

      {/* Settings body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        
        {/* Profile Section */}
        <Section icon={User} title="AUTHORIZED OPERATOR MODULE">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[9.5px] font-mono text-[#8a4a22] uppercase tracking-wider mb-2">
                Operator Call Sign
              </label>
              <input
                value={s.userName}
                onChange={e => set('userName', e.target.value)}
                className="w-full bg-[#030407] border border-[#ff730025] rounded-md px-3.5 py-2.5 text-[11.5px] font-mono text-[#ffd8b8] focus:outline-none focus:border-[#ff730045] focus:ring-1 focus:ring-[#ff730030] transition-colors"
                placeholder="Enter operator name"
              />
              <p className="text-[9px] font-mono text-[#8a4a22] mt-1.5 uppercase opacity-80">
                JARVIS will address you by this call sign
              </p>
            </div>
            <div>
              <label className="block text-[9.5px] font-mono text-[#8a4a22] uppercase tracking-wider mb-2">
                Trigger Vocabulary
              </label>
              <input
                value={s.wakeWord}
                onChange={e => set('wakeWord', e.target.value.toLowerCase())}
                className="w-full bg-[#030407] border border-[#ff730025] rounded-md px-3.5 py-2.5 text-[11.5px] font-mono text-[#ffd8b8] focus:outline-none focus:border-[#ff730045] focus:ring-1 focus:ring-[#ff730030] transition-colors"
                placeholder="hey jarvis"
              />
              <p className="text-[9px] font-mono text-[#8a4a22] mt-1.5 uppercase opacity-80">
                Acoustic wake sentinel vocabulary parameters
              </p>
            </div>
          </div>
        </Section>

        {/* AI Brain Configuration */}
        <Section icon={Zap} title="CORE PROCESSOR BRAIN LINK">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[9.5px] font-mono text-[#8a4a22] uppercase tracking-wider mb-2">
                Cognitive Matrix Node
              </label>
              <select
                value={s.aiProvider || 'gemini'}
                onChange={e => {
                  const val = e.target.value as any;
                  setS(prev => ({ ...prev, aiProvider: val, selectedModel: '' }));
                }}
                className="w-full bg-[#030407] border border-[#ff730025] rounded-md px-3 py-2.5 text-[11.5px] font-mono text-[#ffd8b8] focus:outline-none focus:border-[#ff730045] focus:ring-1 focus:ring-[#ff730030] transition-colors"
              >
                <option value="gemini">Google Gemini Cloud Link</option>
                <option value="openai">OpenAI GPT Cloud Link</option>
                <option value="ollama">Ollama Local Core (Offline)</option>
              </select>
            </div>
            <div>
              <label className="block text-[9.5px] font-mono text-[#8a4a22] uppercase tracking-wider mb-2">
                Credential Security Token
              </label>
              <input
                type="password"
                value={s.apiKey || ''}
                onChange={e => set('apiKey', e.target.value)}
                className="w-full bg-[#030407] border border-[#ff730025] rounded-md px-3.5 py-2.5 text-[11.5px] font-mono text-[#ffd8b8] focus:outline-none focus:border-[#ff730045] focus:ring-1 focus:ring-[#ff730030] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                placeholder={s.aiProvider === 'ollama' ? 'Local node - credential bypass' : 'Enter cryptographic key'}
                disabled={s.aiProvider === 'ollama'}
              />
            </div>
            <div>
              <label className="block text-[9.5px] font-mono text-[#8a4a22] uppercase tracking-wider mb-2">
                Model Designation ID
              </label>
              <input
                value={s.selectedModel || ''}
                onChange={e => set('selectedModel', e.target.value)}
                className="w-full bg-[#030407] border border-[#ff730025] rounded-md px-3.5 py-2.5 text-[11.5px] font-mono text-[#ffd8b8] focus:outline-none focus:border-[#ff730045] focus:ring-1 focus:ring-[#ff730030] transition-colors"
                placeholder={
                  s.aiProvider === 'gemini' ? 'gemini-2.0-flash' : 
                  s.aiProvider === 'openai' ? 'gpt-4o-mini' : 
                  'llama3'
                }
              />
            </div>
            <div>
              <label className="block text-[9.5px] font-mono text-[#8a4a22] uppercase tracking-wider mb-2">
                Matrix Routing API Base
              </label>
              <input
                value={s.apiBase || ''}
                onChange={e => set('apiBase', e.target.value)}
                className="w-full bg-[#030407] border border-[#ff730025] rounded-md px-3.5 py-2.5 text-[11.5px] font-mono text-[#ffd8b8] focus:outline-none focus:border-[#ff730045] focus:ring-1 focus:ring-[#ff730030] transition-colors"
                placeholder={s.aiProvider === 'ollama' ? 'http://localhost:11434/v1' : 'Default cloud gateway'}
              />
            </div>
          </div>
        </Section>

        {/* Speech Recognition Mode */}
        <Section icon={Mic} title="DICTATION STT Sentinels">
          <div>
            <label className="block text-[9.5px] font-mono text-[#8a4a22] uppercase tracking-wider mb-2">
              Transcription Node Provider
            </label>
            <select
              value={s.sttProvider || 'local'}
              onChange={e => set('sttProvider', e.target.value as any)}
              className="w-full bg-[#030407] border border-[#ff730025] rounded-md px-3 py-2.5 text-[11.5px] font-mono text-[#ffd8b8] focus:outline-none focus:border-[#ff730045] focus:ring-1 focus:ring-[#ff730030] transition-colors"
            >
              <option value="local">Local Whisper Server (Offline)</option>
              <option value="openai">OpenAI Cloud Whisper API</option>
              <option value="google">Standard Chromium Web Speech Engine</option>
            </select>
          </div>
        </Section>

        {/* Voice Output */}
        <Section icon={Volume2} title="SYNTHESIS ACOUSTIC GENERATOR">
          <div className="flex items-center justify-between border-b border-[#ff730015] pb-4 mb-4">
            <div>
              <Label>Acoustic Response Feed</Label>
              <SubLabel>Synthesizer reads core reports aloud</SubLabel>
            </div>
            <Toggle checked={s.voiceEnabled} onChange={v => set('voiceEnabled', v)} />
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[9.5px] font-mono text-[#8a4a22] uppercase tracking-wider">
                  Vocal Speed Index
                </label>
                <span className="text-[10.5px] font-mono text-[#ffb700] font-bold">{s.voiceRate.toFixed(1)}x</span>
              </div>
              <input
                type="range" min="0.5" max="2.0" step="0.1"
                value={s.voiceRate}
                onChange={e => set('voiceRate', parseFloat(e.target.value))}
                className="w-full accent-[#ff7300]"
              />
              <div className="flex justify-between text-[8px] font-mono text-[#8a4a22] mt-1 uppercase">
                <span>Slow</span><span>Fast</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[9.5px] font-mono text-[#8a4a22] uppercase tracking-wider">
                  Vocal Pitch Index
                </label>
                <span className="text-[10.5px] font-mono text-[#ffb700] font-bold">{s.voicePitch.toFixed(1)}</span>
              </div>
              <input
                type="range" min="0.5" max="2.0" step="0.1"
                value={s.voicePitch}
                onChange={e => set('voicePitch', parseFloat(e.target.value))}
                className="w-full accent-[#ff7300]"
              />
              <div className="flex justify-between text-[8px] font-mono text-[#8a4a22] mt-1 uppercase">
                <span>Deep</span><span>High</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[9.5px] font-mono text-[#8a4a22] uppercase tracking-wider">
                  Volume Index
                </label>
                <span className="text-[10.5px] font-mono text-[#ffb700] font-bold">{Math.round(s.voiceVolume * 100)}%</span>
              </div>
              <input
                type="range" min="0.0" max="1.0" step="0.05"
                value={s.voiceVolume}
                onChange={e => set('voiceVolume', parseFloat(e.target.value))}
                className="w-full accent-[#ff7300]"
              />
              <div className="flex justify-between text-[8px] font-mono text-[#8a4a22] mt-1 uppercase">
                <span>Mute</span><span>Max</span>
              </div>
            </div>
          </div>
        </Section>

        {/* Behavior */}
        <Section icon={Database} title="OPERATIONAL SENTINEL DIRECTIVES">
          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                key: 'autoListen' as const,
                label: 'Sentinel SentienceSentinel',
                desc: 'Vocal interceptor wake active on boot',
              },
              {
                key: 'soundEffects' as const,
                label: 'Haptic Audio Pings',
                desc: 'Chime feedbacks on successful command queries',
              },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between gap-4 border border-[#ff730018] rounded-md p-3.5 bg-[rgba(16,10,5,0.4)]">
                <div>
                  <Label>{label}</Label>
                  <SubLabel>{desc}</SubLabel>
                </div>
                <Toggle checked={s[key] as boolean} onChange={v => set(key, v)} />
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}
