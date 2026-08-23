import pyautogui
import logging

logger = logging.getLogger(__name__)

pyautogui.FAILSAFE = True

def get_mouse_position() -> tuple:
    return pyautogui.position()

def move_mouse(x: int, y: int, duration: float = 0.2) -> bool:
    try:
        pyautogui.moveTo(x, y, duration=duration)
        logger.info(f"Moved mouse to: ({x}, {y})")
        return True
    except Exception as e:
        logger.error(f"Failed to move mouse: {e}")
        return False

def click_mouse(x: int = None, y: int = None, button: str = 'left', clicks: int = 1) -> bool:
    try:
        pyautogui.click(x=x, y=y, button=button, clicks=clicks)
        logger.info(f"Clicked mouse: {button} button, {clicks} times at ({x}, {y})")
        return True
    except Exception as e:
        logger.error(f"Failed to click mouse: {e}")
        return False

def drag_mouse(x: int, y: int, duration: float = 0.5) -> bool:
    try:
        pyautogui.dragTo(x, y, duration=duration)
        logger.info(f"Dragged mouse to: ({x}, {y})")
        return True
    except Exception as e:
        logger.error(f"Failed to drag mouse: {e}")
        return False

def scroll_mouse(clicks: int) -> bool:
    """Positive for up, negative for down."""
    try:
        pyautogui.scroll(clicks)
        logger.info(f"Scrolled mouse: {clicks} clicks")
        return True
    except Exception as e:
        logger.error(f"Failed to scroll mouse: {e}")
        return False
