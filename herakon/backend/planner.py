"""
Herakon adaptive training planner.

This module is intentionally kept separate from main.py (the API layer).
Everything in here is plain, editable Python — there is no black-box
model. If you want to change how Herakon plans your training, this is
the only file you should need to touch.

IMPORTANT HONESTY NOTE:
This is an experimental personal training planner, not a certified
coaching system. The heuristics below are simple and transparent on
purpose. In particular:

  - "Peak" phase is never chosen automatically. Detecting a taper
    properly requires a target race date, which Herakon doesn't
    store yet. Peak can only be selected via an explicit override.
  - Pace-based time estimates only work for common "M:SS/unit"
    formats (e.g. "4:25/km", "2:00/100m"). Anything else (e.g.
    "threshold", "zone 2") is just a label — no time is guessed
    from it.
  - Suggested distances/times for planned sessions are based on
    your own recent averages for that sport + workout type, with
    conservative generic fallbacks when there's no history yet.
"""

from datetime import date, timedelta
import re
import secrets


# ==================================================
# TUNABLE CONSTANTS
# (edit these freely — this is the "methodology" file)
# ==================================================

# Workout types considered "hard" (i.e. meaningfully fatiguing).
# Used to avoid stacking hard sessions back-to-back.
HARD_TYPES = {"interval", "tempo", "race_pace", "test"}

# Target sessions per sport, per week, before phase adjustment.
BASE_SESSIONS_PER_SPORT = {
    "swim": 2,
    "bike": 2,
    "run": 3,
    "gym": 2,
}

# How much each phase scales the base session targets and volume.
PHASE_SESSION_MULTIPLIER = {
    "recovery": 0.6,
    "base": 1.0,
    "build": 1.15,
    "peak": 1.1,
}

# How much each phase scales suggested distance/duration per session.
PHASE_VOLUME_MULTIPLIER = {
    "recovery": 0.7,
    "base": 1.0,
    "build": 1.1,
    "peak": 1.05,
}

# Every Nth week is treated as a deload/recovery week by default,
# unless there's a stronger signal (e.g. a big recent volume drop).
DELOAD_EVERY_N_WEEKS = 4

# If the most recent week's total training time dropped by more than
# this fraction compared to the prior 3-week average, treat it as a
# fatigue/missed-training signal and lean towards recovery next week.
FATIGUE_DROP_THRESHOLD = 0.40

# When replanning the *remaining* days of the current week (because
# sessions were missed), the plan is allowed to grow by at most this
# fraction relative to a simple pro-rated target. This is the guard
# against "cramming" — see replan logic below.
MAX_REMAINING_WEEK_INCREASE_FRACTION = 0.15

# Fallback session targets used only when there's no history for a
# given sport + workout type combination yet.
FALLBACK_TARGETS = {
    ("swim", "recovery"): {"distance": 1.0, "duration": 25 * 60},
    ("swim", "aerobic"): {"distance": 2.0, "duration": 45 * 60},
    ("swim", "long"): {"distance": 3.0, "duration": 65 * 60},
    ("swim", "technique"): {"distance": 1.5, "duration": 40 * 60},
    ("swim", "interval"): {"distance": 2.0, "duration": 45 * 60},
    ("swim", "race_pace"): {"distance": 1.8, "duration": 40 * 60},
    ("swim", "test"): {"distance": 1.0, "duration": 25 * 60},
    ("bike", "recovery"): {"distance": 20.0, "duration": 40 * 60},
    ("bike", "aerobic"): {"distance": 35.0, "duration": 75 * 60},
    ("bike", "long"): {"distance": 70.0, "duration": 150 * 60},
    ("bike", "tempo"): {"distance": 40.0, "duration": 80 * 60},
    ("bike", "interval"): {"distance": 35.0, "duration": 70 * 60},
    ("bike", "brick"): {"distance": 40.0, "duration": 80 * 60},
    ("bike", "race_pace"): {"distance": 45.0, "duration": 90 * 60},
    ("bike", "test"): {"distance": 20.0, "duration": 30 * 60},
    ("run", "recovery"): {"distance": 5.0, "duration": 30 * 60},
    ("run", "aerobic"): {"distance": 8.0, "duration": 45 * 60},
    ("run", "long"): {"distance": 14.0, "duration": 80 * 60},
    ("run", "tempo"): {"distance": 8.0, "duration": 40 * 60},
    ("run", "interval"): {"distance": 8.0, "duration": 40 * 60},
    ("run", "race_pace"): {"distance": 10.0, "duration": 50 * 60},
    ("run", "brick"): {"distance": 5.0, "duration": 28 * 60},
    ("run", "test"): {"distance": 3.0, "duration": 20 * 60},
    ("gym", "full_body"): {"duration": 45 * 60},
    ("gym", "chest"): {"duration": 40 * 60},
    ("gym", "back"): {"duration": 40 * 60},
    ("gym", "shoulders"): {"duration": 35 * 60},
    ("gym", "biceps"): {"duration": 30 * 60},
    ("gym", "triceps"): {"duration": 30 * 60},
    ("gym", "legs"): {"duration": 45 * 60},
    ("gym", "glutes"): {"duration": 35 * 60},
    ("gym", "core"): {"duration": 25 * 60},
    ("gym", "test"): {"duration": 35 * 60},
}


# A small, curated exercise library, keyed by muscle group. Kept
# intentionally short — this is meant to cover common movements, not
# be exhaustive. Add to these lists freely.
EXERCISE_LIBRARY = {
    "chest": [
        "Bench Press", "Incline Bench Press", "Dumbbell Bench Press",
        "Incline Dumbbell Press", "Cable Fly", "Pec Deck", "Push-ups",
    ],
    "back": [
        "Pull-ups", "Lat Pulldown", "Barbell Row", "Dumbbell Row",
        "Seated Cable Row", "Chest-supported Row",
    ],
    "shoulders": [
        "Overhead Press", "Dumbbell Shoulder Press", "Lateral Raise",
        "Front Raise", "Rear Delt Fly", "Arnold Press",
    ],
    "biceps": [
        "Barbell Curl", "Dumbbell Curl", "Hammer Curl",
        "Preacher Curl", "Cable Curl",
    ],
    "triceps": [
        "Tricep Pushdown", "Overhead Tricep Extension",
        "Close-Grip Bench Press", "Skull Crushers", "Dips",
    ],
    "legs": [
        "Squat", "Leg Press", "Romanian Deadlift",
        "Bulgarian Split Squat", "Leg Extension", "Leg Curl", "Calf Raise",
    ],
    "glutes": [
        "Hip Thrust", "Glute Bridge", "Cable Kickback",
        "Romanian Deadlift", "Bulgarian Split Squat",
    ],
    "core": [
        "Plank", "Hanging Leg Raise", "Cable Crunch",
        "Russian Twist", "Ab Wheel Rollout",
    ],
    "full_body": [
        "Deadlift", "Clean", "Kettlebell Swing", "Thruster", "Burpees",
    ],
}

# For a "full_body" gym session, pick one exercise from each of these
# groups (in order) rather than pulling only from EXERCISE_LIBRARY's
# own "full_body" list — gives a more realistic full-body session.
FULL_BODY_ROTATION = ["legs", "chest", "back", "shoulders", "core"]

# Sport-appropriate strokes, offered on swim sets.
SWIM_STROKES = ["FC", "Breast", "Back", "Fly", "IM", "Kick", "Drill"]


# ==================================================
# PACE STRING HELPERS
# ==================================================
#
# These mirror the pace parser used client-side in app.js. Pace
# strings only support common "M:SS/unit" formats — anything else
# (e.g. "threshold", "zone 2") is treated as a label, not parsed.

PACE_PATTERN = re.compile(
    r"^(\d{1,2}):(\d{2})\s*/\s*(km|mi|100m|50m|25m|500m)?$", re.IGNORECASE
)

UNIT_TO_KM = {
    "km": 1, "mi": 1.60934, "100m": 0.1, "50m": 0.05, "25m": 0.025, "500m": 0.5,
}


def parse_pace_seconds_per_km(pace):
    if not pace:
        return None

    match = PACE_PATTERN.match(pace.strip())
    if not match:
        return None

    minutes, seconds, unit = match.groups()
    unit = (unit or "km").lower()
    pace_seconds = int(minutes) * 60 + int(seconds)

    return pace_seconds / UNIT_TO_KM[unit]


def format_pace_seconds_per_km(seconds_per_km, unit="km"):
    """Formats a seconds/km value back into a 'M:SS/unit' string,
    converting to the given display unit first (e.g. '100m' for
    swim paces)."""

    unit_km = UNIT_TO_KM.get(unit, 1)
    seconds = seconds_per_km * unit_km
    minutes = int(seconds // 60)
    remaining = round(seconds % 60)
    if remaining == 60:
        minutes += 1
        remaining = 0
    return f"{minutes}:{remaining:02d}/{unit}"


# ==================================================
# DATE HELPERS
# ==================================================

def to_date(date_str):
    return date.fromisoformat(date_str)


def to_str(d):
    return d.isoformat()


def get_monday(d):
    return d - timedelta(days=d.weekday())


def week_range(monday):
    return monday, monday + timedelta(days=6)


# ==================================================
# STEP 1 — ANALYSE RECENT TRAINING
# ==================================================

def analyze_recent_training(workouts, as_of, weeks_back=4):
    """
    Builds a simple per-week summary of *completed* training for the
    last `weeks_back` weeks, ending on the Sunday before `as_of`'s week.

    Returns:
        {
            "weeks": [ { "start": "YYYY-MM-DD", "distance_by_sport": {...},
                         "duration_seconds": int, "session_count": int,
                         "hard_session_count": int }, ... ]  # oldest -> newest
            "averages_by_sport_type": { (sport, type): {"distance":.., "duration":..} }
        }
    """

    completed = [w for w in workouts if w.get("status", "completed") == "completed"]

    this_monday = get_monday(as_of)

    weeks = []

    for i in range(weeks_back, 0, -1):
        week_start = this_monday - timedelta(weeks=i)
        week_end = week_start + timedelta(days=6)

        week_workouts = [
            w for w in completed
            if week_start <= to_date(w["date"]) <= week_end
        ]

        distance_by_sport = {"swim": 0.0, "bike": 0.0, "run": 0.0}
        duration_seconds = 0
        hard_count = 0

        for w in week_workouts:
            sport = w.get("sport")
            if sport in distance_by_sport and w.get("distance"):
                distance_by_sport[sport] += w["distance"]
            duration_seconds += w.get("duration") or 0
            if w.get("workout_type") in HARD_TYPES:
                hard_count += 1

        weeks.append({
            "start": to_str(week_start),
            "distance_by_sport": distance_by_sport,
            "duration_seconds": duration_seconds,
            "session_count": len(week_workouts),
            "hard_session_count": hard_count,
        })

    # Historical averages per (sport, workout_type), across everything
    # the user has actually completed — used to suggest realistic
    # planned distances/durations instead of guessing blind.
    buckets = {}

    for w in completed:
        key = (w.get("sport"), w.get("workout_type"))
        if not w.get("distance") and not w.get("duration"):
            continue
        buckets.setdefault(key, {"distance": [], "duration": []})
        if w.get("distance"):
            buckets[key]["distance"].append(w["distance"])
        if w.get("duration"):
            buckets[key]["duration"].append(w["duration"])

    averages = {}
    for key, values in buckets.items():
        averages[key] = {
            "distance": (
                round(sum(values["distance"]) / len(values["distance"]), 2)
                if values["distance"] else None
            ),
            "duration": (
                round(sum(values["duration"]) / len(values["duration"]))
                if values["duration"] else None
            ),
        }

    # Distinct past weeks (across the user's FULL history, not just
    # the lookback window above) that had at least one completed
    # session. Used to anchor the deload cycle to this individual's
    # own training cadence rather than a shared calendar date — so
    # two users starting on different dates don't get deloaded on
    # the same calendar week just by coincidence.
    trained_week_starts = {
        to_str(get_monday(to_date(w["date"])))
        for w in completed
        if to_date(w["date"]) < this_monday
    }

    return {
        "weeks": weeks,
        "averages_by_sport_type": averages,
        "total_training_weeks": len(trained_week_starts),
    }


# ==================================================
# STEP 2 — DETERMINE TRAINING PHASE
# ==================================================

def determine_phase(analysis, as_of, override=None):
    """
    Picks base / build / recovery automatically. "peak" is only ever
    returned if explicitly passed in as `override` — see module
    docstring for why.
    """

    if override in ("base", "build", "peak", "recovery"):
        return override

    weeks = analysis["weeks"]

    # Not enough history yet — start conservative.
    if len(weeks) < 2 or all(w["session_count"] == 0 for w in weeks):
        return "base"

    latest = weeks[-1]
    prior = weeks[:-1]

    prior_avg_duration = (
        sum(w["duration_seconds"] for w in prior) / len(prior)
        if prior else 0
    )

    # Signal 1: a sharp recent drop in training suggests missed
    # sessions or fatigue — recommend recovery next.
    if prior_avg_duration > 0:
        drop = (prior_avg_duration - latest["duration_seconds"]) / prior_avg_duration
        if drop >= FATIGUE_DROP_THRESHOLD:
            return "recovery"

    # Signal 2: simple cyclical deload — every Nth week of training
    # (counted from this individual's own history, not a shared
    # calendar date) is a lighter week by default. This is a common,
    # easy-to-explain heuristic; replace it with something smarter
    # once you've researched a methodology you like.
    total_training_weeks = analysis.get("total_training_weeks", 0)
    if total_training_weeks > 0 and total_training_weeks % DELOAD_EVERY_N_WEEKS == 0:
        return "recovery"

    # Signal 3: steady, gradual increase over the tracked weeks ->
    # build. Otherwise default to base.
    durations = [w["duration_seconds"] for w in weeks if w["session_count"] > 0]
    if len(durations) >= 3:
        increasing = all(
            durations[i] <= durations[i + 1] * 1.2
            for i in range(len(durations) - 1)
        )
        modest_growth = durations[-1] >= durations[0]
        if increasing and modest_growth:
            return "build"

    return "base"


# ==================================================
# STEP 3 — ESTIMATE A SESSION'S TARGET DISTANCE/DURATION
# ==================================================

def estimate_session_target(sport, workout_type, analysis, phase):
    averages = analysis["averages_by_sport_type"].get((sport, workout_type))
    fallback = FALLBACK_TARGETS.get((sport, workout_type), {})

    distance = None
    duration = None

    if averages and averages.get("distance"):
        distance = averages["distance"]
    elif "distance" in fallback:
        distance = fallback["distance"]

    if averages and averages.get("duration"):
        duration = averages["duration"]
    elif "duration" in fallback:
        duration = fallback["duration"]

    multiplier = PHASE_VOLUME_MULTIPLIER.get(phase, 1.0)

    if distance is not None:
        distance = round(distance * multiplier, 2)
    if duration is not None:
        duration = round(duration * multiplier)

    return {"distance": distance, "duration": duration}


# ==================================================
# STEP 4 — SESSION TYPE SELECTION PER PHASE
# ==================================================

# For each phase, which workout types are eligible per sport, roughly
# in priority order. The scheduler below picks from these lists.
PHASE_TYPE_POOL = {
    "recovery": {
        "swim": ["recovery", "technique"],
        "bike": ["recovery"],
        "run": ["recovery"],
        "gym": ["full_body"],
    },
    "base": {
        "swim": ["aerobic", "technique", "recovery"],
        "bike": ["aerobic", "recovery", "long"],
        "run": ["aerobic", "long", "recovery"],
        "gym": ["full_body", "legs", "back"],
    },
    "build": {
        "swim": ["interval", "aerobic", "technique"],
        "bike": ["tempo", "interval", "long", "aerobic"],
        "run": ["interval", "tempo", "long", "aerobic"],
        "gym": ["legs", "back", "chest", "shoulders"],
    },
    "peak": {
        "swim": ["race_pace", "technique", "aerobic"],
        "bike": ["race_pace", "brick", "aerobic"],
        "run": ["race_pace", "brick", "aerobic"],
        "gym": ["full_body"],
    },
}


# ==================================================
# STEP 4.5 — HISTORICAL PACE + STRUCTURED SESSION CONTENT
# ==================================================
#
# These functions turn a plain {distance, duration} target into the
# structured sections/exercises Herakon now displays and logs
# workouts with. Everything here is template-based and deterministic
# on purpose — see the module docstring.

def extract_pace_range(workouts, sport, workout_type=None, sample_size=5):
    """
    Looks through completed workouts for parseable pace strings inside
    structured sets, and returns a rough (low, high) seconds-per-km
    range from the most recent `sample_size` values found. Returns
    None if there's nothing usable yet.

    If `workout_type` is given, prefers sets from that workout type
    first, falling back to any workout of the same sport.
    """

    completed = [
        w for w in workouts
        if w.get("status", "completed") == "completed"
        and w.get("sport") == sport
        and w.get("sections")
    ]

    completed.sort(key=lambda w: w["date"], reverse=True)

    def collect_paces(pool):
        paces = []
        for w in pool:
            for section in (w.get("sections") or []):
                for s in (section.get("sets") or []):
                    seconds_per_km = parse_pace_seconds_per_km(s.get("pace"))
                    if seconds_per_km is not None:
                        paces.append(seconds_per_km)
        return paces

    if workout_type:
        typed = [w for w in completed if w.get("workout_type") == workout_type]
        paces = collect_paces(typed)[:sample_size]
        if paces:
            return min(paces), max(paces)

    paces = collect_paces(completed)[:sample_size]
    if not paces:
        return None

    return min(paces), max(paces)


def has_any_pace_history(workouts, sport):
    """Used by the benchmark/test scheduler — true if we've never
    recorded a usable pace for this sport."""

    return extract_pace_range(workouts, sport) is not None


def _round_step(value, step):
    if value <= 0:
        return 0
    return max(round(value / step) * step, step)


def build_endurance_sections(sport, workout_type, target_distance, target_duration, raw_workouts):
    """
    Builds the section/set list for a swim/bike/run session. Swim set
    distances are in metres (matching how pool sessions are actually
    described); bike/run set distances are in km, matching the rest
    of the app. `target_distance` is always in km on the way in.
    """

    pace_range = extract_pace_range(raw_workouts, sport, workout_type)

    pace_text = None
    if pace_range:
        low, high = pace_range
        unit = "100m" if sport == "swim" else "km"
        pace_text = f"{format_pace_seconds_per_km(high, unit)}\u2013{format_pace_seconds_per_km(low, unit)}"

    def easy_set(distance_km, duration_seconds, note="easy"):
        set_row = {
            "distance": None, "duration": None, "pace": None,
            "reps": 1, "rest_seconds": None, "notes": note,
        }
        if sport == "swim":
            set_row["distance"] = _round_step((distance_km or 0) * 1000, 50) or None
            set_row["stroke"] = "FC"
        else:
            set_row["distance"] = round(distance_km, 2) if distance_km else None
            set_row["duration"] = duration_seconds
        return set_row

    total_distance = target_distance or 0
    total_duration = target_duration or 0

    if workout_type == "test":
        # Benchmark session: no assumed pace, just a controlled protocol.
        if sport == "swim":
            main_set = {
                "distance": None, "duration": 10 * 60, "pace": None,
                "reps": 1, "rest_seconds": None, "stroke": "FC",
                "notes": "Swim continuously — record distance covered",
            }
        elif sport == "bike":
            main_set = {
                "distance": None, "duration": 20 * 60, "pace": None,
                "reps": 1, "rest_seconds": None,
                "notes": "Controlled time-trial effort — record average power/speed",
            }
        else:
            main_set = {
                "distance": None, "duration": None, "pace": None,
                "reps": 1, "rest_seconds": None,
                "notes": "Time a continuous 3km effort at maximum sustainable pace",
            }
        return [
            {"name": "Warm-up", "sets": [easy_set(total_distance * 0.15, round(total_duration * 0.2), "easy, building gradually")]},
            {"name": "Main", "sets": [main_set]},
            {"name": "Cool-down", "sets": [easy_set(total_distance * 0.1, round(total_duration * 0.15))]},
        ]

    if workout_type == "interval":

        warm_up_distance = total_distance * 0.15
        cool_down_distance = total_distance * 0.1
        main_distance = max(total_distance - warm_up_distance - cool_down_distance, 0)

        if sport == "swim":
            rep_distance_m = 200
            reps = max(round((main_distance * 1000) / rep_distance_m), 2)
            main_set = {
                "distance": rep_distance_m, "duration": None, "pace": pace_text,
                "reps": reps, "rest_seconds": 25, "stroke": "FC", "notes": None,
            }
        elif sport == "bike":
            rep_minutes = 5
            main_seconds = total_duration * 0.7
            reps = max(round(main_seconds / (rep_minutes * 60)), 2)
            main_set = {
                "distance": None, "duration": rep_minutes * 60, "pace": pace_text or "hard effort",
                "reps": reps, "rest_seconds": 180, "notes": None,
            }
        else:
            rep_distance_km = 1.0
            reps = max(round(main_distance / rep_distance_km), 2)
            main_set = {
                "distance": rep_distance_km, "duration": None, "pace": pace_text,
                "reps": reps, "rest_seconds": 90, "notes": None,
            }

        return [
            {"name": "Warm-up", "sets": [easy_set(warm_up_distance, round(total_duration * 0.15))]},
            {"name": "Main", "sets": [main_set]},
            {"name": "Cool-down", "sets": [easy_set(cool_down_distance, round(total_duration * 0.1))]},
        ]

    if sport == "swim" and workout_type in ("aerobic", "recovery", "long"):

        warm_up_m = _round_step(total_distance * 1000 * 0.15, 50)
        technique_m = _round_step(total_distance * 1000 * 0.15, 50)
        finisher_m = _round_step(total_distance * 1000 * 0.1, 50)
        cool_down_m = _round_step(total_distance * 1000 * 0.1, 50)
        main_m = max(
            _round_step(total_distance * 1000 - warm_up_m - technique_m - finisher_m - cool_down_m, 50),
            200,
        )
        main_reps = max(round(main_m / 200), 1)

        return [
            {"name": "Warm-up", "sets": [
                {"distance": warm_up_m or 200, "duration": None, "pace": None, "reps": 1,
                 "rest_seconds": None, "stroke": "FC", "notes": "easy"},
            ]},
            {"name": "Technique", "sets": [
                {"distance": 50, "duration": None, "pace": None, "reps": 4,
                 "rest_seconds": 15, "stroke": "Drill", "notes": "catch-up drill"},
                {"distance": 50, "duration": None, "pace": None, "reps": 4,
                 "rest_seconds": 15, "stroke": "FC", "notes": "long strokes"},
            ]},
            {"name": "Main", "sets": [
                {"distance": 200, "duration": None, "pace": pace_text, "reps": main_reps,
                 "rest_seconds": 25, "stroke": "FC", "notes": None},
            ]},
            {"name": "Finisher", "sets": [
                {"distance": 50, "duration": None, "pace": None, "reps": 4,
                 "rest_seconds": 20, "stroke": "FC", "notes": "25m strong / 25m easy"},
            ]},
            {"name": "Cool-down", "sets": [
                {"distance": cool_down_m or 200, "duration": None, "pace": None, "reps": 1,
                 "rest_seconds": None, "stroke": "FC", "notes": "easy"},
            ]},
        ]

    if sport == "swim" and workout_type == "technique":
        return [
            {"name": "Warm-up", "sets": [
                {"distance": 200, "duration": None, "pace": None, "reps": 1,
                 "rest_seconds": None, "stroke": "FC", "notes": "easy"},
            ]},
            {"name": "Technique", "sets": [
                {"distance": 50, "duration": None, "pace": None, "reps": 6,
                 "rest_seconds": 20, "stroke": "Drill", "notes": "catch-up drill"},
                {"distance": 100, "duration": None, "pace": None, "reps": 4,
                 "rest_seconds": 20, "stroke": "FC", "notes": "focus on technique"},
            ]},
            {"name": "Cool-down", "sets": [
                {"distance": 200, "duration": None, "pace": None, "reps": 1,
                 "rest_seconds": None, "stroke": "FC", "notes": "easy"},
            ]},
        ]

    # Generic continuous session (bike/run recovery/aerobic/long/tempo,
    # race_pace, or swim race_pace/brick).
    warm_up_distance = total_distance * 0.15
    cool_down_distance = total_distance * 0.1
    main_distance = max(total_distance - warm_up_distance - cool_down_distance, 0)
    warm_up_duration = round(total_duration * 0.15)
    cool_down_duration = round(total_duration * 0.1)
    main_duration = max(total_duration - warm_up_duration - cool_down_duration, 0)

    main_note = "aerobic effort" if workout_type in ("aerobic", "recovery", "long") else workout_type.replace("_", " ")

    main_set = easy_set(main_distance, main_duration, main_note)
    if pace_text:
        main_set["pace"] = pace_text
        main_set["notes"] = None

    return [
        {"name": "Warm-up", "sets": [easy_set(warm_up_distance, warm_up_duration)]},
        {"name": "Main", "sets": [main_set]},
        {"name": "Cool-down", "sets": [easy_set(cool_down_distance, cool_down_duration)]},
    ]


def build_gym_exercises(muscle_group, raw_workouts):
    """
    Picks 3-4 exercises for the given muscle group (or a rotation of
    groups, for full_body), suggesting a weight from historical
    performance of that exact exercise if available.
    """

    completed_gym = [
        w for w in raw_workouts
        if w.get("status", "completed") == "completed"
        and w.get("sport") == "gym"
        and w.get("exercises")
    ]

    def recent_weight_for(exercise_name):
        weights = []
        for w in sorted(completed_gym, key=lambda w: w["date"], reverse=True):
            for ex in (w.get("exercises") or []):
                if ex.get("exercise") == exercise_name and ex.get("weight"):
                    weights.append(ex["weight"])
        return weights[0] if weights else None

    if muscle_group == "full_body":
        picks = [(group, EXERCISE_LIBRARY[group][0]) for group in FULL_BODY_ROTATION]
    else:
        pool = EXERCISE_LIBRARY.get(muscle_group, EXERCISE_LIBRARY["full_body"])
        picks = [(muscle_group, name) for name in pool[:4]]

    exercises = []
    for group, name in picks:
        exercises.append({
            "muscle_group": group,
            "exercise": name,
            "sets": 3,
            "reps": 10,
            "weight": recent_weight_for(name),
            "notes": None,
        })

    return exercises


# ==================================================
# STEP 5 — BUILD THE WEEK'S SESSION LIST + ASSIGN DAYS
# ==================================================

def generate_week_plan(
    user_id,
    analysis,
    raw_workouts,
    start_date,
    end_date,
    phase,
    volume_scale=1.0,
):
    """
    Produces a list of planned workout dicts (not yet saved) covering
    every day from start_date to end_date inclusive.

    `raw_workouts` (this user's full completed+planned history) is
    used to pull historical paces and gym weights for the sections/
    exercises generated below — separate from `analysis`, which only
    holds the summarised numbers.

    `volume_scale` lets the "replan remaining week" flow shrink the
    plan when part of the week is already done — see main.py.
    """

    num_days = (end_date - start_date).days + 1
    days = [start_date + timedelta(days=i) for i in range(num_days)]

    session_multiplier = PHASE_SESSION_MULTIPLIER.get(phase, 1.0) * volume_scale

    targets = {}
    for sport, base_count in BASE_SESSIONS_PER_SPORT.items():
        scaled = round(base_count * session_multiplier)
        # Always allow at least 1 session if the base target is
        # non-zero, and never plan more than 4 sessions/sport/week —
        # keeps this from ever exploding into an unrealistic week.
        targets[sport] = max(0 if base_count == 0 else min(scaled, 4), 0)

    # Build the flat list of sessions to place this week.
    sessions_to_place = []

    for sport in ["swim", "bike", "run", "gym"]:
        pool = PHASE_TYPE_POOL.get(phase, PHASE_TYPE_POOL["base"])[sport]
        count = targets[sport]

        for i in range(count):
            # Cycle through the type pool so a week isn't all identical
            # sessions, but the first ideally-hardest slot only gets a
            # hard type if the phase pool actually contains one.
            workout_type = pool[i % len(pool)]
            sessions_to_place.append({"sport": sport, "workout_type": workout_type})

    # Benchmark/test scheduling: if we've never recorded a usable pace
    # for an endurance sport, swap its first session this week for a
    # controlled test session instead — just enough to get a baseline.
    # This naturally stops firing once a pace has been logged, so it
    # never generates tests "constantly".
    for sport in ["swim", "bike", "run"]:
        if targets[sport] == 0:
            continue
        if has_any_pace_history(raw_workouts, sport):
            continue
        for session in sessions_to_place:
            if session["sport"] == sport and session["workout_type"] != "brick":
                session["workout_type"] = "test"
                break

    # Peak-phase brick handling: replace a bike + a run slot with a
    # linked brick pair, if both exist and phase pool suggests brick.
    if phase == "peak":
        has_bike_brick = any(
            s["sport"] == "bike" and s["workout_type"] == "brick"
            for s in sessions_to_place
        )
        has_run_brick = any(
            s["sport"] == "run" and s["workout_type"] == "brick"
            for s in sessions_to_place
        )
        if not has_bike_brick and any(s["sport"] == "bike" for s in sessions_to_place):
            for s in sessions_to_place:
                if s["sport"] == "bike":
                    s["workout_type"] = "brick"
                    break
        if not has_run_brick and any(s["sport"] == "run" for s in sessions_to_place):
            for s in sessions_to_place:
                if s["sport"] == "run":
                    s["workout_type"] = "brick"
                    break

    # --- Day assignment ---
    #
    # Simple, deterministic slot-filling:
    #  1. A brick pair (bike+run on the same day) is placed together,
    #     as a single unit, before anything else — otherwise the hard
    #     session spacing rule below would push them onto different
    #     days and defeat the entire point of a brick session.
    #  2. Remaining hard sessions get placed next, spaced away from
    #     each other and from the brick day.
    #  3. Long sessions prefer weekend days.
    #  4. Try to leave at least one fully rest day per week (more if
    #     recovery phase).
    #  5. Everything else fills remaining slots in date order.

    day_assignments = {d: [] for d in days}

    def is_hard(session):
        return session["workout_type"] in HARD_TYPES or session["workout_type"] == "brick"

    def day_has_hard(d):
        return any(is_hard(s) for s in day_assignments[d])

    def day_session_count(d):
        return len(day_assignments[d])

    # Pull out a brick pair (if the phase produced one) so it can be
    # scheduled as a linked unit rather than two independent sessions.
    bike_brick = next(
        (s for s in sessions_to_place if s["sport"] == "bike" and s["workout_type"] == "brick"),
        None,
    )
    run_brick = next(
        (s for s in sessions_to_place if s["sport"] == "run" and s["workout_type"] == "brick"),
        None,
    )
    brick_pair = (bike_brick, run_brick) if (bike_brick and run_brick) else None

    if brick_pair:
        sessions_to_place = [
            s for s in sessions_to_place if s is not bike_brick and s is not run_brick
        ]

    hard_sessions = [s for s in sessions_to_place if is_hard(s)]
    long_sessions = [s for s in sessions_to_place if s["workout_type"] == "long"]
    other_sessions = [
        s for s in sessions_to_place
        if s not in hard_sessions and s not in long_sessions
    ]

    # Reserve a rest day: the day with the least "pull" — for a 7-day
    # week, default rest day is the day right after the most likely
    # long-session day (usually keeps Friday or Monday free).
    rest_day_index = min(3, num_days - 1) if phase != "recovery" else None
    rest_days = set()
    if phase == "recovery" and num_days >= 5:
        rest_days = {days[3], days[6] if num_days > 6 else days[-1]}
    elif rest_day_index is not None and num_days >= 5:
        rest_days = {days[rest_day_index]}

    def candidate_days(prefer_weekend=False, avoid_hard=False):
        ordered = sorted(
            (d for d in days if d not in rest_days),
            key=lambda d: (
                day_session_count(d),
                0 if (prefer_weekend and d.weekday() >= 5) else 1,
                1 if (avoid_hard and day_has_hard(d)) else 0,
            ),
        )
        return ordered or list(days)

    brick_link_id = None

    # Place the brick pair first, together, preferring an otherwise
    # empty weekend day (brick sessions are typically long).
    if brick_pair:
        bike_brick, run_brick = brick_pair
        placed = False
        for d in candidate_days(prefer_weekend=True, avoid_hard=True):
            if day_session_count(d) == 0:
                day_assignments[d].append(bike_brick)
                day_assignments[d].append(run_brick)
                placed = True
                break
        if not placed:
            fallback_day = min(days, key=day_session_count)
            day_assignments[fallback_day].append(bike_brick)
            day_assignments[fallback_day].append(run_brick)

        brick_link_id = secrets.token_hex(4)
        bike_brick["linked_id"] = brick_link_id
        run_brick["linked_id"] = brick_link_id

    # Place long sessions on weekend days next.
    for session in long_sessions:
        for d in candidate_days(prefer_weekend=True):
            if day_session_count(d) < 2:
                day_assignments[d].append(session)
                break
        else:
            fallback_day = min(days, key=day_session_count)
            day_assignments[fallback_day].append(session)

    # Place remaining hard sessions, spacing them away from other
    # hard sessions (including the brick day placed above).
    for session in hard_sessions:
        for d in candidate_days(avoid_hard=True):
            if not day_has_hard(d) and day_session_count(d) < 2:
                day_assignments[d].append(session)
                break
        else:
            fallback_day = min(days, key=day_session_count)
            day_assignments[fallback_day].append(session)

    # Fill in everything else, spreading sessions evenly.
    for session in other_sessions:
        d = min(days, key=day_session_count)
        day_assignments[d].append(session)

    # --- Turn assignments into workout dicts ---
    plan_week_start = to_str(get_monday(start_date))
    planned_workouts = []

    for d in days:
        for session in day_assignments[d]:
            target = estimate_session_target(
                session["sport"], session["workout_type"], analysis, phase
            )

            sport = session["sport"]
            workout_type = session["workout_type"]

            sections = None
            exercises = None

            if sport == "gym":
                exercises = build_gym_exercises(workout_type, raw_workouts)
            else:
                sections = build_endurance_sections(
                    sport, workout_type, target["distance"], target["duration"], raw_workouts
                )

            workout = {
                "id": secrets.token_hex(8),
                "user_id": user_id,
                "sport": sport,
                "workout_type": workout_type,
                "date": to_str(d),
                "status": "planned",
                "distance": target["distance"] if sport != "gym" else None,
                "duration": target["duration"],
                "actual_duration": None,
                "sections": sections,
                "exercises": exercises,
                "sets": None,
                "reps": None,
                "plan_week_start": plan_week_start,
                "linked_id": session.get("linked_id"),
                "notes": "",
            }

            planned_workouts.append(workout)

    return planned_workouts


# ==================================================
# PUBLIC ENTRY POINTS (called from main.py)
# ==================================================

def plan_next_week(user_id, workouts, today, phase_override=None):
    """
    Generates a fresh plan for the upcoming Monday-Sunday.
    """

    analysis = analyze_recent_training(workouts, today)
    phase = determine_phase(analysis, today, override=phase_override)

    next_monday = get_monday(today) + timedelta(days=7)
    next_sunday = next_monday + timedelta(days=6)

    plan = generate_week_plan(
        user_id, analysis, workouts, next_monday, next_sunday, phase, volume_scale=1.0
    )

    return {
        "phase": phase,
        "week_start": to_str(next_monday),
        "week_end": to_str(next_sunday),
        "workouts": plan,
    }


def replan_remaining_week(user_id, workouts, today, phase_override=None):
    """
    Adaptation entry point. Regenerates only the days from `today`
    onward within the CURRENT week, taking into account what's
    already been completed this week so it doesn't cram missed
    training into the days that are left.
    """

    analysis = analyze_recent_training(workouts, today)
    phase = determine_phase(analysis, today, override=phase_override)

    this_monday = get_monday(today)
    this_sunday = this_monday + timedelta(days=6)

    completed_this_week = [
        w for w in workouts
        if w.get("status", "completed") == "completed"
        and this_monday <= to_date(w["date"]) <= this_sunday
    ]

    # How much of the week's target has already been done, roughly,
    # measured in sessions (simple and robust vs. trying to compare
    # heterogeneous distance units across sports).
    full_week_days = (this_sunday - this_monday).days + 1
    remaining_days = (this_sunday - today).days + 1

    if remaining_days <= 0:
        return {
            "phase": phase,
            "week_start": to_str(this_monday),
            "week_end": to_str(this_sunday),
            "workouts": [],
        }

    # Pro-rated share of the week that remains, e.g. 3 of 7 days left
    # -> ~0.43 of a normal week's volume, before the anti-cramming cap.
    prorated_scale = remaining_days / full_week_days

    # Anti-cramming guard: even if a lot was missed, don't let the
    # remaining days' plan exceed the prorated share by more than
    # MAX_REMAINING_WEEK_INCREASE_FRACTION. Missed sessions are simply
    # dropped by this proration — they are never added on top of the
    # days that are left.
    volume_scale = min(
        prorated_scale * (1 + MAX_REMAINING_WEEK_INCREASE_FRACTION),
        1.0,
    )

    # Extra dampener: if the user has already trained MORE than a
    # typical pace for the days elapsed so far this week, ease off
    # the remaining days further rather than adding a full plan on
    # top of an already-heavy week. Floor at 0.3 so this never zeroes
    # the remaining week out completely.
    elapsed_days = full_week_days - remaining_days
    if elapsed_days > 0:
        target_sessions_this_phase = sum(
            round(base_count * PHASE_SESSION_MULTIPLIER.get(phase, 1.0))
            for base_count in BASE_SESSIONS_PER_SPORT.values()
        )
        expected_by_now = target_sessions_this_phase * (elapsed_days / full_week_days)
        if expected_by_now > 0 and len(completed_this_week) > expected_by_now:
            ahead_ratio = len(completed_this_week) / expected_by_now
            volume_scale = max(volume_scale / ahead_ratio, 0.3)

    plan = generate_week_plan(
        user_id, analysis, workouts, today, this_sunday, phase, volume_scale=volume_scale
    )

    return {
        "phase": phase,
        "week_start": to_str(this_monday),
        "week_end": to_str(this_sunday),
        "workouts": plan,
        "already_completed_this_week": len(completed_this_week),
    }


def get_status(workouts, today):
    """Read-only summary for display — no side effects."""

    analysis = analyze_recent_training(workouts, today)
    phase = determine_phase(analysis, today)

    return {
        "phase": phase,
        "recent_weeks": analysis["weeks"],
    }
