import os
import subprocess
import psutil
import logging

logger = logging.getLogger(__name__)

# Common app paths or commands on Windows
WINDOWS_APPS = {
    "vscode": ["code", os.path.expandvars(r"%LOCALAPPDATA%\Programs\Microsoft VS Code\Code.exe")],
    "chrome": ["chrome", r"C:\Program Files\Google\Chrome\Application\chrome.exe", r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"],
    "explorer": ["explorer"],
    "notepad": ["notepad"],
    "calculator": ["calc"],
    "spotify": ["spotify", os.path.expandvars(r"%APPDATA%\Spotify\Spotify.exe"), os.path.expandvars(r"%LOCALAPPDATA%\Microsoft\WindowsApps\Spotify.exe")]
}

# Processes names to kill for each app
APP_PROCESSES = {
    "vscode": ["code.exe", "code"],
    "chrome": ["chrome.exe", "chrome"],
    "notepad": ["notepad.exe", "notepad"],
    "calculator": ["CalculatorApp.exe", "Calculator.exe", "calc.exe"],
    "spotify": ["spotify.exe", "spotify"]
}

def open_app(app_name: str) -> bool:
    app_key = app_name.lower().replace(" ", "").replace("_", "")
    
    # Try finding the app key in our database
    matched_key = None
    for key in WINDOWS_APPS:
        if key in app_key or app_key in key:
            matched_key = key
            break
            
    if not matched_key:
        # Fallback: try executing the raw app_name as a command
        try:
            subprocess.Popen(app_name, shell=True)
            return True
        except Exception as e:
            logger.error(f"Failed to open arbitrary app '{app_name}': {e}")
            return False
            
    # Try executing the commands/paths one by one
    commands = WINDOWS_APPS[matched_key]
    for cmd in commands:
        try:
            if os.path.exists(cmd) if os.path.isabs(str(cmd)) else True:
                subprocess.Popen(cmd, shell=True)
                logger.info(f"Successfully opened {matched_key} using command: {cmd}")
                return True
        except Exception as e:
            logger.warn(f"Failed to open {matched_key} with {cmd}: {e}")
            continue
            
    logger.error(f"All open attempts failed for app: {app_name}")
    return False

def close_app(app_name: str) -> bool:
    app_key = app_name.lower().replace(" ", "").replace("_", "")
    
    # Find matching process list
    matched_processes = None
    for key, p_names in APP_PROCESSES.items():
        if key in app_key or app_key in key:
            matched_processes = p_names
            break
            
    if not matched_processes:
        # Fallback to checking process names directly containing the input
        matched_processes = [app_name.lower(), f"{app_name.lower()}.exe"]
        
    closed_any = False
    for proc in psutil.process_iter(['pid', 'name']):
        try:
            name_lower = proc.info['name'].lower()
            if any(p.lower() == name_lower or p.lower() in name_lower for p in matched_processes):
                proc.terminate()
                logger.info(f"Terminated process: {proc.info['name']} (PID: {proc.info['pid']})")
                closed_any = True
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess) as e:
            logger.warn(f"Error terminating process {proc.info.get('name')}: {e}")
            continue
            
    return closed_any
