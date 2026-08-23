import os
import json
import logging
from typing import Dict, Any, List
import google.generativeai as genai
from backend.ai.base import AIProvider

logger = logging.getLogger("JARVIS")

class GeminiProvider(AIProvider):
    def __init__(self, api_key: str = None, model_name: str = "gemini-2.0-flash"):
        self.api_key = api_key or os.environ.get("GEMINI_API_KEY", "")
        self.model_name = model_name or "gemini-2.0-flash"
        if self.api_key:
            genai.configure(api_key=self.api_key)

    def _get_model(self):
        pass


    def generate_response(self, prompt: str, history: List[Dict[str, str]] = None, memories: List[Dict[str, Any]] = None) -> Dict[str, Any]:
        if not self.api_key:
            return self._fallback_rule_response(prompt)
        
        try:
            model = genai.GenerativeModel(self.model_name)
            system_prompt = (
                "You are JARVIS, an advanced, highly intelligent desktop AI assistant created by Bala. "
                "Respond concisely, politely, and professionally. Output JSON with fields:\n"
                "- 'response': Natural text response\n"
                "- 'intent': 'chat' | 'open_app' | 'close_app' | 'browser_search' | 'browser_open' | 'system_control' | 'file_operation' | 'device_command' | 'vision_analyze'\n"
                "- 'params': JSON object dictionary with parameters (e.g. app_name, query, url, action, device_id)\n"
                "Memories available: " + json.dumps(memories or [])
            )
            chat_context = system_prompt + "\nUser command: " + prompt
            res = model.generate_content(chat_context)
            text = res.text.strip()
            
            # Attempt JSON parse
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0].strip()
            elif "```" in text:
                text = text.split("```")[1].split("```")[0].strip()
                
            data = json.loads(text)
            return {
                "response": data.get("response", "Processing directive, sir."),
                "intent": data.get("intent", "chat"),
                "params": data.get("params", {})
            }
        except Exception as e:
            logger.warning(f"Gemini AI provider fallback due to: {e}")
            return self._fallback_rule_response(prompt)

    def plan_steps(self, prompt: str, available_tools: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        prompt_lower = prompt.lower()
        steps = []
        
        if "chrome" in prompt_lower or "youtube" in prompt_lower or "browser" in prompt_lower or "search" in prompt_lower:
            steps.append({"step": 1, "tool": "computer.open_app", "description": "Opening Browser / Chrome", "params": {"app_name": "chrome"}})
            if "youtube" in prompt_lower:
                steps.append({"step": 2, "tool": "browser.open", "description": "Navigating to YouTube", "params": {"url": "https://youtube.com"}})
                steps.append({"step": 3, "tool": "browser.search", "description": "Searching requested video/playlist", "params": {"query": prompt}})
            else:
                steps.append({"step": 2, "tool": "browser.search", "description": "Executing web search query", "params": {"query": prompt}})
            steps.append({"step": 4, "tool": "system.speak", "description": "Reporting execution completed", "params": {"text": "Directive executed successfully."}})
        elif "screenshot" in prompt_lower or "screen" in prompt_lower:
            steps.append({"step": 1, "tool": "vision.screenshot", "description": "Capturing full screen", "params": {}})
            steps.append({"step": 2, "tool": "vision.read_screen", "description": "Analyzing UI elements and active windows", "params": {}})
        elif "phone" in prompt_lower or "android" in prompt_lower or "device" in prompt_lower:
            steps.append({"step": 1, "tool": "device.list", "description": "Querying connected Android devices", "params": {}})
            steps.append({"step": 2, "tool": "device.send_command", "description": "Sending command payload to device", "params": {"command": prompt}})
        else:
            steps.append({"step": 1, "tool": "system.process", "description": "Processing directive", "params": {"prompt": prompt}})
            
        return steps

    def _fallback_rule_response(self, prompt: str) -> Dict[str, Any]:
        p = prompt.lower()
        if "open chrome" in p or "launch chrome" in p:
            return {"response": "Opening Google Chrome, sir.", "intent": "open_app", "params": {"app_name": "chrome"}}
        elif "open youtube" in p:
            return {"response": "Opening YouTube for you, sir.", "intent": "browser_open", "params": {"url": "https://youtube.com"}}
        elif "search" in p:
            q = p.replace("search", "").replace("for", "").strip()
            return {"response": f"Searching for {q}, sir.", "intent": "browser_search", "params": {"query": q}}
        elif "screenshot" in p:
            return {"response": "Taking a screenshot now.", "intent": "system_control", "params": {"action": "screenshot"}}
        elif "lock" in p:
            return {"response": "Locking workstation, sir.", "intent": "system_control", "params": {"action": "lock"}}
        elif "volume up" in p:
            return {"response": "Increasing volume.", "intent": "system_control", "params": {"action": "volume_up"}}
        elif "volume down" in p:
            return {"response": "Decreasing volume.", "intent": "system_control", "params": {"action": "volume_down"}}
        return {
            "response": f"I have processed your command: '{prompt}'. Systems are operational.",
            "intent": "chat",
            "params": {}
        }
