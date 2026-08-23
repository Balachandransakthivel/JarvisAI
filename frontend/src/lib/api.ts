const BASE_URL = 'http://localhost:8000/api';

// ─── Settings ────────────────────────────────────────────────────────────────
export async function getBackendSettings() {
  try {
    const res = await fetch(`${BASE_URL}/settings`);
    if (!res.ok) throw new Error('Failed to fetch settings');
    return await res.json();
  } catch (err) {
    loggerError('getBackendSettings', err);
    return null;
  }
}

export async function saveBackendSettings(settings: any) {
  try {
    const res = await fetch(`${BASE_URL}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error('Failed to save settings');
    return await res.json();
  } catch (err) {
    loggerError('saveBackendSettings', err);
    return null;
  }
}

// ─── Memories ────────────────────────────────────────────────────────────────
export async function getBackendMemories() {
  try {
    const res = await fetch(`${BASE_URL}/memory`);
    if (!res.ok) throw new Error('Failed to fetch memories');
    return await res.json();
  } catch (err) {
    loggerError('getBackendMemories', err);
    return [];
  }
}

export async function addBackendMemory(key: string, value: string, category: string = 'general') {
  try {
    const res = await fetch(`${BASE_URL}/memory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value, category }),
    });
    if (!res.ok) throw new Error('Failed to add memory');
    return await res.json();
  } catch (err) {
    loggerError('addBackendMemory', err);
    return null;
  }
}

export async function deleteBackendMemory(id: string) {
  try {
    const res = await fetch(`${BASE_URL}/memory/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch (err) {
    loggerError('deleteBackendMemory', err);
    return false;
  }
}

// ─── Command History ─────────────────────────────────────────────────────────
export async function getBackendHistory() {
  try {
    const res = await fetch(`${BASE_URL}/history`);
    if (!res.ok) throw new Error('Failed to fetch history');
    return await res.json();
  } catch (err) {
    loggerError('getBackendHistory', err);
    return [];
  }
}

export async function clearBackendHistory() {
  try {
    const res = await fetch(`${BASE_URL}/history/clear`, { method: 'POST' });
    return res.ok;
  } catch (err) {
    loggerError('clearBackendHistory', err);
    return false;
  }
}

// ─── Conversations (Chat list) ───────────────────────────────────────────────
export async function getChatHistory() {
  try {
    const res = await fetch(`${BASE_URL}/chat/history`);
    if (!res.ok) throw new Error('Failed to fetch chat history');
    return await res.json();
  } catch (err) {
    loggerError('getChatHistory', err);
    return [];
  }
}

export async function clearChatHistory() {
  try {
    const res = await fetch(`${BASE_URL}/chat/clear`, { method: 'POST' });
    return res.ok;
  } catch (err) {
    loggerError('clearChatHistory', err);
    return false;
  }
}

// ─── Reminders ───────────────────────────────────────────────────────────────
export async function getBackendReminders() {
  try {
    const res = await fetch(`${BASE_URL}/reminders`);
    if (!res.ok) throw new Error('Failed to fetch reminders');
    return await res.json();
  } catch (err) {
    loggerError('getBackendReminders', err);
    return [];
  }
}

export async function addBackendReminder(task: string, dueTime: string) {
  try {
    const res = await fetch(`${BASE_URL}/reminders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task, due_time: dueTime }),
    });
    if (!res.ok) throw new Error('Failed to add reminder');
    return await res.json();
  } catch (err) {
    loggerError('addBackendReminder', err);
    return null;
  }
}

export async function toggleBackendReminder(id: string) {
  try {
    const res = await fetch(`${BASE_URL}/reminders/${id}/toggle`, { method: 'POST' });
    return res.ok;
  } catch (err) {
    loggerError('toggleBackendReminder', err);
    return false;
  }
}

export async function deleteBackendReminder(id: string) {
  try {
    const res = await fetch(`${BASE_URL}/reminders/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch (err) {
    loggerError('deleteBackendReminder', err);
    return false;
  }
}

// ─── Command execution ───────────────────────────────────────────────────────
export async function sendCommandToBackend(text: string) {
  try {
    const res = await fetch(`${BASE_URL}/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error('Failed to process command');
    return await res.json();
  } catch (err) {
    loggerError('sendCommandToBackend', err);
    return {
      response: "I lost connection to my Python server, Bala. Please make sure the backend is active.",
      intent: "unknown",
      params: {}
    };
  }
}

// ─── Vision Analysis ─────────────────────────────────────────────────────────
export async function analyzeVisionOnBackend(source: 'webcam' | 'screen', query: string) {
  try {
    const res = await fetch(`${BASE_URL}/vision/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source, query }),
    });
    if (!res.ok) throw new Error('Failed to analyze vision');
    return await res.json();
  } catch (err) {
    loggerError('analyzeVisionOnBackend', err);
    return { response: "My vision system is currently offline, Bala." };
  }
}

// ─── Devices Hub API ──────────────────────────────────────────────────────────
export async function listDevices() {
  try {
    const res = await fetch(`${BASE_URL}/devices`);
    if (!res.ok) throw new Error('Failed to fetch devices');
    return await res.json();
  } catch (err) {
    loggerError('listDevices', err);
    return [];
  }
}

export async function sendDeviceCommand(deviceId: string, command: string, params: any = {}) {
  try {
    const res = await fetch(`${BASE_URL}/devices/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ device_id: deviceId, command, params }),
    });
    if (!res.ok) throw new Error('Failed to send device command');
    return await res.json();
  } catch (err) {
    loggerError('sendDeviceCommand', err);
    return { success: false, message: 'Could not communicate with target device' };
  }
}


// ─── Voice / Speech ──────────────────────────────────────────────────────────
export async function speakTextOnBackend(text: string, voiceIndex = 0, rate = 1.0, volume = 1.0) {
  try {
    await fetch(`${BASE_URL}/voice/speak`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voiceIndex, rate, volume }),
    });
  } catch (err) {
    loggerError('speakTextOnBackend', err);
  }
}

export async function stopSpeechOnBackend() {
  try {
    await fetch(`${BASE_URL}/voice/stop`, { method: 'POST' });
  } catch (err) {
    loggerError('stopSpeechOnBackend', err);
  }
}

// Helper logger
function loggerError(context: string, error: any) {
  console.warn(`[JARVIS API Error in ${context}]:`, error);
}
