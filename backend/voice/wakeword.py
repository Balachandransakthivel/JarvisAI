import threading
import time
import logging

logger = logging.getLogger(__name__)

# Try to import openwakeword and pyaudio
try:
    import pyaudio
    import numpy as np
    # openwakeword is a heavy ML library, we import it inside function if available
    HAS_LOCAL_WAKEWORD = True
except ImportError:
    HAS_LOCAL_WAKEWORD = False

# Try to import standard speech recognition
try:
    import speech_recognition as sr
    HAS_SPEECH_REC = True
except ImportError:
    HAS_SPEECH_REC = False

class WakeWordDetector:
    def __init__(self):
        self.is_listening = False
        self.listen_thread = None
        self.callback = None
        self.wake_word = "hey jarvis"

    def start(self, wake_word: str, callback) -> bool:
        """Starts the wake word detection loop in a background thread."""
        self.stop()
        self.wake_word = wake_word.lower()
        self.callback = callback
        self.is_listening = True
        
        self.listen_thread = threading.Thread(target=self._run_detector, daemon=True)
        self.listen_thread.start()
        logger.info(f"Wake word detector started for word: '{self.wake_word}'")
        return True

    def stop(self) -> None:
        self.is_listening = False
        if self.listen_thread and self.listen_thread.is_alive():
            self.listen_thread.join(timeout=1.0)
        logger.info("Wake word detector stopped")

    def _run_detector(self):
        # Method A: Try openwakeword if dependencies are available
        if HAS_LOCAL_WAKEWORD:
            try:
                from openwakeword.model import Model
                
                # Initialize PyAudio
                p = pyaudio.PyAudio()
                FORMAT = pyaudio.paInt16
                CHANNELS = 1
                RATE = 16000
                CHUNK = 1280  # openwakeword expects chunks of 1280 samples at 16kHz
                
                # Try opening stream
                stream = p.open(
                    format=FORMAT,
                    channels=CHANNELS,
                    rate=RATE,
                    input=True,
                    frames_per_buffer=CHUNK
                )
                
                # Load models (includes "hey jarvis" by default)
                oww_model = Model(inference_framework="onnx")
                
                logger.info("Local openwakeword detector loop active.")
                while self.is_listening:
                    data = stream.read(CHUNK, exception_on_overflow=False)
                    audio_data = np.frombuffer(data, dtype=np.int16)
                    
                    # Feed to model
                    prediction = oww_model.predict(audio_data)
                    
                    # Check prediction for wake word
                    for key, val in prediction.items():
                        if "jarvis" in key.lower() and val > 0.6:
                            logger.info(f"Wake word triggered via openwakeword: {key} (confidence: {val})")
                            if self.callback:
                                self.callback()
                                time.sleep(2) # Cooldown
                                oww_model.reset()
                                
                stream.stop_stream()
                stream.close()
                p.terminate()
                return
            except Exception as e:
                logger.error(f"Failed to start openwakeword loop, falling back to speech recognition: {e}")
                
        # Method B: SpeechRecognition fallback loop (less CPU optimized, but highly reliable cross-platform)
        if HAS_SPEECH_REC:
            try:
                r = sr.Recognizer()
                mic = sr.Microphone()
                
                # Adjust for ambient noise once
                with mic as source:
                    r.adjust_for_ambient_noise(source, duration=1.0)
                
                logger.info("Continuous SpeechRecognition wake loop active.")
                
                while self.is_listening:
                    try:
                        with mic as source:
                            # Listen for short phrases (max 3 seconds to keep it snappy)
                            audio = r.listen(source, timeout=1.0, phrase_time_limit=3.0)
                        
                        # Transcribe text
                        text = r.recognize_google(audio).lower()
                        if self.wake_word in text:
                            logger.info(f"Wake word triggered via SpeechRecognition: '{text}'")
                            if self.callback:
                                self.callback()
                                time.sleep(2) # Cooldown
                    except (sr.WaitTimeoutError, sr.UnknownValueError):
                        # Timeout or unrecognized audio, keep listening
                        continue
                    except Exception as e:
                        logger.error(f"SpeechRecognition loop error: {e}")
                        time.sleep(2)
            except Exception as e:
                logger.error(f"Could not initialize speech recognition mic input: {e}")
                
        # Method C: Standby mode (relying on frontend wake word)
        logger.info("Wake word engine in standby. Relying on frontend web speech triggers.")
        while self.is_listening:
            time.sleep(1)

# Singleton instance
wake_detector = WakeWordDetector()
