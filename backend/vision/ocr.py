import os
import base64
import logging
from PIL import Image
import google.generativeai as genai
from openai import OpenAI

logger = logging.getLogger(__name__)

def encode_image_to_base64(image_path: str) -> str:
    """Encodes an image to a base64 string for OpenAI vision API."""
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

def analyze_image_with_llm(image_path: str, query: str, settings: dict) -> str:
    """Sends an image file to a multimodal LLM to describe or extract details."""
    if not os.path.exists(image_path):
        return "I can't see the image file, Bala. It seems to have vanished."

    provider = settings.get("aiProvider", "gemini").lower()
    api_key = settings.get("apiKey", "")
    api_base = settings.get("apiBase", "")
    model_name = settings.get("selectedModel", "")

    # Mode 1: Gemini Multimodal (Default)
    if provider == "gemini":
        key = api_key or os.getenv("GEMINI_API_KEY", "")
        if not key:
            return "Gemini API key is missing. Please add it in settings."
        try:
            genai.configure(api_key=key)
            is_gemini_model = model_name and (model_name.lower().startswith("gemini") or "gemini" in model_name.lower())
            model_to_use = model_name if is_gemini_model else "gemini-2.0-flash"
            model = genai.GenerativeModel(model_name=model_to_use)
            
            # Open image using PIL
            img = Image.open(image_path)
            
            # Send prompt and image
            try:
                response = model.generate_content([query, img])
                return response.text.strip()
            except Exception as e:
                err_str = str(e)
                if ("429" in err_str or "quota" in err_str.lower() or "limit" in err_str.lower()) and "1.5" not in model_to_use:
                    fallback_model_name = "gemini-1.5-flash"
                    logger.warning(f"Gemini Vision rate limit/quota hit for {model_to_use}. Attempting fallback to {fallback_model_name}...")
                    try:
                        fallback_model = genai.GenerativeModel(model_name=fallback_model_name)
                        response = fallback_model.generate_content([query, img])
                        return response.text.strip()
                    except Exception as fallback_err:
                        logger.error(f"Gemini Vision fallback to {fallback_model_name} failed: {fallback_err}")
                raise e
        except Exception as e:
            logger.error(f"Gemini Vision error: {e}")
            return f"I had trouble analyzing the image with Gemini, Bala. Error: {str(e)}"

    # Mode 2: OpenAI Multimodal (GPT-4o / GPT-4o-mini)
    elif provider == "openai":
        key = api_key or os.getenv("OPENAI_API_KEY", "")
        if not key:
            return "OpenAI API key is missing. Please add it in settings."
        try:
            client = OpenAI(api_key=key, base_url=api_base or None)
            base64_image = encode_image_to_base64(image_path)
            
            # Form vision messages
            messages = [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": query},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/png;base64,{base64_image}"
                            }
                        }
                    ]
                }
            ]
            
            # Use gpt-4o-mini or user-selected vision model
            model = model_name if model_name and ("gpt-4" in model_name or "o1" in model_name) else "gpt-4o-mini"
            
            response = client.chat.completions.create(
                model=model,
                messages=messages,
                max_tokens=300
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"OpenAI Vision error: {e}")
            return f"I had trouble analyzing the image with OpenAI, Bala. Error: {str(e)}"
            
    # Mode 3: Local/Ollama
    elif provider == "ollama":
        base_url = api_base or "http://localhost:11434/v1"
        try:
            client = OpenAI(api_key="ollama", base_url=base_url)
            base64_image = encode_image_to_base64(image_path)
            
            messages = [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": query},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/png;base64,{base64_image}"
                            }
                        }
                    ]
                }
            ]
            # Use llama3-vision or llava if model selected, otherwise default to model_name
            model = model_name or "llava"
            response = client.chat.completions.create(
                model=model,
                messages=messages
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"Ollama Vision error: {e}")
            return f"I couldn't analyze the image using local Ollama, Bala. Ensure you have a vision model (like 'llava') installed."

    return "No compatible multimodal AI provider configured."
