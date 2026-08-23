# ⚡ JARVIS AI — Advanced Autonomous Desktop Assistant

![JARVIS AI Banner](https://img.shields.io/badge/JARVIS_AI-v1.0-00d4ff?style=for-the-badge&logo=electron&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.133.1-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Three.js](https://img.shields.io/badge/Three.js-R3F-black?style=for-the-badge&logo=three.js&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-orange?style=for-the-badge)

An autonomous, multi-modal **JARVIS AI** desktop assistant featuring a futuristic cinematic holographic HUD, state-driven reasoning core, multi-step agent directive engine, screen & camera vision reasoning, Android device hub, and SQLite memory system.

---

## 🏛 System Architecture

```
                                 JARVIS
                                   │
                     ┌─────────────┴─────────────┐
                     │                           │
                React Frontend              Electron
                     │                           │
                     │                    Desktop Runtime
                     │                           │
                     └──────────────┬────────────┘
                                    │
                                 IPC / WS
                                    │
                             ┌──────▼──────┐
                             │   FastAPI   │
                             │ Python Core │
                             └──────┬──────┘
                                    │
               ┌────────────┬───────┼────────┬────────────┐
               ↓            ↓       ↓        ↓            ↓
             Voice        AI      Agent    Vision      Memory
               │            │       │        │            │
              STT      Gemini/   Tools    Camera       SQLite
              TTS      OpenAI    Router   Screen       Vector DB
             Wake      Ollama
             Word
                                    │
                     ┌──────────────┼──────────────┐
                     ↓              ↓              ↓
                 Computer        Android          IoT
                 Automation      Devices         Devices
```

---

## 🚀 The 8 Major Core Systems

### 1. **SYSTEM 1 — JARVIS UI HUD (React + Three.js + Framer Motion)**
- **State-Driven Holographic Core**: Central orb dynamically transforms across visual states:
  - `IDLE`: Ambient pulse with soft center ring.
  - `LISTENING`: Expanded cyan glowing orb with microphone audio visualizer.
  - `THINKING`: Rotating inner/outer radial rings (`⟳ ◉ ⟳`).
  - `EXECUTING`: Live agent action execution tree breakdown overlay.
  - `SPEAKING`: Audio visualizer waveform ring around core.
  - `ERROR`: Amber/red alert glow.
- **Action Breakdown Timeline**: Step-by-step directive progress display (`├─ Opening Chrome ├─ Searching Google └─ Completed`).
- **Real-time Telemetry Bar**: CPU %, RAM %, Battery %, Connected Devices count, AI Engine status.

### 2. **SYSTEM 2 — Voice Engine**
- **Acoustic Wake Sentinel**: Continuous wake word listener ("Hey JARVIS").
- **Speech-to-Text**: Local Whisper transcription server or Chromium Web Speech fallback.
- **Text-to-Speech**: Neural pyttsx3 engine or Web Speech synthesis.

### 3. **SYSTEM 3 — AI Brain Abstraction**
- Interchangeable LLM backend provider interface (`AIProvider`):
  - `GeminiProvider`: Google Gemini 2.0 Flash / Pro model integration.
  - `OpenAIProvider`: OpenAI GPT-4o / GPT-4o-mini integration.
  - `OllamaProvider`: Offline local LLM inference (Llama 3 / Mistral).

### 4. **SYSTEM 4 & 5 — Agent Directive Engine & Computer Automation**
- **Autonomous Step Planner**: Decomposes complex directives into ordered tool execution steps.
- **Action Execution Router**: Asynchronous tool runner emitting real-time WebSocket progress (`agent.plan`, `tool.started`, `tool.completed`).
- **Controlled Automation Tools**:
  - **Mouse**: `move`, `click`, `drag`, `scroll`.
  - **Keyboard**: `type`, `press`, `hotkeys`, `copy`, `paste`.
  - **Applications**: `open`, `close`, `list`.
  - **Browser**: `open_url`, `search_google`, `navigate`.
  - **Files**: `search`, `read`, `create`, `rename`, `delete`.
  - **System**: `volume_up`, `volume_down`, `lock_pc`, `take_screenshot`.

### 5. **SYSTEM 6 — Vision AI & OCR Studio**
- **Screen Understanding**: Full screen capture with OCR text extraction and UI layout recognition.
- **Webcam Object Detection**: Real-time webcam frame optical reasoning (`"Jarvis, what am I holding?"`).

### 6. **SYSTEM 7 — Android Device Control Hub & IoT Gateway**
- **Device Hub Interface**: Manage connected Android phones (ADB direct / Wireless bridge) and IoT nodes.
- **Interactive Remote Capabilities**:
  - `[View Screen]`: Stream live remote device display.
  - `[Take Screenshot]`: Capture phone screenshot.
  - `[Send Command]`: Dispatch direct ADB payloads or notifications.
  - `[Open App]`: Launch YouTube / target packages remotely.

### 7. **SYSTEM 8 — Memory System & Database**
- SQLite storage for user preferences, conversation logs, task history, reminders, and registered devices.

### 8. **SECURITY & PERMISSION MANAGER**
- Strict security permission evaluation levels:
  - `SAFE`: Time, weather, screen reading.
  - `LOW_RISK`: Open app, search browser, volume control.
  - `MEDIUM_RISK`: Send device commands, create files.
  - `HIGH_RISK`: Delete files, restart/shutdown system (requires user confirmation).
  - `CRITICAL`: Shell commands.

---

## 📥 Installation & Setup

### Prerequisites
- **Node.js** v18+ and **npm**
- **Python** 3.10+
- **Git**
- *(Optional)* **Android ADB** for hardware phone connection

### 1. Clone Repository
```bash
git clone https://github.com/Balachandransakthivel/JarvisAI.git
cd JarvisAI
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

---

## 🏃 Running JARVIS

### Desktop Application Mode (Recommended)
From the root workspace directory:
```bash
cd frontend
npm run electron:dev
```
*This spawns the Python FastAPI backend automatically and opens the desktop window.*

### Web Developer Mode
1. **Start Backend**:
   ```bash
   python -m backend.main
   ```
2. **Start Frontend Dev Server**:
   ```bash
   cd frontend
   npm run dev
   ```
3. Open `http://localhost:8080` in your browser.

---

## ⚙️ Configuration

1. Open **Settings** from the left sidebar menu.
2. Select your preferred **Cognitive Matrix Node** (`gemini`, `openai`, or `ollama`).
3. Enter your API Key under **Credential Security Token** (starting with `AIza...` for Gemini).
4. Click **SYNC CONFIG** to save to the SQLite database.

---

## 📜 License

Distributed under the **MIT License**. Created by **Balachandran Sakthivel**.
