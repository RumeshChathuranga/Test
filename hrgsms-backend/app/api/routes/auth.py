from fastapi import APIRouter, HTTPException, status
from ...models.schemas import LoginRequest, LoginResponse, RegisterRequest
from ...services.auth_service import authenticate, register, issue_token

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest):
    user = authenticate(payload.username, payload.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = issue_token(user)
    return {"access_token": token, "role": user["role"]}

@router.post("/register", status_code=201)
def register_user(payload: RegisterRequest):
    try:
        user_id = register(payload.username, payload.password, payload.role)
        return {"user_id": user_id, "message": "Registered"}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
