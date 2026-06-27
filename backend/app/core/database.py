import sqlite3
import os
from backend.app.core import config

DB_PATH = config.DATA_DIR / "users.db"

def init_db():
    """
    Initializes the SQLite database and creates the users table if it does not exist.
    """
    os.makedirs(config.DATA_DIR, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH))
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            hashed_password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

def get_db_connection():
    """
    Creates and returns a new sqlite3.Connection object with Row factory enabled.
    """
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn
