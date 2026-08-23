import sqlite3
import os
import json
import uuid
import time

DB_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
DB_PATH = os.path.join(DB_DIR, 'jarvis.db')

def get_db_connection():
    os.makedirs(DB_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Settings table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT
        )
    ''')
    
    # Memories table (learned facts)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS memories (
            id TEXT PRIMARY KEY,
            key TEXT,
            value TEXT,
            category TEXT,
            timestamp INTEGER
        )
    ''')
    
    # Command History table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS history (
            id TEXT PRIMARY KEY,
            command TEXT,
            response TEXT,
            timestamp INTEGER,
            intent TEXT,
            success INTEGER
        )
    ''')
    
    # Reminders table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS reminders (
            id TEXT PRIMARY KEY,
            task TEXT,
            due_time TEXT,
            completed INTEGER,
            timestamp INTEGER
        )
    ''')
    
    # Conversations table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS conversations (
            id TEXT PRIMARY KEY,
            role TEXT,
            content TEXT,
            timestamp INTEGER,
            intent TEXT
        )
    ''')
    
    conn.commit()
    conn.close()

# ─── Settings CRUD ────────────────────────────────────────────────────────────

def get_settings():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT key, value FROM settings")
    rows = cursor.fetchall()
    conn.close()
    
    settings = {}
    for row in rows:
        try:
            settings[row['key']] = json.loads(row['value'])
        except json.JSONDecodeError:
            settings[row['key']] = row['value']
    return settings

def save_setting(key, value):
    conn = get_db_connection()
    cursor = conn.cursor()
    val_str = json.dumps(value)
    cursor.execute("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", (key, val_str))
    conn.commit()
    conn.close()

def save_all_settings(settings_dict):
    conn = get_db_connection()
    cursor = conn.cursor()
    for key, value in settings_dict.items():
        val_str = json.dumps(value)
        cursor.execute("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", (key, val_str))
    conn.commit()
    conn.close()

# ─── Memories CRUD ────────────────────────────────────────────────────────────

def add_memory(key, value, category='general'):
    conn = get_db_connection()
    cursor = conn.cursor()
    item_id = str(uuid.uuid4())
    timestamp = int(time.time() * 1000)
    cursor.execute(
        "INSERT INTO memories (id, key, value, category, timestamp) VALUES (?, ?, ?, ?, ?)",
        (item_id, key, value, category, timestamp)
    )
    conn.commit()
    conn.close()
    return {"id": item_id, "key": key, "value": value, "category": category, "timestamp": timestamp}

def get_memories():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, key, value, category, timestamp FROM memories ORDER BY timestamp DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def delete_memory(memory_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM memories WHERE id = ?", (memory_id,))
    conn.commit()
    conn.close()

def clear_memories():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM memories")
    conn.commit()
    conn.close()

# ─── History CRUD ─────────────────────────────────────────────────────────────

def add_history(command, response, intent='unknown', success=1):
    conn = get_db_connection()
    cursor = conn.cursor()
    item_id = str(uuid.uuid4())
    timestamp = int(time.time() * 1000)
    cursor.execute(
        "INSERT INTO history (id, command, response, timestamp, intent, success) VALUES (?, ?, ?, ?, ?, ?)",
        (item_id, command, response, timestamp, intent, int(success))
    )
    conn.commit()
    conn.close()
    return {"id": item_id, "command": command, "response": response, "timestamp": timestamp, "intent": intent, "success": bool(success)}

def get_history():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, command, response, timestamp, intent, success FROM history ORDER BY timestamp DESC LIMIT 100")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def clear_history():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM history")
    conn.commit()
    conn.close()

# ─── Reminders CRUD ───────────────────────────────────────────────────────────

def add_reminder(task, due_time):
    conn = get_db_connection()
    cursor = conn.cursor()
    item_id = str(uuid.uuid4())
    timestamp = int(time.time() * 1000)
    cursor.execute(
        "INSERT INTO reminders (id, task, due_time, completed, timestamp) VALUES (?, ?, ?, 0, ?)",
        (item_id, task, due_time, timestamp)
    )
    conn.commit()
    conn.close()
    return {"id": item_id, "task": task, "due_time": due_time, "completed": False, "timestamp": timestamp}

def get_reminders():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, task, due_time, completed, timestamp FROM reminders ORDER BY timestamp DESC")
    rows = cursor.fetchall()
    conn.close()
    return [{"id": r["id"], "task": r["task"], "due_time": r["due_time"], "completed": bool(r["completed"]), "timestamp": r["timestamp"]} for r in rows]

def toggle_reminder(reminder_id, completed=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    if completed is None:
        cursor.execute("UPDATE reminders SET completed = 1 - completed WHERE id = ?", (reminder_id,))
    else:
        cursor.execute("UPDATE reminders SET completed = ? WHERE id = ?", (int(completed), reminder_id))
    conn.commit()
    conn.close()

def delete_reminder(reminder_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM reminders WHERE id = ?", (reminder_id,))
    conn.commit()
    conn.close()

# ─── Conversations CRUD ───────────────────────────────────────────────────────

def add_chat_message(role, content, intent=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    item_id = str(uuid.uuid4())
    timestamp = int(time.time() * 1000)
    cursor.execute(
        "INSERT INTO conversations (id, role, content, timestamp, intent) VALUES (?, ?, ?, ?, ?)",
        (item_id, role, content, timestamp, intent)
    )
    conn.commit()
    conn.close()
    return {"id": item_id, "role": role, "content": content, "timestamp": timestamp, "intent": intent}

def get_chat_history(limit=50):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, role, content, timestamp, intent FROM conversations ORDER BY timestamp ASC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def clear_chat_history():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM conversations")
    conn.commit()
    conn.close()

# Initialize database on module load
init_db()
