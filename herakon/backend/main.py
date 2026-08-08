from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import secrets
import json
import os

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

# ==================================================
# WORKOUTS
# ==================================================

class WorkoutRequest(BaseModel):
    sport: str
    workout_type: str
    date: str
    distance: float | None = None
    duration: int | None = None
    notes: str = ""


WORKOUTS_FILE = os.path.join(
    os.path.dirname(__file__),
    "data",
    "workouts.json"
)


def load_workouts():
    os.makedirs(
        os.path.dirname(WORKOUTS_FILE),
        exist_ok=True
    )

    if not os.path.exists(WORKOUTS_FILE):
        with open(WORKOUTS_FILE, "w") as f:
            json.dump([], f)

    with open(WORKOUTS_FILE, "r") as f:
        return json.load(f)


def save_workouts(workouts):
    os.makedirs(
        os.path.dirname(WORKOUTS_FILE),
        exist_ok=True
    )

    with open(WORKOUTS_FILE, "w") as f:
        json.dump(workouts, f, indent=2)


def get_authenticated_user(
    authorization: str | None
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

    return user_id


@app.post("/workouts")
def add_workout(
    workout: WorkoutRequest,
    authorization: str | None = Header(default=None)
):

    user_id = get_authenticated_user(
        authorization
    )

    workouts = load_workouts()

    new_workout = {
        "id": secrets.token_hex(8),
        "user_id": user_id,
        "sport": workout.sport,
        "workout_type": workout.workout_type,
        "date": workout.date,
        "distance": workout.distance,
        "duration": workout.duration,
        "notes": workout.notes
    }

    workouts.append(new_workout)

    save_workouts(workouts)

    return new_workout


@app.get("/workouts")
def get_workouts(
    authorization: str | None = Header(default=None)
):

    user_id = get_authenticated_user(
        authorization
    )

    workouts = load_workouts()

    user_workouts = [
        workout
        for workout in workouts
        if workout["user_id"] == user_id
    ]

    user_workouts.sort(
        key=lambda workout: workout["date"],
        reverse=True
    )

    return user_workouts


@app.delete("/workouts/{workout_id}")
def delete_workout(
    workout_id: str,
    authorization: str | None = Header(default=None)
):

    user_id = get_authenticated_user(
        authorization
    )

    workouts = load_workouts()

    workout = next(
        (
            workout
            for workout in workouts
            if workout["id"] == workout_id
            and workout["user_id"] == user_id
        ),
        None
    )

    if not workout:
        raise HTTPException(
            status_code=404,
            detail="Workout not found."
        )

    workouts.remove(workout)

    save_workouts(workouts)

    return {
        "message": "Workout deleted successfully."
    }