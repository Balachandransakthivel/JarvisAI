import type { MemoryItem, CommandHistory, JarvisSettings } from '@/types';
import { DEFAULT_USER_NAME, DEFAULT_WAKE_WORD } from '@/constants/jarvis';

const MEMORY_KEY = 'jarvis_memory';
const HISTORY_KEY = 'jarvis_history';
const SETTINGS_KEY = 'jarvis_settings';

const DEFAULT_SETTINGS: JarvisSettings = {
  userName: DEFAULT_USER_NAME,
  wakeWord: DEFAULT_WAKE_WORD,
  voiceEnabled: true,
  voiceRate: 0.9,
  voicePitch: 0.85,
  voiceVolume: 1,
  autoListen: true,
  soundEffects: true,
};

// ─── Memory ──────────────────────────────────────────────────────────────────

export function getMemory(): MemoryItem[] {
  try {
    const raw = localStorage.getItem(MEMORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function setMemory(
  key: string,
  value: string,
  category: MemoryItem['category'] = 'general'
): MemoryItem {
  const memory = getMemory();
  const idx = memory.findIndex(m => m.key.toLowerCase() === key.toLowerCase());
  const item: MemoryItem = {
    id: idx >= 0 ? memory[idx].id : crypto.randomUUID(),
    key,
    value,
    timestamp: Date.now(),
    category,
  };
  if (idx >= 0) memory[idx] = item;
  else memory.push(item);
  localStorage.setItem(MEMORY_KEY, JSON.stringify(memory));
  return item;
}

export function getMemoryByKey(key: string): MemoryItem | null {
  return (
    getMemory().find(m => m.key.toLowerCase().includes(key.toLowerCase())) ?? null
  );
}

export function searchMemory(query: string): MemoryItem[] {
  const lower = query.toLowerCase();
  return getMemory().filter(
    m =>
      m.key.toLowerCase().includes(lower) ||
      m.value.toLowerCase().includes(lower)
  );
}

export function deleteMemory(id: string): void {
  localStorage.setItem(
    MEMORY_KEY,
    JSON.stringify(getMemory().filter(m => m.id !== id))
  );
}

export function clearMemory(): void {
  localStorage.removeItem(MEMORY_KEY);
}

// ─── History ─────────────────────────────────────────────────────────────────

export function getHistory(): CommandHistory[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToHistory(item: Omit<CommandHistory, 'id'>): void {
  const history = getHistory();
  history.unshift({ ...item, id: crypto.randomUUID() });
  if (history.length > 100) history.splice(100);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}

// ─── Settings ────────────────────────────────────────────────────────────────

export function getSettings(): JarvisSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(s: Partial<JarvisSettings>): void {
  localStorage.setItem(
    SETTINGS_KEY,
    JSON.stringify({ ...getSettings(), ...s })
  );
}
