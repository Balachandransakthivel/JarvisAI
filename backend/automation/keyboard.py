import pyautogui
import logging

logger = logging.getLogger(__name__)

# Reduce PyAutoGUI pauses
pyautogui.PAUSE = 0.1
pyautogui.FAILSAFE = True  # Move mouse to top-left corner to abort

def type_text(text: str) -> bool:
    try:
        pyautogui.write(text, interval=0.01)
        logger.info(f"Typed text: {text[:20]}...")
        return True
    except Exception as e:
        logger.error(f"Failed to type text: {e}")
        return False

def press_key(key: str) -> bool:
    try:
        pyautogui.press(key)
        logger.info(f"Pressed key: {key}")
        return True
    except Exception as e:
        logger.error(f"Failed to press key {key}: {e}")
        return False

def press_hotkey(keys: list) -> bool:
    try:
        pyautogui.hotkey(*keys)
        logger.info(f"Pressed hotkey combo: {keys}")
        return True
    except Exception as e:
        logger.error(f"Failed to press hotkeys {keys}: {e}")
        return False
