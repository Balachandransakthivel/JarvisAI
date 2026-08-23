import logging
from typing import List, Dict, Any
from backend.ai import GeminiProvider, OpenAIProvider, OllamaProvider
from backend.agent.registry import registry

logger = logging.getLogger("JARVIS")

class AgentPlanner:
    def __init__(self, provider_instance = None):
        self.provider = provider_instance or GeminiProvider()

    def set_provider(self, provider_instance):
        self.provider = provider_instance

    def create_plan(self, prompt: str) -> Dict[str, Any]:
        """
        Transforms raw prompt into an execution plan with ordered step sequence.
        """
        tools = registry.list_tools()
        steps = self.provider.plan_steps(prompt, available_tools=tools)
        return {
            "intent": "agent_directive",
            "prompt": prompt,
            "steps": steps,
            "total_steps": len(steps)
        }
