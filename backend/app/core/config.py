from pathlib import Path

# Base directory: the workspace root
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent

# Directories for models and data
MODEL_DIR = BASE_DIR / "models"
DATA_DIR = BASE_DIR / "data"

# File paths
REPORTS_CSV = DATA_DIR / "city_reports.csv"

# Model and Encoder paths
RISK_LEVEL_MODEL_PATH = MODEL_DIR / "risk_level_model.pkl"
RISK_SCORE_MODEL_PATH = MODEL_DIR / "risk_score_model.pkl"
RISK_LEVEL_ENCODER_PATH = MODEL_DIR / "risk_level_encoder.pkl"

GENDER_ENCODER_PATH = MODEL_DIR / "gender_encoder.pkl"
WORK_ENCODER_PATH = MODEL_DIR / "work_encoder.pkl"
ACTIVITY_ENCODER_PATH = MODEL_DIR / "activity_encoder.pkl"
HISTORY_ENCODER_PATH = MODEL_DIR / "history_encoder.pkl"
ILLNESS_ENCODER_PATH = MODEL_DIR / "illness_encoder.pkl"

# API Settings
PORT = 8000
HOST = "127.0.0.1"
