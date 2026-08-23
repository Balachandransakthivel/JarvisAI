import pyttsx3
import threading
import logging
import time

logger = logging.getLogger(__name__)

class TTSEngine:
    def __init__(self):
        self.engine = None
        self.speak_thread = None
        self.lock = threading.Lock()
        self.stop_requested = False
        
        # Initialize pyttsx3 safely in a helper
        try:
            self.engine = pyttsx3.init()
            # Set default speed and volume
            self.engine.setProperty('rate', 170)
            self.engine.setProperty('volume', 1.0)
        except Exception as e:
            logger.error(f"Failed to initialize pyttsx3 offline engine: {e}")

    def speak(self, text: str, voice_index: int = 0, rate: float = 1.0, volume: float = 1.0, on_end_callback=None) -> None:
        """Speaks text in a non-blocking background thread."""
        self.stop()
        
        with self.lock:
            self.stop_requested = False
            
        def _speak_task():
            try:
                # We need to re-initialize or run the loop inside the thread for pyttsx3 on some systems
                # pyttsx3 can be finicky about threading, so we lock/init inside the loop if needed.
                local_engine = pyttsx3.init()
                
                # Get available voices
                voices = local_engine.getProperty('voices')
                if voices and len(voices) > 0:
                    idx = min(max(0, voice_index), len(voices) - 1)
                    local_engine.setProperty('voice', voices[idx].id)
                
                # Set speed (pyttsx3 base is around 200, so scale it)
                local_engine.setProperty('rate', int(170 * rate))
                local_engine.setProperty('volume', volume)
                
                # We chunk text by sentences to allow faster interruption
                sentences = [s.strip() for s in text.split('.') if s.strip()]
                if not sentences:
                    sentences = [text]
                    
                for sentence in sentences:
                    with self.lock:
                        if self.stop_requested:
                            break
                    local_engine.say(sentence)
                    local_engine.runAndWait()
                    
            except Exception as e:
                logger.error(f"Speech playback error: {e}")
            finally:
                if on_end_callback:
                    on_end_callback()

        self.speak_thread = threading.Thread(target=_speak_task, daemon=True)
        self.speak_thread.start()

    def stop(self) -> None:
        with self.lock:
            self.stop_requested = True
        
        # We also call engine.stop() if possible
        if self.engine:
            try:
                self.engine.stop()
            except Exception:
                pass
                
        if self.speak_thread and self.speak_thread.is_alive():
            # Wait briefly for thread to yield
            self.speak_thread.join(timeout=0.5)

    def get_voices(self) -> list:
        if not self.engine:
            return []
        try:
            voices = self.engine.getProperty('voices')
            return [{"id": v.id, "name": v.name, "languages": v.languages} for v in voices]
        except Exception:
            return []

# Singleton instance
tts_engine = TTSEngine()
