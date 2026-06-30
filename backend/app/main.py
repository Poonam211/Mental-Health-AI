import sys
import os
import logging
from pathlib import Path
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from contextlib import asynccontextmanager

# Configure project logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("mental_health_api")

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
        logger.error(f"Error initializing user database: {e}", exc_info=True)

    # Seed assessment database if empty
    try:
        from backend.app.services.report_service import seed_reports_if_empty
        from backend.app.core.database import SessionLocal
        db = SessionLocal()
        try:
            seed_reports_if_empty(db)
        finally:
            db.close()
    except Exception as e:
        logger.error(f"Error seeding database: {e}", exc_info=True)

    # Pre-load ML models and encoders into memory on startup
    try:
        load_models_and_encoders()
    except Exception as e:
        logger.error(f"Error pre-loading models: {e}", exc_info=True)
    yield

app = FastAPI(
    title="Mental Health Risk Assessment API",
    description="Production-ready FastAPI backend for AI-powered mental health risk prediction and analytics",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS dynamically from environment variables
allowed_origins_raw = os.getenv("ALLOWED_ORIGINS")
if allowed_origins_raw:
    allowed_origins = [origin.strip() for origin in allowed_origins_raw.split(",")]
else:
    # Default local development origins
    allowed_origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]

if os.getenv("ENV") == "production" and not allowed_origins_raw:
    logger.warning("No ALLOWED_ORIGINS environment variable set. Defaulting to localhost origins in production.")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handlers for Production Security & Logging
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    logger.error(f"HTTP Exception on {request.url.path}: {exc.detail} (status_code={exc.status_code})")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.error(f"Validation Error on {request.url.path}: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": "Input validation failed", "errors": exc.errors()}
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Exception on {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected error occurred. Please try again later."}
    )

# Include main router
app.include_router(api_router, prefix="/api")

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Mental Health Assessment Backend"
    }

# Serve frontend static files if they exist
frontend_path = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if frontend_path.exists():
    from fastapi.staticfiles import StaticFiles
    from fastapi.responses import FileResponse
    from fastapi import HTTPException

    # Mount assets folder
    assets_path = frontend_path / "assets"
    if assets_path.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_path)), name="assets")

    # Catch-all route to serve index.html for client-side routing
    @app.get("/{catchall:path}")
    async def serve_frontend(catchall: str):
        # Safeguard: Do not intercept API or docs routes
        if catchall.startswith("api") or catchall.startswith("docs") or catchall.startswith("openapi.json"):
            raise HTTPException(status_code=404, detail="Not Found")
            
        file_path = frontend_path / catchall
        if file_path.exists() and file_path.is_file():
            return FileResponse(str(file_path))
        return FileResponse(str(frontend_path / "index.html"))
else:
    @app.get("/")
    def read_root():
        return {
            "status": "healthy",
            "service": "Mental Health Assessment Backend",
            "docs_url": "/docs"
        }

