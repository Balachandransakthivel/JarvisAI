import logging
from typing import Dict, Any, Callable
from backend.automation import apps, browser, system, files, mouse, keyboard
from backend.vision import screen, camera, ocr
from backend.database import sqlite
from backend.voice.tts import tts_engine
from backend.devices.manager import device_manager

logger = logging.getLogger("JARVIS")

class ToolRegistry:
    def __init__(self):
        self._tools: Dict[str, Callable] = {}
        self._register_default_tools()

    def register(self, name: str, func: Callable):
        self._tools[name] = func
        logger.info(f"Registered tool: {name}")

    def get(self, name: str) -> Callable:
        return self._tools.get(name)

    def list_tools(self) -> list:
        return list(self._tools.keys())

    def _register_default_tools(self):
        # Computer Automation
        self.register("computer.open_app", lambda params: apps.open_app(params.get("app_name", "")))
        self.register("computer.close_app", lambda params: apps.close_app(params.get("app_name", "")))
        self.register("computer.move_mouse", lambda params: mouse.move_mouse(params.get("x", 0), params.get("y", 0)))
        self.register("computer.click", lambda params: mouse.click(params.get("button", "left")))
        self.register("computer.type", lambda params: keyboard.type_text(params.get("text", "")))
        
        # Browser Automation
        self.register("browser.open", lambda params: browser.open_url(params.get("url", "")))
        self.register("browser.search", lambda params: browser.search_google(params.get("query", "")))
        
        # System Control
        self.register("system.volume_up", lambda params: system.set_volume("volume_up"))
        self.register("system.volume_down", lambda params: system.set_volume("volume_down"))
        self.register("system.mute", lambda params: system.set_volume("mute"))
        self.register("system.lock", lambda params: system.lock_pc())
        self.register("system.screenshot", lambda params: system.take_screenshot())
        self.register("system.time", lambda params: system.get_time())
        self.register("system.speak", lambda params: tts_engine.speak(params.get("text", "")))
        
        # Files
        self.register("files.create", lambda params: files.create_folder(params.get("path", "."), params.get("name", "New Folder")))
        self.register("files.delete", lambda params: files.delete_file(params.get("path", "")))
        
        # Vision
        self.register("vision.screenshot", lambda params: system.take_screenshot())
        self.register("vision.read_screen", lambda params: screen.capture_and_analyze_screen(params.get("query", "Describe screen")))
        
        # Memory
        self.register("memory.remember", lambda params: sqlite.add_memory(params.get("key", ""), params.get("value", "")))
        
        # Devices
        self.register("device.list", lambda params: device_manager.list_devices())
        self.register("device.send_command", lambda params: device_manager.send_command(params.get("device_id", ""), params.get("command", ""), params.get("params", {})))

registry = ToolRegistry()
