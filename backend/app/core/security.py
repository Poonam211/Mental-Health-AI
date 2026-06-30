import hashlib
import os
import base64
import json
import hmac
import time
from datetime import timedelta
from typing import Dict, Any, Optional

SECRET_KEY = os.getenv("JWT_SECRET")
IS_PROD = os.getenv("ENV") == "production" or os.getenv("NODE_ENV") == "production"

if not SECRET_KEY:
    if IS_PROD:
        raise RuntimeError("JWT_SECRET environment variable is REQUIRED in production!")
    SECRET_KEY = "super-secure-mental-health-ai-clinical-secret-key-2026"

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours (1 day)


def hash_password(password: str) -> str:
    """
    Hashes a password using PBKDF2-HMAC-SHA256 with a unique random salt.
    Returns a base64-encoded string containing both salt and key.
    """
    salt = os.urandom(16)
    # Perform 100,000 iterations of PBKDF2 with SHA-256
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    combined = salt + key
    return base64.b64encode(combined).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a password by extracting the salt and re-hashing the input,
    comparing it against the stored key in constant time to prevent timing attacks.
    """
    try:
        combined = base64.b64decode(hashed_password.encode('utf-8'))
        salt = combined[:16]
        stored_key = combined[16:]
        # Re-hash the plain password using the same salt
        key = hashlib.pbkdf2_hmac('sha256', plain_password.encode('utf-8'), salt, 100000)
        return hmac.compare_digest(stored_key, key)
    except Exception:
        return False

def base64url_encode(data: bytes) -> str:
    """
    Encodes bytes to base64url string without padding characters.
    """
    return base64.urlsafe_b64encode(data).decode('utf-8').rstrip('=')

def base64url_decode(data: str) -> bytes:
    """
    Decodes a base64url string, restoring any stripped padding.
    """
    padding = '=' * (4 - len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Creates an RFC 7519 compliant JWT access token signed with HMAC-SHA256.
    """
    to_encode = data.copy()
    if expires_delta:
        expire = time.time() + expires_delta.total_seconds()
    else:
        expire = time.time() + (ACCESS_TOKEN_EXPIRE_MINUTES * 60)
    to_encode.update({"exp": int(expire)})
    
    header = {"alg": "HS256", "typ": "JWT"}
    
    # Serialize JSON with compact representation (no spacing)
    header_json = json.dumps(header, separators=(',', ':')).encode('utf-8')
    payload_json = json.dumps(to_encode, separators=(',', ':')).encode('utf-8')
    
    header_b64 = base64url_encode(header_json)
    payload_b64 = base64url_encode(payload_json)
    
    signing_input = f"{header_b64}.{payload_b64}".encode('utf-8')
    
    # Generate signature using HMAC-SHA256
    signature = hmac.new(SECRET_KEY.encode('utf-8'), signing_input, hashlib.sha256).digest()
    signature_b64 = base64url_encode(signature)
    
    return f"{header_b64}.{payload_b64}.{signature_b64}"

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Verifies a JWT's signature and expiration, returning the payload if valid.
    """
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return None
            
        header_b64, payload_b64, signature_b64 = parts
        
        # Verify Signature
        signing_input = f"{header_b64}.{payload_b64}".encode('utf-8')
        expected_signature = hmac.new(SECRET_KEY.encode('utf-8'), signing_input, hashlib.sha256).digest()
        expected_signature_b64 = base64url_encode(expected_signature)
        
        if not hmac.compare_digest(signature_b64, expected_signature_b64):
            return None
            
        # Decode and Parse Payload
        payload_json = base64url_decode(payload_b64)
        payload = json.loads(payload_json.decode('utf-8'))
        
        # Check Expiration
        exp = payload.get("exp")
        if exp is None or time.time() > exp:
            return None
            
        return payload
    except Exception:
        return None
