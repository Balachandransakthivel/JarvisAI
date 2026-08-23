import json
import logging
from typing import Dict, Any, List
import requests
from backend.ai.base import AIProvider
from backend.ai.gemini_provider import GeminiProvider

logger = logging.getLogger("JARVIS")

class OllamaProvider(AIProvider):
    def __init__(self, api_base: str = "http://localhost:11434", model_name: str = "llama3"):
        self.api_base = api_base or "http://localhost:11434"
        self.model_name = model_name or "llama3"

    def generate_response(self, prompt: str, history: List[Dict[str, str]] = None, memories: List[Dict[str, Any]] = None) -> Dict[str, Any]:
        try:
            url = f"{self.api_base}/api/generate"
            sys_prompt = "You are JARVIS AI. Reply in JSON with keys: response, intent, params."
            payload = {
                "model": self.model_name,
                "prompt": f"{sys_prompt}\nUser: {prompt}\nJSON:",
                "stream": False
            }
            res = requests.post(url, json=payload, timeout=5)
            if res.status_code == 200:
                text = res.json().get("response", "")
                data = json.loads(text)
                return {
                    "response": data.get("response", "Directive registered."),
                    "intent": data.get("intent", "chat"),
                    "params": data.get("params", {})
                }
        except Exception as e:
            logger.warning(f"Ollama provider unavailable ({e}), using rule fallback.")
        return GeminiProvider()._fallback_rule_response(prompt)

    def plan_steps(self, prompt: str, available_tools: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        return GeminiProvider().plan_steps(prompt, available_tools)
