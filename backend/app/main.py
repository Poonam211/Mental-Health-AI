import sys
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

# Add project root to python path to ensure src modules can be imported properly
project_root = str(Path(__file__).resolve().parent.parent.parent)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from backend.app.api.api import api_router
from backend.app.services.ml_service import load_models_and_encoders

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize Relational Database
    try:
        from backend.app.core import database
        database.init_db()
    except Exception as e:
        print(f"Error initializing user database: {e}")

    # Pre-load ML models and encoders into memory on startup
    try:
        load_models_and_encoders()
    except Exception as e:
        print(f"Error pre-loading models: {e}")
    yield

app = FastAPI(
    title="Mental Health Risk Assessment API",
    description="Production-ready FastAPI backend for AI-powered mental health risk prediction and analytics",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include main router
app.include_router(api_router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "status": "healthy",
        "service": "Mental Health Assessment Backend",
        "docs_url": "/docs"
    }
