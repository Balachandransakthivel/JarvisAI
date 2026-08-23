import os
import logging

logger = logging.getLogger(__name__)

# Try to import faster-whisper (local offline STT)
try:
    from faster_whisper import WhisperModel
    HAS_FASTER_WHISPER = True
except ImportError:
    HAS_FASTER_WHISPER = False

# Try to import standard speech recognition (online free API)
try:
    import speech_recognition as sr
    HAS_SPEECH_REC = True
except ImportError:
    HAS_SPEECH_REC = False

# Local whisper model cache
_local_model = None

def get_whisper_model(model_size="tiny.en"):
    global _local_model
    if not HAS_FASTER_WHISPER:
        return None
    if _local_model is None:
        try:
            logger.info(f"Loading faster-whisper model '{model_size}'...")
            # Run on CPU by default for portability, using int8 quantization for speed
            _local_model = WhisperModel(model_size, device="cpu", compute_type="int8")
        except Exception as e:
            logger.error(f"Error loading faster-whisper model: {e}")
            return None
    return _local_model

def transcribe_audio_file(file_path: str, settings: dict) -> str:
    """Transcribes a WAV audio file to text."""
    if not os.path.exists(file_path):
        logger.error(f"Audio file does not exist: {file_path}")
        return ""

    provider = settings.get("sttProvider", "local").lower()
    
    # Mode 1: Local Faster-Whisper
    if provider == "local" and HAS_FASTER_WHISPER:
        try:
            model = get_whisper_model()
            if model:
                segments, info = model.transcribe(file_path, beam_size=5)
                text = " ".join([seg.text for seg in segments]).strip()
                logger.info(f"Local Whisper transcription: {text}")
                return text
        except Exception as e:
            logger.error(f"Local Whisper transcription failed: {e}")
            # Fall back to other providers below

    # Mode 2: OpenAI Whisper API
    openai_key = settings.get("apiKey", "") or os.getenv("OPENAI_API_KEY", "")
    if (provider == "openai" or not HAS_FASTER_WHISPER) and openai_key:
        try:
            from openai import OpenAI
            client = OpenAI(api_key=openai_key)
            with open(file_path, "rb") as audio_file:
                transcription = client.audio.transcriptions.create(
                    model="whisper-1", 
                    file=audio_file
                )
            text = transcription.text.strip()
            logger.info(f"OpenAI Whisper API transcription: {text}")
            return text
        except Exception as e:
            logger.error(f"OpenAI Whisper API transcription failed: {e}")

    # Mode 3: Google Speech Recognition (free, no key required, needs internet)
    if HAS_SPEECH_REC:
        try:
            r = sr.Recognizer()
            with sr.AudioFile(file_path) as source:
                audio_data = r.record(source)
            text = r.recognize_google(audio_data)
            logger.info(f"Google STT transcription: {text}")
            return text
        except Exception as e:
            logger.error(f"Google Speech Recognition failed: {e}")

    logger.error("All speech-to-text engines failed or were not installed.")
    return ""
