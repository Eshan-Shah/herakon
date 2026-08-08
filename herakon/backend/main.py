from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import secrets

from auth import (
    create_user,
    find_user_by_email,
    verify_password
)

app = FastAPI(title="Herakon API")


# --------------------------------------------------
# CORS
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5500",
    "http://localhost:5173"
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# Temporary in-memory sessions
# --------------------------------------------------

sessions = {}


# --------------------------------------------------
# Models
# --------------------------------------------------

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


# --------------------------------------------------
# Basic route
# --------------------------------------------------

@app.get("/")
def root():
    return {
        "message": "Welcome to Herakon API"
    }


# --------------------------------------------------
# Register
# --------------------------------------------------

@app.post("/auth/register")
def register(request: RegisterRequest):

    if len(request.password) < 6:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 6 characters."
        )

    try:
        user = create_user(
            request.email,
            request.password,
            request.name
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    return {
        "message": "Account created successfully",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"]
        }
    }


# --------------------------------------------------
# Login
# --------------------------------------------------

@app.post("/auth/login")
def login(request: LoginRequest):

    user = find_user_by_email(request.email)

    if not user or not verify_password(
        request.password,
        user["password"]
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    token = secrets.token_urlsafe(32)

    sessions[token] = user["id"]

    return {
        "token": token,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"]
        }
    }


# --------------------------------------------------
# Logout
# --------------------------------------------------

@app.post("/auth/logout")
def logout(authorization: str | None = Header(default=None)):

    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "")
        sessions.pop(token, None)

    return {
        "message": "Logged out"
    }


# --------------------------------------------------
# Current user
# --------------------------------------------------

@app.get("/auth/me")
def get_current_user(
    authorization: str | None = Header(default=None)
):

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Not authenticated."
        )

    token = authorization.replace("Bearer ", "")

    user_id = sessions.get(token)

    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired session."
        )

    from auth import load_users

    users = load_users()

    user = next(
        (u for u in users if u["id"] == user_id),
        None
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found."
        )

    return {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"]
    }