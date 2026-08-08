import json
import os
import hashlib
import secrets

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
USERS_FILE = os.path.join(DATA_DIR, "users.json")


def ensure_storage():
    os.makedirs(DATA_DIR, exist_ok=True)

    if not os.path.exists(USERS_FILE):
        with open(USERS_FILE, "w") as f:
            json.dump([], f)


def load_users():
    ensure_storage()

    with open(USERS_FILE, "r") as f:
        return json.load(f)


def save_users(users):
    ensure_storage()

    with open(USERS_FILE, "w") as f:
        json.dump(users, f, indent=2)


def hash_password(password: str, salt: str | None = None):
    if salt is None:
        salt = secrets.token_hex(16)

    password_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode(),
        salt.encode(),
        100_000
    ).hex()

    return f"{salt}${password_hash}"


def verify_password(password: str, stored_password: str):
    try:
        salt, stored_hash = stored_password.split("$")

        password_hash = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode(),
            salt.encode(),
            100_000
        ).hex()

        return secrets.compare_digest(password_hash, stored_hash)

    except ValueError:
        return False


def find_user_by_email(email: str):
    users = load_users()

    for user in users:
        if user["email"].lower() == email.lower():
            return user

    return None


def create_user(email: str, password: str, name: str):
    users = load_users()

    if find_user_by_email(email):
        raise ValueError("An account with this email already exists.")

    user = {
        "id": secrets.token_hex(8),
        "name": name,
        "email": email.lower(),
        "password": hash_password(password)
    }

    users.append(user)
    save_users(users)

    return user