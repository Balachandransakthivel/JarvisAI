import cv2
import os
import logging
import time

logger = logging.getLogger(__name__)

def capture_webcam_frame(filename: str = "webcam_capture.png") -> str:
    """Captures a single frame from the default webcam and saves it."""
    capture_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'vision')
    os.makedirs(capture_dir, exist_ok=True)
    filepath = os.path.join(capture_dir, filename)
    
    # Try capturing frame
    # Index 0 is usually the built-in webcam
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        logger.error("Webcam device could not be opened.")
        return ""
        
    try:
        # Give the camera a brief moment to warm up/adjust exposure
        time.sleep(0.3)
        ret, frame = cap.read()
        if not ret:
            logger.error("Failed to read frame from webcam.")
            return ""
            
        cv2.imwrite(filepath, frame)
        logger.info(f"Webcam capture saved to: {filepath}")
        return filepath
    except Exception as e:
        logger.error(f"Error during webcam capture: {e}")
        return ""
    finally:
        cap.release()
