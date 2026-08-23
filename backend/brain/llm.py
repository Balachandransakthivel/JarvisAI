import os
import json
import logging
from abc import ABC, abstractmethod
import google.generativeai as genai
from openai import OpenAI

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are JARVIS (Just A Rather Very Intelligent System), a professional, highly intelligent, calm, and friendly desktop AI assistant inspired by Iron Man's JARVIS, created for Bala.

Persona:
- Calm, confident, intelligent, friendly, slightly futuristic.
- Professional and respectful, always addressing the user as "Bala".
- Greeting: "Hello Bala. How may I assist you today?"
- Speaks naturally, concise by default, detailed when requested.

Current Context:
- User Name: Bala
- Today's date and time is provided by the environment.

You are running inside a desktop environment. Based on the user's input, you can chat with the user OR issue commands to automate the computer.
You MUST respond with a JSON object. Do not wrap it in markdown code blocks. The JSON object MUST contain three fields:
1. "response": Your natural language spoken/written response to Bala. Keep it short, helpful, and matching your JARVIS persona. Explain what you are doing if launching an automation.
2. "intent": The action you want to take. If no automation is needed, use "chat".
Supported intents:
  - "open_app": Open a local application. Params: "app_name" (e.g., "vscode", "chrome", "explorer", "notepad", "calculator", "spotify").
  - "close_app": Close an application. Params: "app_name" (e.g., "vscode", "chrome", "explorer", "notepad", "calculator").
  - "browser_search": Search the web. Params: "query" (search terms).
  - "browser_open": Open a website. Params: "url" (complete url starting with http/https, e.g. "https://youtube.com", "https://gmail.com", "https://chatgpt.com").
  - "system_control": Control system settings. Params: "action" (values: "volume_up", "volume_down", "mute", "lock", "screenshot", "restart", "shutdown").
  - "file_operation": File system tasks. Params: "action" ("create_folder", "list_files", "delete_file"), "path" (absolute or relative path), "name" (optional new directory/file name).
  - "memory_set": Save information to remember. Params: "key", "value".
  - "memory_get": Retrieve information from memory. Params: "query" (what to search).
  - "reminder_set": Set a reminder. Params: "task", "due_time" (e.g. "5 minutes", "tomorrow at 10 AM", "6:00 PM").
  - "vision_analysis": Understand screen or webcam. Params: "source" ("webcam", "screen"), "query" (what to look for).
3. "params": A dictionary of parameters matching the intent. If no parameters, use {}.

Example output:
{
  "response": "Certainly, Bala. Launching Visual Studio Code now.",
  "intent": "open_app",
  "params": {
    "app_name": "vscode"
  }
}
"""

class AIProvider(ABC):
    @abstractmethod
    def generate_response(self, prompt: str, chat_history: list = None, memories: list = None) -> dict:
        pass

class GeminiProvider(AIProvider):
    def __init__(self, api_key: str, model_name: str = "gemini-2.0-flash"):
        self.api_key = api_key
        self.model_name = model_name or "gemini-2.0-flash"
        genai.configure(api_key=self.api_key)

    def generate_response(self, prompt: str, chat_history: list = None, memories: list = None) -> dict:
        if not self.api_key or not self.api_key.startswith("AIza"):
            logger.error("Gemini generation skipped: missing or invalid API key")
            return {
                "response": "I need a valid Google Gemini API key to think, Bala. Open Settings → Core Processor Brain Link and enter a key that starts with 'AIza', then sync.",
                "intent": "chat",
                "params": {}
            }

        try:
            # Build memory context
            memory_ctx = ""
            if memories:
                memory_ctx = "\nFacts you have learned about Bala/preferences:\n" + \
                             "\n".join([f"- {m['key']}: {m['value']}" for m in memories])

            full_system = SYSTEM_PROMPT + memory_ctx
            
            # Format history for Gemini
            model = genai.GenerativeModel(
                model_name=self.model_name,
                system_instruction=full_system,
                generation_config={"response_mime_type": "application/json"}
            )
            
            # Build content list
            contents = []
            if chat_history:
                for msg in chat_history[-10:]: # Keep last 10 messages for context
                    role = "user" if msg["role"] == "user" else "model"
                    contents.append({"role": role, "parts": [msg["content"]]})
            
            contents.append({"role": "user", "parts": [prompt]})
            
            try:
                response = model.generate_content(contents)
                text_resp = response.text.strip()
                return json.loads(text_resp)
            except Exception as e:
                err_str = str(e)
                fallback_model_name = "gemini-2.0-flash-lite"
                if ("429" in err_str or "quota" in err_str.lower() or "limit" in err_str.lower()) and fallback_model_name not in self.model_name:
                    logger.warning(f"Gemini rate limit/quota hit for {self.model_name}. Attempting fallback to {fallback_model_name}...")
                    try:
                        fallback_model = genai.GenerativeModel(
                            model_name=fallback_model_name,
                            system_instruction=full_system,
                            generation_config={"response_mime_type": "application/json"}
                        )
                        response = fallback_model.generate_content(contents)
                        text_resp = response.text.strip()
                        return json.loads(text_resp)
                    except Exception as fallback_err:
                        logger.error(f"Gemini fallback to {fallback_model_name} failed: {fallback_err}")
                raise e
        except Exception as e:
            logger.error(f"Gemini generation error: {e}")
            err_msg = str(e)
            if "429" in err_msg or "quota" in err_msg.lower() or "limit" in err_msg.lower():
                user_friendly_err = "I'm sorry Bala, but my Gemini API quota has been exceeded. Please check your billing details or generate a new API key in Google AI Studio."
            else:
                user_friendly_err = f"I encountered an error communicating with Gemini, Bala. Details: {err_msg[:60]}..."
            return {
                "response": user_friendly_err,
                "intent": "chat",
                "params": {}
            }

class OpenAIProvider(AIProvider):
    def __init__(self, api_key: str, model_name: str = "gpt-4o-mini", base_url: str = None):
        self.api_key = api_key
        self.model_name = model_name or "gpt-4o-mini"
        self.base_url = base_url
        self.client = OpenAI(api_key=self.api_key, base_url=self.base_url)

    def generate_response(self, prompt: str, chat_history: list = None, memories: list = None) -> dict:
        if not self.api_key:
            logger.error("OpenAI generation skipped: missing API key")
            return {
                "response": "I need a valid OpenAI API key to think, Bala. Open Settings → Core Processor Brain Link and enter your OpenAI key, then sync.",
                "intent": "chat",
                "params": {}
            }

        try:
            memory_ctx = ""
            if memories:
                memory_ctx = "\nFacts you have learned about Bala/preferences:\n" + \
                             "\n".join([f"- {m['key']}: {m['value']}" for m in memories])

            messages = [{"role": "system", "content": SYSTEM_PROMPT + memory_ctx}]
            
            if chat_history:
                for msg in chat_history[-10:]:
                    role = "user" if msg["role"] == "user" else "assistant"
                    messages.append({"role": role, "content": msg["content"]})
            
            messages.append({"role": "user", "content": prompt})
            
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=messages,
                response_format={"type": "json_object"}
            )
            
            text_resp = response.choices[0].message.content.strip()
            return json.loads(text_resp)
        except Exception as e:
            logger.error(f"OpenAI generation error: {e}")
            err_msg = str(e)
            if "429" in err_msg or "quota" in err_msg.lower() or "limit" in err_msg.lower():
                user_friendly_err = "I'm sorry Bala, but my OpenAI API quota has been exceeded. Please check your billing details or try again later."
            else:
                user_friendly_err = f"I encountered an error communicating with OpenAI, Bala. Details: {err_msg[:60]}..."
            return {
                "response": user_friendly_err,
                "intent": "chat",
                "params": {}
            }

class OllamaProvider(AIProvider):
    def __init__(self, base_url: str = "http://localhost:11434/v1", model_name: str = "llama3"):
        url = base_url or "http://localhost:11434/v1"
        url = url.rstrip('/')
        if url.endswith('/api'):
            url = url[:-4] + '/v1'
        elif not url.endswith('/v1'):
            url = url + '/v1'
        self.base_url = url
        self.model_name = model_name or "llama3"
        # Ollama exposes an OpenAI compatible API on /v1
        self.client = OpenAI(api_key="ollama", base_url=self.base_url)

    def generate_response(self, prompt: str, chat_history: list = None, memories: list = None) -> dict:
        try:
            memory_ctx = ""
            if memories:
                memory_ctx = "\nFacts you have learned about Bala/preferences:\n" + \
                             "\n".join([f"- {m['key']}: {m['value']}" for m in memories])
            
            messages = [{"role": "system", "content": SYSTEM_PROMPT + memory_ctx}]
            
            if chat_history:
                for msg in chat_history[-10:]:
                    role = "user" if msg["role"] == "user" else "assistant"
                    messages.append({"role": role, "content": msg["content"]})
            
            messages.append({"role": "user", "content": prompt})
            
            # Ollama response
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=messages,
                response_format={"type": "json_object"} # Some Ollama models support JSON mode
            )
            
            text_resp = response.choices[0].message.content.strip()
            return json.loads(text_resp)
        except Exception as e:
            logger.error(f"Ollama generation error: {e}")
            # Try a fallback request without json mode if it failed due to formatting issues
            try:
                response = self.client.chat.completions.create(
                    model=self.model_name,
                    messages=messages
                )
                text_resp = response.choices[0].message.content.strip()
                # Parse the JSON from the text response
                start = text_resp.find('{')
                end = text_resp.rfind('}') + 1
                if start != -1 and end != -1:
                    return json.loads(text_resp[start:end])
                raise ValueError("No JSON block found in response")
            except Exception as inner_e:
                logger.error(f"Ollama fallback error: {inner_e}")
                
                # Local rule-based fallback parser
                q = prompt.lower().strip()
                
                # Intent: browser_open / open_app
                if "open" in q:
                    if "youtube" in q:
                        return {
                            "response": "Opening YouTube right away, Bala.",
                            "intent": "browser_open",
                            "params": {"url": "https://youtube.com"}
                        }
                    elif "gmail" in q:
                        return {
                            "response": "Opening Gmail now, Bala.",
                            "intent": "browser_open",
                            "params": {"url": "https://gmail.com"}
                        }
                    for app in ["chrome", "vscode", "notepad", "calculator", "spotify", "explorer"]:
                        if app in q:
                            return {
                                "response": f"Launching {app.upper()} now, Bala.",
                                "intent": "open_app",
                                "params": {"app_name": app}
                            }
                            
                # Intent: browser_search
                if "search" in q or "google" in q:
                    search_query = q.replace("search", "").replace("google", "").replace("for", "").strip()
                    if search_query:
                        return {
                            "response": f"Searching the web for '{search_query}', Bala.",
                            "intent": "browser_search",
                            "params": {"query": search_query}
                        }
                        
                # Intent: system_control
                if "volume up" in q or "louder" in q:
                    return {
                        "response": "Increasing system volume, Bala.",
                        "intent": "system_control",
                        "params": {"action": "volume_up"}
                    }
                elif "volume down" in q or "quieter" in q:
                    return {
                        "response": "Lowering system volume, Bala.",
                        "intent": "system_control",
                        "params": {"action": "volume_down"}
                    }
                elif "screenshot" in q or "capture screen" in q:
                    return {
                        "response": "Capturing screen display, Bala.",
                        "intent": "system_control",
                        "params": {"action": "screenshot"}
                    }
                elif "lock" in q and ("pc" in q or "computer" in q or "workstation" in q):
                    return {
                        "response": "Locking the workstation, Bala.",
                        "intent": "system_control",
                        "params": {"action": "lock"}
                    }
                elif "time" in q:
                    import datetime
                    now_str = datetime.datetime.now().strftime("%I:%M %p")
                    return {
                        "response": f"The current system time is {now_str}, Bala.",
                        "intent": "chat",
                        "params": {}
                    }
                
                return {
                    "response": f"I couldn't get a structured response from the local Ollama model, Bala. Make sure Ollama is running and '{self.model_name}' is installed.",
                    "intent": "chat",
                    "params": {}
                }

class KimiProvider(AIProvider):
    def __init__(self, api_key: str = None, model_name: str = "moonshotai/kimi-k3-free", base_url: str = "https://api.tokenrouter.com/v1"):
        self.api_key = api_key or ""
        self.model_name = model_name or "moonshotai/kimi-k3-free"
        self.base_url = base_url
        self.client = OpenAI(api_key=self.api_key, base_url=self.base_url)

    def generate_response(self, prompt: str, chat_history: list = None, memories: list = None) -> dict:
        if not self.api_key:
            logger.error("Kimi generation skipped: missing API key")
            return {
                "response": "I need a valid Kimi API key to think, Bala. Configure it via the KIMI_API_KEY environment variable or your settings.",
                "intent": "chat",
                "params": {}
            }

        try:
            memory_ctx = ""
            if memories:
                memory_ctx = "\nFacts you have learned about Bala/preferences:\n" + \
                             "\n".join([f"- {m['key']}: {m['value']}" for m in memories])
            
            messages = [{"role": "system", "content": SYSTEM_PROMPT + memory_ctx}]
            
            if chat_history:
                for msg in chat_history[-10:]:
                    role = "user" if msg["role"] == "user" else "assistant"
                    messages.append({"role": role, "content": msg["content"]})
            
            messages.append({"role": "user", "content": prompt})
            
            stream = self.client.chat.completions.create(
                model=self.model_name,
                messages=messages,
                stream=True,
                stream_options={"include_usage": True},
                extra_body={}
            )
            
            content_parts = []
            for chunk in stream:
                if chunk.choices:
                    delta = chunk.choices[0].delta
                    if delta and delta.content:
                        content_parts.append(delta.content)
            
            text_resp = "".join(content_parts).strip()
            
            # Remove potential markdown JSON block formatting
            if text_resp.startswith("```json"):
                text_resp = text_resp[7:]
            elif text_resp.startswith("```"):
                text_resp = text_resp[3:]
            if text_resp.endswith("```"):
                text_resp = text_resp[:-3]
            text_resp = text_resp.strip()
            
            return json.loads(text_resp)
        except Exception as e:
            logger.error(f"Kimi generation error: {e}")
            err_msg = str(e)
            if "429" in err_msg or "quota" in err_msg.lower() or "limit" in err_msg.lower():
                user_friendly_err = "I'm sorry Bala, but my Kimi API quota has been exceeded. Please check your billing details or try again later."
            else:
                user_friendly_err = f"I encountered an error communicating with Kimi, Bala. Details: {err_msg[:60]}..."
            return {
                "response": user_friendly_err,
                "intent": "chat",
                "params": {}
            }

def get_provider(settings: dict) -> AIProvider:
    provider = settings.get("aiProvider", "gemini").lower()
    api_key = settings.get("apiKey", "")
    api_base = settings.get("apiBase", "")
    model_name = settings.get("selectedModel", "")
    
    if provider == "gemini":
        # Fallback to env variable if key not set in DB settings
        key = api_key or os.getenv("GEMINI_API_KEY", "")
        # Gemini API keys always begin with "AIza". A stored key with any other
        # format (e.g. pasted from another provider) is invalid, so prefer a
        # valid key from the environment instead.
        if not key.startswith("AIza"):
            env_key = os.getenv("GEMINI_API_KEY", "")
            if env_key.startswith("AIza"):
                key = env_key
        # Ensure we use a Gemini model if the provider is Gemini
        is_gemini_model = model_name and (model_name.lower().startswith("gemini") or "gemini" in model_name.lower())
        if not is_gemini_model:
            model_name = "gemini-2.0-flash"
        return GeminiProvider(api_key=key, model_name=model_name)
    elif provider == "openai":
        key = api_key or os.getenv("OPENAI_API_KEY", "")
        return OpenAIProvider(api_key=key, model_name=model_name or "gpt-4o-mini", base_url=api_base or None)
    elif provider == "kimi":
        key = api_key or os.getenv("KIMI_API_KEY", "")
        return KimiProvider(api_key=key, model_name=model_name or "moonshotai/kimi-k3-free", base_url=api_base or "https://api.tokenrouter.com/v1")
    elif provider == "ollama":
        base_url = api_base or "http://localhost:11434/v1"
        return OllamaProvider(base_url=base_url, model_name=model_name or "llama3")
    else:
        # Default fallback
        key = os.getenv("GEMINI_API_KEY", "")
        return GeminiProvider(api_key=key)
