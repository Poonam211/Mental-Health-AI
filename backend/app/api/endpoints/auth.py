from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from backend.app.core import database, security
from backend.app.core.database import User, get_db

router = APIRouter()

# The tokenUrl points to the login route. FastAPI docs will use this URL to authenticate.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

class UserRegisterSchema(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, pattern="^[a-zA-Z0-9_-]+$")
    password: str = Field(..., min_length=6)

class UserLoginSchema(BaseModel):
    username: str = Field(...)
    password: str = Field(...)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    username: str

class UserProfileResponse(BaseModel):
    username: str
    created_at: str

def get_current_user(token: str = Depends(oauth2_scheme)) -> str:
    """
    Dependency to extract and validate the JWT token, returning the username of the current user.
    """
    payload = security.decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    username = payload.get("sub")
    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return username

@router.post("/register", response_model=UserProfileResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserRegisterSchema, db: Session = Depends(get_db)):
    """
    Registers a new clinical administrator, hashing their password and persisting them to the database.
    """
    try:
        # Check if the username is already registered
        existing_user = db.query(User).filter(User.username == user_data.username).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username is already registered"
            )
        
        # Hash password using PBKDF2-HMAC-SHA256
        hashed = security.hash_password(user_data.password)
        
        # Insert user into the database
        new_user = User(username=user_data.username, hashed_password=hashed)
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        return UserProfileResponse(
            username=new_user.username,
            created_at=new_user.created_at.strftime("%Y-%m-%d %H:%M:%S")
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error during registration: {str(e)}"
        )

@router.post("/login", response_model=TokenResponse)
def login(user_data: UserLoginSchema, db: Session = Depends(get_db)):
    """
    Authenticates username and password, returning a secure JWT token on success.
    """
    user = db.query(User).filter(User.username == user_data.username).first()
    
    if not user or not security.verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Generate JWT access token
    access_token = security.create_access_token(data={"sub": user.username})
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        username=user.username
    )

@router.get("/me", response_model=UserProfileResponse)
def get_me(current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Returns the authenticated user's profile.
    """
    user = db.query(User).filter(User.username == current_user).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found"
        )
        
    return UserProfileResponse(
        username=user.username,
        created_at=user.created_at.strftime("%Y-%m-%d %H:%M:%S")
    )
