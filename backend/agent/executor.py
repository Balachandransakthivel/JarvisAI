import asyncio
import logging
from typing import Dict, Any, Callable
from backend.agent.registry import registry
from backend.agent.permissions import PermissionManager

logger = logging.getLogger("JARVIS")

class AgentExecutor:
    def __init__(self, broadcaster: Callable = None):
        self.broadcaster = broadcaster

    def set_broadcaster(self, broadcaster: Callable):
        self.broadcaster = broadcaster

    async def execute_plan(self, plan: Dict[str, Any]):
        steps = plan.get("steps", [])
        total = plan.get("total_steps", len(steps))

        if self.broadcaster:
            await self.broadcaster({
                "event": "agent.plan",
                "message": f"Execution plan generated ({total} steps)",
                "plan": plan
            })

        for i, step in enumerate(steps, 1):
            tool_name = step.get("tool", "")
            description = step.get("description", f"Executing step {i}")
            params = step.get("params", {})

            # Check permissions
            perm = PermissionManager.evaluate(tool_name, params)
            if perm["requires_approval"]:
                if self.broadcaster:
                    await self.broadcaster({
                        "event": "tool.permission_required",
                        "tool": tool_name,
                        "description": description,
                        "level": perm["level"],
                        "step": i,
                        "total": total
                    })
                logger.warning(f"Step {i} ({tool_name}) requires manual approval.")
                # For safety, pause execution
                break

            # Broadcast step start
            if self.broadcaster:
                await self.broadcaster({
                    "event": "tool.started",
                    "tool": tool_name,
                    "description": description,
                    "step": i,
                    "total": total
                })

            await asyncio.sleep(0.5)

            # Execute tool from registry
            func = registry.get(tool_name)
            if func:
                try:
                    res = func(params)
                    if self.broadcaster:
                        await self.broadcaster({
                            "event": "tool.completed",
                            "tool": tool_name,
                            "description": f"Completed: {description}",
                            "result": str(res),
                            "step": i,
                            "total": total
                        })
                except Exception as e:
                    logger.error(f"Error executing tool {tool_name}: {e}")
                    if self.broadcaster:
                        await self.broadcaster({
                            "event": "tool.failed",
                            "tool": tool_name,
                            "description": f"Failed: {e}",
                            "step": i,
                            "total": total
                        })
            else:
                if self.broadcaster:
                    await self.broadcaster({
                        "event": "tool.completed",
                        "tool": tool_name,
                        "description": description,
                        "step": i,
                        "total": total
                    })

        if self.broadcaster:
            await self.broadcaster({
                "event": "agent.completed",
                "message": "All steps executed successfully."
            })
