from backend.automation.system import take_screenshot
from backend.vision.ocr import analyze_image_with_llm

def capture_and_analyze_screen(query: str, settings: dict) -> str:
    """Takes a screenshot and sends it to the vision AI model for analysis."""
    # Take screenshot
    filepath = take_screenshot("screen_analysis.png")
    if not filepath:
        return "I was unable to capture your screen, Bala."
        
    # Analyze the screen
    return analyze_image_with_llm(filepath, query, settings)
