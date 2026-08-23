from abc import ABC, abstractmethod
from typing import Dict, Any, List

class AIProvider(ABC):
    """
    Abstract Base Class for AI Providers (Gemini, OpenAI, Ollama).
    Ensures interchangeable LLM backends without changing JARVIS core logic.
    """
    @abstractmethod
    def generate_response(self, prompt: str, history: List[Dict[str, str]] = None, memories: List[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Generates structured response containing:
        - response: Natural language response to speak/display
        - intent: Identified action intent (e.g. browser_task, system_control, open_app, chat)
        - params: Direct parameter payload for automation tools
        """
        pass

    @abstractmethod
    def plan_steps(self, prompt: str, available_tools: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Decomposes complex directives into an ordered list of tool execution steps.
        Each step: {"step": 1, "tool": "browser.open", "description": "Opening Chrome", "params": {...}}
        """
        pass
