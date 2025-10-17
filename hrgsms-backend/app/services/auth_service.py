from typing import Optional
from ..database.queries import call_proc
from ..utils.security import create_access_token

def authenticate(username: str, password: str) -> Optional[dict]:
    """Authenticate user using stored procedure."""
    try:
        # Try the simple login procedure first
        result = call_proc("sp_login_simple", (username, password))
        if result and len(result) > 0:
            row = result[0]
            if row.get("success") == 1:
                return {
                    "user_id": row["userID"], 
                    "username": row["username"], 
                    "role": row["userRole"]
                }
        return None
    except Exception as e:
        print(f"Authentication error: {e}")
        return None

def register(username: str, password: str, role: str) -> int:
    """Register new user using stored procedure."""
    result = call_proc("sp_create_user", (username, password, role))
    if result and len(result) > 0:
        return result[0]["userID"]
    raise Exception("Failed to create user")

def issue_token(user: dict) -> str:
    """Issue JWT token for authenticated user."""
    sub = {"user_id": user["user_id"], "username": user["username"], "role": user["role"]}
    return create_access_token(sub)
