import os
import sys
import logging
import json
import asyncio
from dotenv import load_dotenv

# Load environment variables from root and backend .env files
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env'))
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env'))
load_dotenv()
from fastapi import FastAPI, APIRouter, File, UploadFile, WebSocket, WebSocketDisconnect, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import psutil
import socket

# Ensure backend directory is in python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database import sqlite
from backend.brain import llm
from backend.ai import GeminiProvider, OpenAIProvider, OllamaProvider
from backend.agent import AgentPlanner, AgentExecutor, PermissionManager, registry
from backend.devices import device_manager
from backend.automation import apps, browser, system, files, keyboard, mouse
from backend.voice import tts, whisper, wakeword
from backend.vision import camera, screen, ocr

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("JARVIS")

app = FastAPI(title="JARVIS AI Desktop Assistant Backend", version="1.0.0")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for local desktop communications
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Active WebSocket connections
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket client connected. Active connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket client disconnected. Active connections: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        dead_connections = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                dead_connections.append(connection)
                
        for dead in dead_connections:
            self.disconnect(dead)

manager = ConnectionManager()

# Background telemetry task
async def telemetry_loop():
    logger.info("Starting telemetry broadcasting loop...")
    while True:
        try:
            if len(manager.active_connections) > 0:
                cpu = psutil.cpu_percent()
                ram = psutil.virtual_memory().percent
                
                # Battery info (handle systems without batteries gracefully)
                battery = psutil.sensors_battery()
                battery_percent = battery.percent if battery else 100
                battery_plugged = battery.power_plugged if battery else True
                
                # Check internet connection
                internet = False
                try:
                    socket.setdefaulttimeout(1)
                    socket.socket(socket.AF_INET, socket.SOCK_STREAM).connect(("8.8.8.8", 53))
                    internet = True
                except Exception:
                    pass
                    
                await manager.broadcast({
                    "type": "telemetry",
                    "data": {
                        "cpu": cpu,
                        "ram": ram,
                        "battery": {
                            "percent": battery_percent,
                            "plugged": battery_plugged
                        },
                        "internet": internet
                    }
                })
        except Exception as e:
            logger.error(f"Error in telemetry loop: {e}")
        await asyncio.sleep(2)

@app.on_event("startup")
async def startup_event():
    # Start telemetry broadcasting loop
    asyncio.create_task(telemetry_loop())
    
    # Check and initialize settings in DB if empty
    current_settings = sqlite.get_settings()
    if not current_settings:
        default_settings = {
            "userName": "Bala",
            "wakeWord": "hey jarvis",
            "voiceEnabled": True,
            "voiceRate": 1.0,
            "voicePitch": 1.0,
            "voiceVolume": 1.0,
            "autoListen": True,
            "soundEffects": True,
            "aiProvider": "gemini",
            "apiKey": "",
            "apiBase": "",
            "selectedModel": "gemini-2.0-flash",
            "sttProvider": "local"
        }
        sqlite.save_all_settings(default_settings)
        logger.info("Initialized default settings in SQLite database.")
        
    # Start wake word listener if autoListen is on
    settings = sqlite.get_settings()
    if settings.get("autoListen", False):
        start_local_wakeword_listener(settings.get("wakeWord", "hey jarvis"))

def trigger_wake_word_event():
    """Triggered when the Python backend hears 'hey jarvis'."""
    logger.info("Wake word detected locally! Broadcasting to client UI...")
    asyncio.run_coroutine_threadsafe(
        manager.broadcast({"type": "wakeword_detected", "wakeWord": "hey jarvis"}),
        asyncio.get_event_loop()
    )

def start_local_wakeword_listener(phrase: str):
    wakeword.wake_detector.start(phrase, trigger_wake_word_event)

# ─── Pydantic Models ──────────────────────────────────────────────────────────

class SettingsUpdate(BaseModel):
    userName: str = None
    wakeWord: str = None
    voiceEnabled: bool = None
    voiceRate: float = None
    voicePitch: float = None
    voiceVolume: float = None
    autoListen: bool = None
    soundEffects: bool = None
    aiProvider: str = None
    apiKey: str = None
    apiBase: str = None
    selectedModel: str = None
    sttProvider: str = None

class CommandInput(BaseModel):
    text: str

class MemoryInput(BaseModel):
    key: str
    value: str
    category: str = "general"

class ReminderInput(BaseModel):
    task: str
    due_time: str

class SpeakInput(BaseModel):
    text: str
    voiceIndex: int = 0
    rate: float = 1.0
    volume: float = 1.0

class VisionInput(BaseModel):
    source: str  # "webcam" or "screen"
    query: str

class AutomationInput(BaseModel):
    intent: str
    params: dict = {}

# ─── API Routes ───────────────────────────────────────────────────────────────

# Health
@app.get("/api/health")
def health_check():
    import datetime
    return {
        "status": "ok",
        "service": "JARVIS AI Backend",
        "version": "1.0.0",
        "timestamp": datetime.datetime.now().isoformat(),
        "connections": len(manager.active_connections),
    }

# Settings
@app.get("/api/settings")
def get_settings():
    return sqlite.get_settings()

@app.post("/api/settings")
def update_settings(payload: SettingsUpdate):
    settings = payload.dict(exclude_unset=True)
    sqlite.save_all_settings(settings)
    
    # Re-fetch combined settings
    updated = sqlite.get_settings()
    
    # Adjust wake word listener
    if "wakeWord" in settings or "autoListen" in settings:
        if updated.get("autoListen", False):
            start_local_wakeword_listener(updated.get("wakeWord", "hey jarvis"))
        else:
            wakeword.wake_detector.stop()
            
    return updated

# Memories
@app.get("/api/memory")
def get_memory():
    return sqlite.get_memories()

@app.post("/api/memory")
def add_memory(payload: MemoryInput):
    return sqlite.add_memory(payload.key, payload.value, payload.category)

@app.delete("/api/memory/{memory_id}")
def delete_memory(memory_id: str):
    sqlite.delete_memory(memory_id)
    return {"success": True}

@app.post("/api/memory/clear")
def clear_memories():
    sqlite.clear_memories()
    return {"success": True}

# History
@app.get("/api/history")
def get_history():
    return sqlite.get_history()

@app.post("/api/history/clear")
def clear_history():
    sqlite.clear_history()
    return {"success": True}

# Reminders
@app.get("/api/reminders")
def get_reminders():
    return sqlite.get_reminders()

@app.post("/api/reminders")
def add_reminder(payload: ReminderInput):
    return sqlite.add_reminder(payload.task, payload.due_time)

@app.post("/api/reminders/{reminder_id}/toggle")
def toggle_reminder(reminder_id: str):
    sqlite.toggle_reminder(reminder_id)
    return {"success": True}

@app.delete("/api/reminders/{reminder_id}")
def delete_reminder(reminder_id: str):
    sqlite.delete_reminder(reminder_id)
    return {"success": True}

# Conversations
@app.get("/api/chat/history")
def get_chat_history():
    return sqlite.get_chat_history()

@app.post("/api/chat/clear")
def clear_chat_history():
    sqlite.clear_chat_history()
    return {"success": True}

# Telemetry Endpoint
@app.get("/api/system/stats")
def get_system_stats():
    cpu = psutil.cpu_percent()
    ram = psutil.virtual_memory().percent
    battery = psutil.sensors_battery()
    return {
        "cpu": cpu,
        "ram": ram,
        "battery": {
            "percent": battery.percent if battery else 100,
            "plugged": battery.power_plugged if battery else True
        }
    }

# Speech to Text
@app.post("/api/voice/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    try:
        temp_dir = os.path.join(os.path.dirname(__file__), 'data', 'temp')
        os.makedirs(temp_dir, exist_ok=True)
        temp_path = os.path.join(temp_dir, f"recording_{int(asyncio.get_event_loop().time())}.wav")
        
        with open(temp_path, "wb") as buffer:
            buffer.write(await file.read())
            
        settings = sqlite.get_settings()
        text = whisper.transcribe_audio_file(temp_path, settings)
        
        # Cleanup file
        if os.path.exists(temp_path):
            os.remove(temp_path)
            
        return {"text": text}
    except Exception as e:
        logger.error(f"Upload and transcription error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Text to Speech
@app.post("/api/voice/speak")
def speak_text(payload: SpeakInput):
    tts.tts_engine.speak(
        text=payload.text, 
        voice_index=payload.voiceIndex, 
        rate=payload.rate, 
        volume=payload.volume
    )
    return {"success": True}

@app.post("/api/voice/stop")
def stop_speech():
    tts.tts_engine.stop()
    return {"success": True}

@app.get("/api/voice/voices")
def get_voices():
    return tts.tts_engine.get_voices()

# Vision
@app.post("/api/vision/analyze")
def analyze_vision(payload: VisionInput):
    settings = sqlite.get_settings()
    
    if payload.source == "webcam":
        path = camera.capture_webcam_frame()
        if not path:
            return {"response": "I could not access your webcam device, Bala."}
        analysis = ocr.analyze_image_with_llm(path, payload.query, settings)
        # Cleanup
        if os.path.exists(path):
            os.remove(path)
        return {"response": analysis}
        
    elif payload.source == "screen":
        analysis = screen.capture_and_analyze_screen(payload.query, settings)
        return {"response": analysis}
        
    raise HTTPException(status_code=400, detail="Invalid vision source")

# ─── Device Hub Endpoints ─────────────────────────────────────────────────────
@app.get("/api/devices")
def list_devices():
    return device_manager.list_devices()

class DeviceCommandInput(BaseModel):
    device_id: str
    command: str
    params: dict = {}

@app.post("/api/devices/command")
def send_device_command(payload: DeviceCommandInput):
    return device_manager.send_command(payload.device_id, payload.command, payload.params)

# ─── Command Brain Router & Agent Execution ──────────────────────────────────
@app.post("/api/command")
async def process_user_command(payload: CommandInput, background_tasks: BackgroundTasks):
    settings = sqlite.get_settings()
    memories = sqlite.get_memories()
    chat_history = sqlite.get_chat_history()
    
    # Save user message in DB
    sqlite.add_chat_message("user", payload.text)
    
    # Get Provider and generate response
    ai_provider_name = settings.get("aiProvider", "gemini")
    api_key = settings.get("apiKey", "")
    api_base = settings.get("apiBase", "")
    model_name = settings.get("selectedModel", "gemini-2.0-flash")
    
    if ai_provider_name == "openai":
        provider = OpenAIProvider(api_key=api_key, model_name=model_name, api_base=api_base)
    elif ai_provider_name == "ollama":
        provider = OllamaProvider(api_base=api_base or "http://localhost:11434", model_name=model_name)
    else:
        provider = GeminiProvider(api_key=api_key, model_name=model_name)
        
    result = provider.generate_response(payload.text, chat_history, memories)
    
    intent = result.get("intent", "chat")
    response_text = result.get("response", "")
    params = result.get("params", {})
    
    # Save assistant message in DB
    sqlite.add_chat_message("jarvis", response_text, intent)
    sqlite.add_history(payload.text, response_text, intent, success=1)
    
    # Create Agent Plan for complex directives
    planner = AgentPlanner(provider)
    plan = planner.create_plan(payload.text)
    
    # Broadcast agent state and plan via WebSocket
    await manager.broadcast({
        "event": "agent.plan",
        "message": f"Planned {plan['total_steps']} steps",
        "plan": plan
    })
    
    executor = AgentExecutor(broadcaster=manager.broadcast)
    background_tasks.add_task(executor.execute_plan, plan)
    
    return {
        "response": response_text,
        "intent": intent,
        "params": params,
        "plan": plan
    }

# Direct Automation trigger
@app.post("/api/automation/execute")
def trigger_automation(payload: AutomationInput, background_tasks: BackgroundTasks):
    background_tasks.add_task(execute_automation_intent, payload.intent, payload.params)
    return {"success": True}


# ─── Automation Executor ──────────────────────────────────────────────────────

def execute_automation_intent(intent: str, params: dict):
    logger.info(f"Executing automation intent: {intent} with params: {params}")
    try:
        if intent == "open_app":
            apps.open_app(params.get("app_name", ""))
            
        elif intent == "close_app":
            apps.close_app(params.get("app_name", ""))
            
        elif intent == "browser_search":
            browser.search_google(params.get("query", ""))
            
        elif intent == "browser_open":
            browser.open_url(params.get("url", ""))
            
        elif intent == "system_control":
            action = params.get("action", "")
            if action in ["volume_up", "volume_down", "mute"]:
                system.set_volume(action)
            elif action == "lock":
                system.lock_pc()
            elif action == "screenshot":
                system.take_screenshot()
            elif action == "restart":
                system.restart(confirmed=True)
            elif action == "shutdown":
                system.shutdown(confirmed=True)
                
        elif intent == "file_operation":
            action = params.get("action", "")
            path = params.get("path", "")
            name = params.get("name", "")
            if action == "create_folder" and name:
                files.create_folder(path, name)
            elif action == "delete_file":
                files.delete_file(path)
                
        elif intent == "memory_set":
            key = params.get("key", "")
            value = params.get("value", "")
            if key and value:
                sqlite.add_memory(key, value)
                
        elif intent == "reminder_set":
            task = params.get("task", "")
            due = params.get("due_time", "")
            if task and due:
                sqlite.add_reminder(task, due)
                
    except Exception as e:
        logger.error(f"Error executing automation '{intent}': {e}")

# ─── WebSocket Server ─────────────────────────────────────────────────────────

@app.websocket("/api/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep-alive or handle incoming text messages
            data = await websocket.receive_text()
            logger.info(f"WS raw message received: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    # If running with a test argument, exit immediately (used in verification check)
    if "--test" in sys.argv:
        print("FastAPI main.py check: Success. Exiting test.")
        sys.exit(0)
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
