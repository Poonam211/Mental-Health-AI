import os
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from backend.app.core import config

# Fetch DATABASE_URL from environment, default to SQLite
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    os.makedirs(config.DATA_DIR, exist_ok=True)
    db_file_path = os.path.abspath(config.DATA_DIR / "users.db")
    DATABASE_URL = f"sqlite:///{db_file_path}"

# Configure engine
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    # Use connection pooling parameters for production databases like PostgreSQL
    engine = create_engine(DATABASE_URL, pool_pre_ping=True, pool_size=10, max_overflow=20)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class AssessmentReport(Base):
    __tablename__ = "assessment_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    city = Column(String, index=True, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    occupation = Column(String, index=True, nullable=False)
    age = Column(Integer, nullable=False)
    risk_score = Column(Float, index=True, nullable=False)
    risk_level = Column(String, index=True, nullable=False)
    mental_state = Column(String, nullable=False)
    depression_score = Column(Integer, nullable=False)
    anxiety_score = Column(Integer, nullable=False)
    depression_percent = Column(Float, nullable=False)
    anxiety_percent = Column(Float, nullable=False)
    stress_percent = Column(Float, nullable=False)
    wellness_score = Column(Float, index=True, nullable=False)
    sleep_hours = Column(Float, default=7.0)
    eating_habits = Column(String, default="Balanced")
    physical_activity = Column(String, default="Moderate")
    symptoms = Column(Text, nullable=True)
    symptom_analysis = Column(Text, nullable=True)  # JSON-serialized string

    # Composite index for optimized time-series city filtering
    __table_args__ = (
        Index('idx_city_timestamp', 'city', 'timestamp'),
    )

def init_db():
    """
    Initializes the database by creating all tables.
    """
    Base.metadata.create_all(bind=engine)

def get_db():
    """
    FastAPI dependency that provides a transactional database session.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

