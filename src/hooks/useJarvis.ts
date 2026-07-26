
import { useState, useCallback, useRef, useEffect } from 'react';
import { processCommand } from '@/lib/brain';
import { addToHistory, getSettings, saveSettings } from '@/lib/memory';
import type { Message, ListeningState, JarvisSettings } from '@/types';

function getTimeOfDay(): string {
  const h = new Date().getHours();
  return h < 12 ? 'morning' : h < 17 ? 'afternoon' : h < 21 ? 'evening' : 'night';
}

function getSpeechRecognitionClass(): (new () => SpeechRecognition) | null {
  if (typeof window === 'undefined') return null;
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
}

export function useJarvis() {
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
    if (!('speechSynthesis' in window)) { onEnd?.(); return; }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = settingsRef.current.voiceRate;
    u.pitch = settingsRef.current.voicePitch;
    u.volume = settingsRef.current.voiceVolume;
    if (selectedVoiceRef.current) u.voice = selectedVoiceRef.current;
    u.onstart = () => setIsSpeaking(true);
    u.onend = () => { setIsSpeaking(false); onEnd?.(); };
    u.onerror = () => { setIsSpeaking(false); onEnd?.(); };
    window.speechSynthesis.speak(u);
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
    rec.onerror = () => {
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
  const handleCommand = useCallback((text: string) => {
    if (!text.trim()) return;

    setState('processing');
    setInterimText('');
    addMessage('user', text);

    const s = settingsRef.current;
    const result = processCommand(text, s.userName);

    if (result.action) setTimeout(result.action, 300);

    addToHistory({
      command: text,
      response: result.response,
      timestamp: Date.now(),
      intent: result.intent,
      success: result.confidence > 0.5,
    });

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

  // ── Boot ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (bootDoneRef.current) return;
    bootDoneRef.current = true;

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

    const s = getSettings();
    settingsRef.current = s;
    setSettings(s);

    const bootMsg = `JARVIS AI v1.0 initialized. Good ${getTimeOfDay()}, ${s.userName}. All systems operational. Say "${s.wakeWord}" to activate voice mode.`;
    addMessage('jarvis', bootMsg, 'boot');

    const timer = setTimeout(() => {
      const shortBoot = `Good ${getTimeOfDay()}, ${s.userName}. I'm ready.`;
      if (s.voiceEnabled && 'speechSynthesis' in window) {
        speak(shortBoot, () => {
          if (s.autoListen && Rec) {
            wakeActiveRef.current = true;
            startWakeLoop();
          }
        });
      } else if (s.autoListen && Rec) {
        wakeActiveRef.current = true;
        setTimeout(() => startWakeLoop(), 500);
      }
    }, 600);

    return () => {
      clearTimeout(timer);
      wakeActiveRef.current = false;
      wakeRecRef.current?.stop();
      commandRecRef.current?.stop();
    };
  }, [addMessage, speak, startWakeLoop]); // Removed 'eslint-disable-line react-hooks/exhaustive-deps' and added missing dependencies

  // ── Public API ───────────────────────────────────────────────────────────
  const activateListen = useCallback(() => {
    if (stateRef.current !== 'idle') return;
    startListening();
  }, [startListening]);

  const deactivateListen = useCallback(() => {
    commandRecRef.current?.stop();
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setInterimText('');
    setState('idle');
  }, []);

  const updateSettings = useCallback((patch: Partial<JarvisSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...patch };
      settingsRef.current = next;
      saveSettings(next);
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
