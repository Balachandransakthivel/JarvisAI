export type ListeningState = 'idle' | 'wake-word' | 'listening' | 'processing' | 'speaking';

export interface Message {
  id: string;
  role: 'user' | 'jarvis' | 'system';
  content: string;
  timestamp: Date;
  intent?: string;
}

export interface MemoryItem {
  id: string;
  key: string;
  value: string;
  timestamp: number;
  category: 'fact' | 'preference' | 'task' | 'reminder' | 'general';
}

export interface CommandHistory {
  id: string;
  command: string;
  response: string;
  timestamp: number;
  intent: string;
  success: boolean;
}

export interface JarvisSettings {
  userName: string;
  wakeWord: string;
  voiceEnabled: boolean;
  voiceRate: number;
  voicePitch: number;
  voiceVolume: number;
  autoListen: boolean;
  soundEffects: boolean;
}

export interface SystemStats {
  cpu: number;
  ram: number;
  battery: number;
  batteryCharging: boolean;
  network: boolean;
  temperature: number;
  uptime: string;
}

export interface ParsedCommand {
  intent: string;
  params: Record<string, string>;
  response: string;
  action?: () => void;
  confidence: number;
}
