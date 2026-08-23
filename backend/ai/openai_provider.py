import os
import json
import logging
from typing import Dict, Any, List
import openai
from backend.ai.base import AIProvider
from backend.ai.gemini_provider import GeminiProvider

logger = logging.getLogger("JARVIS")

class OpenAIProvider(AIProvider):
    def __init__(self, api_key: str = None, model_name: str = "gpt-4o-mini", api_base: str = None):
        self.api_key = api_key or os.environ.get("OPENAI_API_KEY", "")
        self.model_name = model_name or "gpt-4o-mini"
        self.api_base = api_base or os.environ.get("OPENAI_API_BASE", "https://api.openai.com/v1")
        if self.api_key:
            openai.api_key = self.api_key
            openai.base_url = self.api_base

    def generate_response(self, prompt: str, history: List[Dict[str, str]] = None, memories: List[Dict[str, Any]] = None) -> Dict[str, Any]:
        if not self.api_key:
            return GeminiProvider()._fallback_rule_response(prompt)
            
        try:
            client = openai.OpenAI(api_key=self.api_key, base_url=self.api_base)
            messages = [
                {"role": "system", "content": "You are JARVIS AI. Return JSON with keys 'response', 'intent', 'params'."},
                {"role": "user", "content": prompt}
            ]
            response = client.chat.completions.create(
                model=self.model_name,
                messages=messages,
                response_format={"type": "json_object"}
            )
            content = json.loads(response.choices[0].message.content)
            return {
                "response": content.get("response", "Command received, sir."),
                "intent": content.get("intent", "chat"),
                "params": content.get("params", {})
            }
        except Exception as e:
            logger.warning(f"OpenAI Provider error: {e}")
            return GeminiProvider()._fallback_rule_response(prompt)

    def plan_steps(self, prompt: str, available_tools: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        return GeminiProvider().plan_steps(prompt, available_tools)
