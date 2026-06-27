from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, Field
from backend.app.core import database, security

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
def register(user_data: UserRegisterSchema):
    """
    Registers a new clinical administrator, hashing their password and persisting them to SQLite.
    """
    conn = database.get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Check if the username is already registered
        cursor.execute("SELECT id FROM users WHERE username = ?", (user_data.username,))
        if cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username is already registered"
            )
        
        # Hash password using PBKDF2-HMAC-SHA256
        hashed = security.hash_password(user_data.password)
        
        # Insert user into the database
        cursor.execute(
            "INSERT INTO users (username, hashed_password) VALUES (?, ?)",
            (user_data.username, hashed)
        )
        conn.commit()
        
        # Fetch the created user
        cursor.execute("SELECT username, created_at FROM users WHERE username = ?", (user_data.username,))
        row = cursor.fetchone()
        
        return UserProfileResponse(
            username=row["username"],
            created_at=row["created_at"]
        )
    except HTTPException:
        # Re-raise HTTP exceptions to be handled by FastAPI
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error during registration: {str(e)}"
        )
    finally:
        conn.close()

@router.post("/login", response_model=TokenResponse)
def login(user_data: UserLoginSchema):
    """
    Authenticates username and password, returning a secure JWT token on success.
    """
    conn = database.get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT hashed_password FROM users WHERE username = ?", (user_data.username,))
        row = cursor.fetchone()
        
        if not row or not security.verify_password(user_data.password, row["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Generate JWT access token
        access_token = security.create_access_token(data={"sub": user_data.username})
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            username=user_data.username
        )
    finally:
        conn.close()

@router.get("/me", response_model=UserProfileResponse)
def get_me(current_user: str = Depends(get_current_user)):
    """
    Returns the authenticated user's profile.
    """
    conn = database.get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT username, created_at FROM users WHERE username = ?", (current_user,))
        row = cursor.fetchone()
        
        if not row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )
            
        return UserProfileResponse(
            username=row["username"],
            created_at=row["created_at"]
        )
    finally:
        conn.close()
