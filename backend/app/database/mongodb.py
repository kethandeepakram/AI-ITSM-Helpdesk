import os

from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
MONGODB_DATABASE = os.getenv("MONGODB_DATABASE", "itsm_helpdesk")

_client = None


def get_database():
    global _client

    if not MONGODB_URI:
        raise RuntimeError(
            "MONGODB_URI is not configured in the .env file"
        )

    if _client is None:
        _client = MongoClient(
            MONGODB_URI,
            serverSelectionTimeoutMS=5000
        )

    return _client[MONGODB_DATABASE]


def get_tickets_collection():
    db = get_database()
    return db["tickets"]