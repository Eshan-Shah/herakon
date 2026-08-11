from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import date
import secrets
import json
import os

from auth import (
    create_user,
    find_user_by_email,
    verify_password
)

import planner

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
    status: str = "completed"          # "completed" | "planned"
    distance: float | None = None      # km — continuous sessions, or auto-total for structured ones
    duration: int | None = None        # seconds — continuous/gym sessions, or auto-total
    sets: int | None = None            # gym only: number of sets
    reps: int | None = None            # gym only: reps per set
    structured_sets: list[dict] | None = None   # swim/bike/run interval builder rows
    plan_week_start: str | None = None  # Monday date string — tags which planned week this belongs to
    linked_id: str | None = None        # pairs a brick bike+run session together
    notes: str = ""


class WorkoutUpdateRequest(BaseModel):
    sport: str | None = None
    workout_type: str | None = None
    date: str | None = None
    status: str | None = None
    distance: float | None = None
    duration: int | None = None
    sets: int | None = None
    reps: int | None = None
    structured_sets: list[dict] | None = None
    plan_week_start: str | None = None
    linked_id: str | None = None
    notes: str | None = None


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
        "status": workout.status,
        "distance": workout.distance,
        "duration": workout.duration,
        "sets": workout.sets,
        "reps": workout.reps,
        "structured_sets": workout.structured_sets,
        "plan_week_start": workout.plan_week_start,
        "linked_id": workout.linked_id,
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


@app.patch("/workouts/{workout_id}")
def update_workout(
    workout_id: str,
    updates: WorkoutUpdateRequest,
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

    update_data = updates.dict(exclude_unset=True)

    for key, value in update_data.items():
        workout[key] = value

    save_workouts(workouts)

    return workout


# ==================================================
# TRAINING PLANNER
# ==================================================
#
# All of the actual planning logic lives in planner.py, kept
# separate from the API layer on purpose so it stays easy to
# read, test, and rewrite independently of the routes below.

class PlanRequest(BaseModel):
    phase_override: str | None = None


@app.get("/planner/status")
def planner_status(
    authorization: str | None = Header(default=None)
):

    user_id = get_authenticated_user(
        authorization
    )

    workouts = load_workouts()

    user_workouts = [
        w for w in workouts if w["user_id"] == user_id
    ]

    return planner.get_status(
        user_workouts,
        date.today()
    )


@app.post("/planner/generate-next-week")
def planner_generate_next_week(
    request: PlanRequest = PlanRequest(),
    authorization: str | None = Header(default=None)
):

    user_id = get_authenticated_user(
        authorization
    )

    workouts = load_workouts()

    user_workouts = [
        w for w in workouts if w["user_id"] == user_id
    ]

    result = planner.plan_next_week(
        user_id,
        user_workouts,
        date.today(),
        phase_override=request.phase_override
    )

    # Replace any previously generated planned workouts for this
    # exact week, then save the fresh plan.
    workouts = [
        w for w in workouts
        if not (
            w["user_id"] == user_id
            and w.get("status") == "planned"
            and w.get("plan_week_start") == result["week_start"]
        )
    ]

    workouts.extend(result["workouts"])

    save_workouts(workouts)

    return result


@app.post("/planner/replan-remaining-week")
def planner_replan_remaining_week(
    request: PlanRequest = PlanRequest(),
    authorization: str | None = Header(default=None)
):

    user_id = get_authenticated_user(
        authorization
    )

    workouts = load_workouts()

    user_workouts = [
        w for w in workouts if w["user_id"] == user_id
    ]

    result = planner.replan_remaining_week(
        user_id,
        user_workouts,
        date.today(),
        phase_override=request.phase_override
    )

    today_str = date.today().isoformat()

    # Only clear this user's planned (not completed) workouts from
    # today onward within the current week — past/completed entries
    # are never touched.
    workouts = [
        w for w in workouts
        if not (
            w["user_id"] == user_id
            and w.get("status") == "planned"
            and w.get("plan_week_start") == result["week_start"]
            and w["date"] >= today_str
        )
    ]

    workouts.extend(result["workouts"])

    save_workouts(workouts)

    return result