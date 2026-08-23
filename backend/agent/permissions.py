from enum import Enum
import logging
from typing import Dict, Any

logger = logging.getLogger("JARVIS")

class PermissionLevel(str, Enum):
    SAFE = "SAFE"                 # E.g. Tell time, check weather, read screen info
    LOW_RISK = "LOW_RISK"         # E.g. Open app, volume up/down, search browser
    MEDIUM_RISK = "MEDIUM_RISK"   # E.g. Send device command, create file, change setting
    HIGH_RISK = "HIGH_RISK"       # E.g. Delete files, system restart/shutdown, clear database
    CRITICAL = "CRITICAL"         # E.g. Shell execution, system formatting

TOOL_PERMISSIONS = {
    "system.time": PermissionLevel.SAFE,
    "system.weather": PermissionLevel.SAFE,
    "vision.read_screen": PermissionLevel.SAFE,
    "vision.screenshot": PermissionLevel.SAFE,
    "device.list": PermissionLevel.SAFE,
    
    "computer.open_app": PermissionLevel.LOW_RISK,
    "browser.open": PermissionLevel.LOW_RISK,
    "browser.search": PermissionLevel.LOW_RISK,
    "system.volume_up": PermissionLevel.LOW_RISK,
    "system.volume_down": PermissionLevel.LOW_RISK,
    
    "device.send_command": PermissionLevel.MEDIUM_RISK,
    "files.create": PermissionLevel.MEDIUM_RISK,
    "memory.remember": PermissionLevel.MEDIUM_RISK,
    
    "files.delete": PermissionLevel.HIGH_RISK,
    "system.shutdown": PermissionLevel.HIGH_RISK,
    "system.restart": PermissionLevel.HIGH_RISK,
    "memory.clear": PermissionLevel.HIGH_RISK,
    "system.shell": PermissionLevel.CRITICAL
}

class PermissionManager:
    @staticmethod
    def evaluate(tool_name: str, params: Dict[str, Any] = None) -> Dict[str, Any]:
        level = TOOL_PERMISSIONS.get(tool_name, PermissionLevel.LOW_RISK)
        requires_approval = level in [PermissionLevel.HIGH_RISK, PermissionLevel.CRITICAL]
        return {
            "tool": tool_name,
            "level": level.value,
            "requires_approval": requires_approval,
            "allowed": not requires_approval
        }
