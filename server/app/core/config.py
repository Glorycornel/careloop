import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parents[3]
ENV_FILE = BASE_DIR / ".env"
if ENV_FILE.exists():
    load_dotenv(ENV_FILE)

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://careloop:careloop@localhost:5432/careloop",
)

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change_me")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
