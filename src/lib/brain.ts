
import { WEBSITE_MAP, JARVIS_JOKES, JARVIS_CONFIRMATIONS, JARVIS_UNKNOWN } from '@/constants/jarvis';
import { setMemory, getMemoryByKey, searchMemory, getMemory } from '@/lib/memory';
import type { ParsedCommand } from '@/types';

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getTimeOfDay(): string {
  const h = new Date().getHours();
  return h < 12 ? 'morning' : h < 17 ? 'afternoon' : h < 21 ? 'evening' : 'night';
}

export function processCommand(input: string, userName: string): ParsedCommand {
  const text = input.trim();
  const lower = text.toLowerCase().replace(/[?.!,]$/, '');

  // ── Greeting ────────────────────────────────────────────────────────────
  if (/^(hello|hi|hey|good morning|good afternoon|good evening|good night|howdy|greetings)/.test(lower)) {
    return {
      intent: 'greeting',
      params: {},
      response: `Good ${getTimeOfDay()}, ${userName}. All systems are operational. How may I assist you?`,
      confidence: 0.95,
    };
  }

  // ── How are you ─────────────────────────────────────────────────────────
  if (/how are you|how('s| is) it going|are you okay|status/.test(lower)) {
    return {
      intent: 'status',
      params: {},
      response: `All systems running at optimal capacity, ${userName}. Fully operational and ready to assist.`,
      confidence: 0.9,
    };
  }

  // ── Farewell ────────────────────────────────────────────────────────────
  if (/^(bye|goodbye|see you|later|take care|goodnight|good night)/.test(lower)) {
    return {
      intent: 'farewell',
      params: {},
      response: `Goodbye, ${userName}. I'll be here when you need me. Have a productive session.`,
      confidence: 0.95,
    };
  }

  // ── Thank you ───────────────────────────────────────────────────────────
  if (/thank(s| you)|appreciate it|cheers|well done/.test(lower)) {
    return {
      intent: 'acknowledgment',
      params: {},
      response: `You're welcome, ${userName}. Is there anything else I can help you with?`,
      confidence: 0.9,
    };
  }

  // ── Identity ────────────────────────────────────────────────────────────
  if (/who are you|what are you|introduce yourself|your name|tell me about yourself/.test(lower)) {
    return {
      intent: 'identity',
      params: {},
      response: `I am JARVIS — Just A Rather Very Intelligent System. I'm your personal AI desktop assistant, designed to help you navigate the digital world with voice commands, manage memory, search the web, and automate browser tasks. Created specifically for ${userName}.`,
      confidence: 0.98,
    };
  }

  // ── Capabilities ────────────────────────────────────────────────────────
  if (/what can you do|your capabilities|help me|commands|features|abilities/.test(lower)) {
    return {
      intent: 'capabilities',
      params: {},
      response: `I can open websites, search Google or YouTube, remember information, tell you the time and date, do calculations, and hold intelligent conversations. Try: "Open YouTube", "Search React tutorials", "Remember my birthday is January 1st", or "Calculate 25 times 48".`,
      confidence: 0.95,
    };
  }

  // ── Time ────────────────────────────────────────────────────────────────
  if (/what (time|is the time)|current time|tell me the time|what's the time/.test(lower)) {
    const time = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    return { intent: 'time', params: { time }, response: `The current time is ${time}.`, confidence: 0.99 };
  }

  // ── Date ────────────────────────────────────────────────────────────────
  if (/what (date|day|is today)|today's date|current date/.test(lower)) {
    const date = new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
    return { intent: 'date', params: { date }, response: `Today is ${date}.`, confidence: 0.99 };
  }

  // ── Math ────────────────────────────────────────────────────────────────
  const mathMatch = lower.match(
    /^(what('s| is)|calculate|compute|solve|evaluate)?\s*([\d\s+\-*\/().%]+)$/
  );
  if (mathMatch && mathMatch[3] && /\d/.test(mathMatch[3])) {
    try {
      const expr = mathMatch[3].trim();
      // The original error indicated an unused eslint-disable directive.
      // This means the rule 'no-new-func' was not actually triggered by `Function(...)`.
      // Removing the directive as it's not needed.
      const result = Function(`"use strict"; return (${expr})`)() as number;
      if (typeof result === 'number' && isFinite(result)) {
        return {
          intent: 'math',
          params: { expr, result: String(result) },
          response: `The result of ${expr} is ${result}.`,
          confidence: 0.95,
        };
      }
    } catch { /* not math */ }
  }

  // ── Weather ─────────────────────────────────────────────────────────────
  if (/weather|temperature|forecast|how('s| is) the weather/.test(lower)) {
    const temps = ['22°C', '25°C', '18°C', '28°C', '20°C'];
    const conditions = ['partly cloudy', 'sunny with light breeze', 'overcast', 'clear skies', 'mild and pleasant'];
    return {
      intent: 'weather',
      params: {},
      response: `Current conditions: ${temps[Math.floor(Math.random() * temps.length)]} with ${conditions[Math.floor(Math.random() * conditions.length)]}. Note: live weather requires the cloud backend, ${userName}.`,
      confidence: 0.7,
    };
  }

  // ── Joke ────────────────────────────────────────────────────────────────
  if (/joke|funny|humor|make me laugh|tell me something funny/.test(lower)) {
    return { intent: 'joke', params: {}, response: rand(JARVIS_JOKES), confidence: 0.99 };
  }

  // ── Memory: SET ─────────────────────────────────────────────────────────
  const rememberMatch = lower.match(/^remember (that |my |that my )?(.+)/);
  if (rememberMatch && !/what do you|do you remember/.test(lower)) {
    const info = rememberMatch[2];

    const nameMatch = info.match(/name is (\w+)/);
    if (nameMatch) {
      setMemory('name', nameMatch[1], 'fact');
      return { intent: 'memory_set', params: { key: 'name', value: nameMatch[1] }, response: `Noted. Your name is ${nameMatch[1]}. Memory stored successfully.`, confidence: 0.95 };
    }

    const bdMatch = info.match(/birthday is (.+)/);
    if (bdMatch) {
      setMemory('birthday', bdMatch[1], 'fact');
      return { intent: 'memory_set', params: { key: 'birthday', value: bdMatch[1] }, response: `Birthday stored: ${bdMatch[1]}. I'll keep that in memory.`, confidence: 0.95 };
    }

    const kvMatch = info.match(/^(.+?) is (.+)$/);
    if (kvMatch) {
      setMemory(kvMatch[1], kvMatch[2], 'fact');
      return { intent: 'memory_set', params: { key: kvMatch[1], value: kvMatch[2] }, response: `Stored in memory: "${kvMatch[1]}" is "${kvMatch[2]}".`, confidence: 0.9 };
    }

    setMemory(`note_${Date.now()}`, info, 'general');
    return { intent: 'memory_set', params: { key: 'note', value: info }, response: `I've made a note: "${info}".`, confidence: 0.8 };
  }

  // ── Memory: LIST ────────────────────────────────────────────────────────
  if (/what do you (know|remember)|show (my )?memories|list (memories|everything|all)/.test(lower)) {
    const memories = getMemory();
    if (memories.length === 0) {
      return { intent: 'memory_list', params: {}, response: `I have no stored memories yet, ${userName}. Try saying "Remember my name is Bala" to add something.`, confidence: 0.9 };
    }
    const summary = memories.slice(0, 4).map(m => `${m.key}: ${m.value}`).join('; ');
    return { intent: 'memory_list', params: {}, response: `I have ${memories.length} memory item${memories.length > 1 ? 's' : ''} stored. Here are some: ${summary}.`, confidence: 0.9 };
  }

  // ── Memory: GET ─────────────────────────────────────────────────────────
  const whatIsMatch = lower.match(/^what('s| is) (my |the )?(.+)$/);
  if (whatIsMatch) {
    const query = whatIsMatch[3];
    if (/name/.test(query)) {
      const m = getMemoryByKey('name');
      if (m) return { intent: 'memory_get', params: { key: 'name', value: m.value }, response: `Your name is ${m.value}.`, confidence: 0.9 };
    }
    const found = searchMemory(query);
    if (found.length > 0) {
      return { intent: 'memory_get', params: { key: query, value: found[0].value }, response: `Based on my memory: ${found[0].key} is ${found[0].value}.`, confidence: 0.85 };
    }
  }

  // ── Open website / app ──────────────────────────────────────────────────
  const openMatch = lower.match(/^(open|launch|go to|navigate to|show me|take me to)\s+(.+)$/);
  if (openMatch) {
    const target = openMatch[2].trim();
    const site = WEBSITE_MAP[target];
    if (site) {
      return {
        intent: 'open_website',
        params: { site: site.label, url: site.url },
        response: `${rand(JARVIS_CONFIRMATIONS)} Opening ${site.label}.`,
        action: () => window.open(site.url, '_blank'),
        confidence: 0.98,
      };
    }
    const partial = Object.keys(WEBSITE_MAP).find(k => target.includes(k) || k.includes(target));
    if (partial) {
      const ps = WEBSITE_MAP[partial];
      return {
        intent: 'open_website',
        params: { site: ps.label, url: ps.url },
        response: `Opening ${ps.label} now.`,
        action: () => window.open(ps.url, '_blank'),
        confidence: 0.85,
      };
    }
    if (target.includes('.')) {
      const url = target.startsWith('http') ? target : `https://${target}`;
      return {
        intent: 'open_website',
        params: { site: target, url },
        response: `Opening ${target}.`,
        action: () => window.open(url, '_blank'),
        confidence: 0.75,
      };
    }
    const desktopApps: Record<string, string> = {
      chrome: 'Google Chrome', firefox: 'Firefox', edge: 'Microsoft Edge',
      calculator: 'Calculator', notepad: 'Notepad', terminal: 'Terminal',
      'file explorer': 'File Explorer', 'task manager': 'Task Manager',
    };
    const appKey = Object.keys(desktopApps).find(k => target.includes(k));
    if (appKey) {
      return { intent: 'open_app', params: { app: desktopApps[appKey] }, response: `Full desktop app control requires the desktop client, ${userName}. I can open browser-based equivalents instead.`, confidence: 0.8 };
    }
  }

  // ── Search Google ───────────────────────────────────────────────────────
  const searchMatch = lower.match(/^(search|google|find|look up)\s+(.+)$/);
  if (searchMatch) {
    const query = searchMatch[2];
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    return {
      intent: 'search',
      params: { query, url },
      response: `Searching Google for "${query}".`,
      action: () => window.open(url, '_blank'),
      confidence: 0.95,
    };
  }

  // ── YouTube search ──────────────────────────────────────────────────────
  const ytMatch = lower.match(/^(play|watch|youtube|search youtube for?)\s+(.+)$/);
  if (ytMatch) {
    const query = ytMatch[2];
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    return {
      intent: 'youtube_search',
      params: { query },
      response: `Searching YouTube for "${query}".`,
      action: () => window.open(url, '_blank'),
      confidence: 0.9,
    };
  }

  // ── Music ───────────────────────────────────────────────────────────────
  if (/play music|start music|open music|play spotify/.test(lower)) {
    return {
      intent: 'open_website',
      params: { site: 'Spotify', url: 'https://open.spotify.com' },
      response: `Opening Spotify for you, ${userName}.`,
      action: () => window.open('https://open.spotify.com', '_blank'),
      confidence: 0.85,
    };
  }

  // ── System info ─────────────────────────────────────────────────────────
  if (/cpu|ram|battery|system (info|status)|performance/.test(lower)) {
    return { intent: 'system_info', params: {}, response: `System metrics are displayed in the status bar at the bottom of the dashboard, ${userName}. CPU, RAM, battery, and network status are monitored in real-time.`, confidence: 0.85 };
  }

  // ── Screenshot ──────────────────────────────────────────────────────────
  if (/screenshot|capture screen/.test(lower)) {
    return { intent: 'screenshot', params: {}, response: `Screenshot functionality requires the desktop client, ${userName}. You can use your system's screenshot shortcut instead (Win+PrtSc on Windows, Cmd+Shift+4 on Mac).`, confidence: 0.9 };
  }

  // ── Fallback ────────────────────────────────────────────────────────────
  return {
    intent: 'unknown',
    params: { input: text },
    response: rand(JARVIS_UNKNOWN),
    confidence: 0.1,
  };
}
