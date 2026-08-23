import React, { useState, useCallback, useRef, useEffect, createContext, useContext, ReactNode } from 'react';
import { 
  getBackendSettings, 
  saveBackendSettings, 
  getChatHistory, 
  sendCommandToBackend, 
  speakTextOnBackend, 
  stopSpeechOnBackend 
} from '@/lib/api';
import { getSettings, saveSettings } from '@/lib/memory';
import { toast } from 'sonner';
import type { Message, ListeningState, JarvisSettings } from '@/types';

function getTimeOfDay(): string {
  const h = new Date().getHours();
  return h < 12 ? 'morning' : h < 17 ? 'afternoon' : h < 21 ? 'evening' : 'night';
}

function getSpeechRecognitionClass(): (new () => SpeechRecognition) | null {
  if (typeof window === 'undefined') return null;
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
}

function useJarvisState() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [listeningState, setListeningState] = useState<ListeningState>('idle');
  const [interimText, setInterimText] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [settings, setSettings] = useState<JarvisSettings>(getSettings());

  // Refs (mutable, no re-render)
  const stateRef = useRef<ListeningState>('idle');
  const settingsRef = useRef<JarvisSettings>(settings);
  const selectedVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const commandRecRef = useRef<SpeechRecognition | null>(null);
  const wakeRecRef = useRef<SpeechRecognition | null>(null);
  const wakeActiveRef = useRef(false);
  const bootDoneRef = useRef(false);

  // Function refs to avoid stale closures
  const speakRef = useRef<((text: string, onEnd?: () => void) => void) | null>(null);
  const startListenRef = useRef<(() => void) | null>(null);
  const startWakeRef = useRef<(() => void) | null>(null);
  const handleCmdRef = useRef<((text: string) => void) | null>(null);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const setState = (s: ListeningState) => {
    stateRef.current = s;
    setListeningState(s);
  };

  const addMessage = useCallback((role: Message['role'], content: string, intent?: string) => {
    const msg: Message = {
      id: crypto.randomUUID(),
      role,
      content,
      timestamp: new Date(),
      intent,
    };
    setMessages(prev => [...prev, msg]);
  }, []);

  // ── speak ────────────────────────────────────────────────────────────────
  const speak = useCallback((text: string, onEnd?: () => void) => {
    const s = settingsRef.current;
    
    // Attempt backend text-to-speech if configured, else fallback to browser synthesis
    if (s.voiceEnabled && s.sttProvider === 'local') {
      setIsSpeaking(true);
      speakTextOnBackend(text, 0, s.voiceRate, s.voiceVolume);
      // Backend speech completion callback simulation or timeout
      setTimeout(() => {
        setIsSpeaking(false);
        onEnd?.();
      }, text.length * 70 + 800); // rough estimate of speaking duration
      return;
    }

    if (!s.voiceEnabled) { onEnd?.(); return; }

    const fallbackToBackendTTS = () => {
      console.warn('Browser speechSynthesis failed/blocked, falling back to backend TTS.');
      setIsSpeaking(true);
      speakTextOnBackend(text, 0, s.voiceRate, s.voiceVolume);
      setTimeout(() => {
        setIsSpeaking(false);
        onEnd?.();
      }, text.length * 70 + 800);
    };

    if (!('speechSynthesis' in window)) {
      fallbackToBackendTTS();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      
      const u = new SpeechSynthesisUtterance(text);
      u.rate = s.voiceRate;
      u.pitch = s.voicePitch;
      u.volume = s.voiceVolume;
      if (selectedVoiceRef.current) u.voice = selectedVoiceRef.current;
      u.onstart = () => setIsSpeaking(true);
      
      let called = false;
      const done = () => {
        if (called) return;
        called = true;
        setIsSpeaking(false);
        onEnd?.();
      };
      
      u.onend = done;
      u.onerror = (err) => {
        console.error('speechSynthesis utterance error:', err);
        fallbackToBackendTTS();
      };
      
      // Safety timeout: max 12 seconds or 80ms per character to prevent getting stuck
      const timeoutMs = Math.min(12000, Math.max(3000, text.length * 80 + 1000));
      setTimeout(() => {
        if (!called) {
          console.warn('speechSynthesis onend safety timeout triggered');
          done();
        }
      }, timeoutMs);

      window.speechSynthesis.speak(u);
    } catch (e) {
      console.error('speechSynthesis execution error:', e);
      fallbackToBackendTTS();
    }
  }, []);

  // ── startWakeLoop ────────────────────────────────────────────────────────
  const startWakeLoop = useCallback(() => {
    if (!wakeActiveRef.current) return;
    const Rec = getSpeechRecognitionClass();
    if (!Rec) return;

    wakeRecRef.current?.stop();
    wakeRecRef.current = null;

    const rec = new Rec();
    rec.lang = 'en-US';
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (e: SpeechRecognitionEvent) => {
      if (stateRef.current !== 'idle') return;
      const text = Array.from(e.results)
        .slice(-3)
        .map(r => r[0].transcript)
        .join(' ')
        .toLowerCase();
      if (text.includes(settingsRef.current.wakeWord)) {
        rec.stop();
        // Activate
        const s = settingsRef.current;
        setState('listening');
        if (s.voiceEnabled) {
          speakRef.current?.(`Yes, ${s.userName}?`, () => {
            startListenRef.current?.();
          });
        } else {
          startListenRef.current?.();
        }
      }
    };

    rec.onend = () => {
      if (wakeActiveRef.current && stateRef.current === 'idle') {
        setTimeout(() => startWakeRef.current?.(), 400);
      }
    };
    rec.onerror = () => {
      if (wakeActiveRef.current) setTimeout(() => startWakeRef.current?.(), 1000);
    };

    try { rec.start(); wakeRecRef.current = rec; } catch { /* already started */ }
  }, []);

  // ── startListening ───────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    const Rec = getSpeechRecognitionClass();
    if (!Rec) return;

    commandRecRef.current?.stop();
    commandRecRef.current = null;

    // Stop active wake word listener to prevent microphone device access clashes
    wakeRecRef.current?.stop();
    wakeRecRef.current = null;

    const rec = new Rec();
    rec.lang = 'en-US';
    rec.continuous = false;
    rec.interimResults = true;

    rec.onresult = (e: SpeechRecognitionEvent) => {
      const last = e.results[e.results.length - 1];
      const text = last[0].transcript;
      setInterimText(text);
      if (last.isFinal) {
        setInterimText('');
        handleCmdRef.current?.(text);
      }
    };
    rec.onerror = (err: any) => {
      console.error('Speech recognition error event:', err.error);
      if (err.error !== 'no-speech' && err.error !== 'aborted') {
        toast.error(`Speech Sentinel: ${err.error}. Ensure microphone access is permitted.`);
      }
      setInterimText('');
      setState('idle');
      if (wakeActiveRef.current) startWakeRef.current?.();
    };
    rec.onend = () => {
      if (stateRef.current === 'listening') {
        setState('idle');
        if (wakeActiveRef.current) startWakeRef.current?.();
      }
    };

    rec.start();
    commandRecRef.current = rec;
    setState('listening');
  }, []);

  // ── handleCommand ────────────────────────────────────────────────────────
  const handleCommand = useCallback(async (text: string) => {
    if (!text.trim()) return;

    setState('processing');
    setInterimText('');
    
    // Instantly append user message to UI
    addMessage('user', text);

    const s = settingsRef.current;
    
    // Process command via Python FastAPI backend
    const result = await sendCommandToBackend(text);

    setTimeout(() => {
      addMessage('jarvis', result.response, result.intent);
      if (s.voiceEnabled) {
        setState('speaking');
        speakRef.current?.(result.response, () => {
          setState('idle');
          if (wakeActiveRef.current) startWakeRef.current?.();
        });
      } else {
        setState('idle');
        if (wakeActiveRef.current) startWakeRef.current?.();
      }
    }, 200);
  }, [addMessage]);

  // Keep function refs up to date
  useEffect(() => {
    speakRef.current = speak;
    startListenRef.current = startListening;
    startWakeRef.current = startWakeLoop;
    handleCmdRef.current = handleCommand;
  }, [speak, startListening, startWakeLoop, handleCommand]);

  // ── Boot & Sync ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (bootDoneRef.current) return;
    bootDoneRef.current = true;

    // Load Speech Recognition support
    const Rec = getSpeechRecognitionClass();
    if (Rec && 'speechSynthesis' in window) {
      setIsSupported(true);
      const loadVoices = () => {
        const v = window.speechSynthesis.getVoices();
        setVoices(v);
        selectedVoiceRef.current =
          v.find(vv => vv.lang.startsWith('en') && vv.name.includes('Google')) ||
          v.find(vv => vv.lang.startsWith('en') && vv.name.includes('Microsoft')) ||
          v.find(vv => vv.lang.startsWith('en')) ||
          v[0] ||
          null;
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    const syncWithBackend = async () => {
      // 1. Fetch settings from FastAPI
      let activeSettings = await getBackendSettings();
      if (!activeSettings) {
        // Fallback to local storage settings
        activeSettings = getSettings();
      } else {
        // Sync setting state
        setSettings(activeSettings);
        settingsRef.current = activeSettings;
      }

      // 2. Fetch chat history logs
      const history = await getChatHistory();
      if (history && history.length > 0) {
        setMessages(history.map((m: any) => ({
          id: m.id,
          role: m.role as 'user' | 'jarvis' | 'system',
          content: m.content,
          timestamp: new Date(m.timestamp),
          intent: m.intent || undefined
        })));
      } else {
        const bootMsg = `JARVIS AI v1.0 initialized. Good ${getTimeOfDay()}, ${activeSettings.userName}. All systems operational. Say "${activeSettings.wakeWord}" to activate voice mode.`;
        addMessage('jarvis', bootMsg, 'boot');
      }

      const shortBoot = `Good ${getTimeOfDay()}, ${activeSettings.userName}. I'm ready.`;
      if (activeSettings.voiceEnabled && 'speechSynthesis' in window) {
        speak(shortBoot, () => {
          if (activeSettings.autoListen && Rec) {
            wakeActiveRef.current = true;
            startWakeLoop();
          }
        });
      } else if (activeSettings.autoListen && Rec) {
        wakeActiveRef.current = true;
        setTimeout(() => startWakeLoop(), 500);
      }
    };

    syncWithBackend();

    // ── WebSocket triggers (e.g. backend wake word alert) ────────────────────
    const triggerWS = new WebSocket('ws://localhost:8000/api/ws');
    triggerWS.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'wakeword_detected') {
          // Backend wake word triggers speech listening
          if (stateRef.current === 'idle') {
            setState('listening');
            const currentSet = settingsRef.current;
            if (currentSet.voiceEnabled) {
              speak(`Yes, ${currentSet.userName}?`, () => {
                startListening();
              });
            } else {
              startListening();
            }
          }
        }
      } catch (e) {
        // Parse error
      }
    };

    return () => {
      wakeActiveRef.current = false;
      wakeRecRef.current?.stop();
      commandRecRef.current?.stop();
      triggerWS.close();
    };
  }, [addMessage, speak, startWakeLoop, startListening]);

  // ── Public API ───────────────────────────────────────────────────────────
  const activateListen = useCallback(() => {
    if (stateRef.current !== 'idle') return;
    startListening();
  }, [startListening]);

  const deactivateListen = useCallback(() => {
    commandRecRef.current?.stop();
    window.speechSynthesis?.cancel();
    stopSpeechOnBackend();
    setIsSpeaking(false);
    setInterimText('');
    setState('idle');
  }, []);

  const updateSettings = useCallback(async (patch: Partial<JarvisSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...patch };
      settingsRef.current = next;
      // 1. Save in local storage fallback
      saveSettings(next);
      // 2. Save in FastAPI backend
      saveBackendSettings(next);
      return next;
    });
  }, []);

  const startWakeWordDetection = useCallback(() => {
    wakeActiveRef.current = true;
    startWakeLoop();
  }, [startWakeLoop]);

  const stopWakeWordDetection = useCallback(() => {
    wakeActiveRef.current = false;
    wakeRecRef.current?.stop();
  }, []);

  return {
    messages,
    listeningState,
    interimText,
    isSupported,
    isSpeaking,
    voices,
    activateListen,
    deactivateListen,
    handleCommand,
    speak,
    settings,
    updateSettings,
    startWakeWordDetection,
    stopWakeWordDetection,
  };
}

const JarvisContext = createContext<ReturnType<typeof useJarvisState> | null>(null);

export function JarvisProvider({ children }: { children: ReactNode }) {
  const value = useJarvisState();
  return React.createElement(JarvisContext.Provider, { value }, children);
}

export function useJarvis() {
  const context = useContext(JarvisContext);
  if (!context) {
    throw new Error('useJarvis must be used within a JarvisProvider');
  }
  return context;
}
