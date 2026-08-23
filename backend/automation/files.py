import os
import shutil
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

def create_folder(base_path: str, name: str) -> bool:
    try:
        # Standardize home directory path if query says "downloads", "documents", "desktop"
        target_dir = resolve_path(base_path)
        new_folder_path = os.path.join(target_dir, name)
        os.makedirs(new_folder_path, exist_ok=True)
        logger.info(f"Created directory at: {new_folder_path}")
        return True
    except Exception as e:
        logger.error(f"Failed to create folder {name} at {base_path}: {e}")
        return False

def delete_file(target_path: str) -> bool:
    try:
        resolved = resolve_path(target_path)
        if not os.path.exists(resolved):
            logger.warn(f"Path does not exist: {resolved}")
            return False
            
        if os.path.isdir(resolved):
            shutil.rmtree(resolved)
            logger.info(f"Deleted directory: {resolved}")
        else:
            os.remove(resolved)
            logger.info(f"Deleted file: {resolved}")
        return True
    except Exception as e:
        logger.error(f"Failed to delete {target_path}: {e}")
        return False

def list_files(target_path: str) -> List[Dict[str, Any]]:
    try:
        resolved = resolve_path(target_path)
        if not os.path.exists(resolved) or not os.path.isdir(resolved):
            return []
            
        items = []
        for name in os.listdir(resolved):
            full_path = os.path.join(resolved, name)
            is_dir = os.path.isdir(full_path)
            items.append({
                "name": name,
                "path": full_path,
                "is_dir": is_dir,
                "size": os.path.getsize(full_path) if not is_dir else 0
            })
        return items
    except Exception as e:
        logger.error(f"Error listing files in {target_path}: {e}")
        return []

def resolve_path(path: str) -> str:
    """Helper to convert short-hand folder names into absolute paths."""
    lower_path = path.lower().strip()
    
    # Check for shortcut folders
    user_home = os.path.expanduser("~")
    if lower_path in ["desktop", "the desktop"]:
        return os.path.join(user_home, "Desktop")
    elif lower_path in ["documents", "my documents"]:
        return os.path.join(user_home, "Documents")
    elif lower_path in ["downloads", "my downloads"]:
        return os.path.join(user_home, "Downloads")
    elif lower_path in ["pictures", "my pictures"]:
        return os.path.join(user_home, "Pictures")
    elif lower_path in ["videos", "my videos"]:
        return os.path.join(user_home, "Videos")
    elif lower_path in ["workspace", "jarvis workspace"]:
        return os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        
    # Relative or absolute
    if os.path.isabs(path):
        return path
    
    # Fallback: relative to workspace root
    root_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    return os.path.abspath(os.path.join(root_dir, path))
