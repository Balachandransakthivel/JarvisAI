import os
import time
import ctypes
import logging
from datetime import datetime
import pyautogui

logger = logging.getLogger(__name__)

# Virtual key codes on Windows
VK_VOLUME_MUTE = 0xAD
VK_VOLUME_DOWN = 0xAE
VK_VOLUME_UP = 0xAF

def set_volume(action: str) -> bool:
    """Controls volume using ctypes to send media key events on Windows."""
    if os.name != 'nt':
        logger.warn("Volume control currently only fully tested on Windows")
        return False
        
    try:
        # Simulate pressing the key
        if action == "volume_up":
            # Press Volume Up 5 times
            for _ in range(5):
                ctypes.windll.user32.keybd_event(VK_VOLUME_UP, 0, 0, 0)
                ctypes.windll.user32.keybd_event(VK_VOLUME_UP, 0, 2, 0) # Keyup
            return True
        elif action == "volume_down":
            # Press Volume Down 5 times
            for _ in range(5):
                ctypes.windll.user32.keybd_event(VK_VOLUME_DOWN, 0, 0, 0)
                ctypes.windll.user32.keybd_event(VK_VOLUME_DOWN, 0, 2, 0)
            return True
        elif action == "mute":
            ctypes.windll.user32.keybd_event(VK_VOLUME_MUTE, 0, 0, 0)
            ctypes.windll.user32.keybd_event(VK_VOLUME_MUTE, 0, 2, 0)
            return True
    except Exception as e:
        logger.error(f"Error controlling volume: {e}")
        
    return False

def lock_pc() -> bool:
    try:
        if os.name == 'nt':
            ctypes.windll.user32.LockWorkStation()
            return True
        elif os.name == 'posix':
            # macOS lock screen
            import subprocess
            subprocess.run(["pmset", "displaysleepnow"])
            return True
    except Exception as e:
        logger.error(f"Failed to lock workstation: {e}")
    return False

def take_screenshot(filename: str = None) -> str:
    """Takes a screenshot using PyAutoGUI and returns the path."""
    try:
        screenshots_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'screenshots')
        os.makedirs(screenshots_dir, exist_ok=True)
        
        if not filename:
            filename = f"screenshot_{int(time.time())}.png"
            
        filepath = os.path.join(screenshots_dir, filename)
        pyautogui.screenshot(filepath)
        logger.info(f"Screenshot saved to: {filepath}")
        return filepath
    except Exception as e:
        logger.error(f"Failed to capture screenshot: {e}")
        return ""

def shutdown(confirmed: bool = False) -> bool:
    if not confirmed:
        logger.warn("Shutdown command requires confirmation parameter.")
        return False
    try:
        if os.name == 'nt':
            os.system("shutdown /s /t 5")
            return True
        else:
            os.system("shutdown -h now")
            return True
    except Exception as e:
        logger.error(f"Shutdown failed: {e}")
    return False

def restart(confirmed: bool = False) -> bool:
    if not confirmed:
        logger.warn("Restart command requires confirmation parameter.")
        return False
    try:
        if os.name == 'nt':
            os.system("shutdown /r /t 5")
            return True
        else:
            os.system("shutdown -r now")
            return True
    except Exception as e:
        logger.error(f"Restart failed: {e}")
    return False

def get_time() -> dict:
    """Returns current date and time information."""
    now = datetime.now()
    return {
        "time": now.strftime("%H:%M:%S"),
        "date": now.strftime("%Y-%m-%d"),
        "day": now.strftime("%A"),
        "timezone": str(now.astimezone().tzinfo),
        "timestamp": int(now.timestamp())
    }
