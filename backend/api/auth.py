import secrets
from datetime import datetime
from django.contrib.auth.hashers import make_password, check_password
from rest_framework import authentication, exceptions
from .mongo import get_collection
from types import SimpleNamespace
from bson.objectid import ObjectId

users_col = get_collection("users")
tokens_col = get_collection("tokens")


class MongoUser(SimpleNamespace):
    @property
    def is_authenticated(self):
        return True

    @property
    def is_anonymous(self):
        return False

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "role": self.role,
        }


def _serialize_user(record):
    return MongoUser(
        id=str(record["_id"]),
        username=record["username"],
        email=record.get("email", ""),
        first_name=record.get("first_name", ""),
        last_name=record.get("last_name", ""),
        role=record.get("role", "student"),
        password=record.get("password", ""),
    )


def get_user_by_username(username):
    record = users_col.find_one({"username": username})
    return _serialize_user(record) if record else None


def get_user_by_id(user_id):
    try:
        record = users_col.find_one({"_id": ObjectId(user_id)})
    except Exception:
        return None
    return _serialize_user(record) if record else None


def create_user(username, email, password, first_name="", last_name="", role="student"):
    if get_user_by_username(username):
        return None
    hashed_password = make_password(password)
    result = users_col.insert_one(
        {
            "username": username,
            "email": email,
            "password": hashed_password,
            "first_name": first_name,
            "last_name": last_name,
            "role": role,
            "created_at": datetime.utcnow(),
        }
    )
    return get_user_by_id(str(result.inserted_id))


def verify_user(username, password):
    user = get_user_by_username(username)
    if not user:
        return None
    if check_password(password, user.password):
        return user
    return None


def create_token(user):
    token = secrets.token_hex(32)
    tokens_col.insert_one(
        {
            "token": token,
            "user_id": ObjectId(user.id),
            "created_at": datetime.utcnow(),
        }
    )
    return token


def get_user_from_token(token_key):
    token_record = tokens_col.find_one({"token": token_key})
    if not token_record:
        return None
    return get_user_by_id(str(token_record["user_id"]))


def invalidate_token(token_key):
    tokens_col.delete_one({"token": token_key})


class MongoTokenAuthentication(authentication.BaseAuthentication):
    keyword = "Token"

    def authenticate(self, request):
        header = authentication.get_authorization_header(request).split()
        if not header or header[0].lower() != self.keyword.lower().encode():
            return None
        if len(header) == 1:
            raise exceptions.AuthenticationFailed("Invalid token header. No credentials provided.")
        if len(header) > 2:
            raise exceptions.AuthenticationFailed("Invalid token header. Token string should not contain spaces.")

        token = header[1].decode()
        user = get_user_from_token(token)
        if not user:
            raise exceptions.AuthenticationFailed("Invalid or expired token.")
        return (user, token)

    def authenticate_header(self, request):
        return self.keyword
