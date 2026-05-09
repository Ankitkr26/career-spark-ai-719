import os
from pymongo import MongoClient

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "placeiq")

_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
_db = _client[MONGO_DB_NAME]


def get_collection(name):
    return _db[name]


def serialize_doc(document):
    if document is None:
        return None
    payload = dict(document)
    payload["id"] = str(payload.pop("_id"))
    return payload
