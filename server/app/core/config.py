import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parents[3]
ENV_FILE = BASE_DIR / ".env"
if ENV_FILE.exists():
    load_dotenv(ENV_FILE)

DEFAULT_DATABASE_URL = "postgresql+psycopg2://careloop:careloop@localhost:5432/careloop"
DEFAULT_JWT_SECRET_KEY = "change_me"
DEFAULT_ALLOWED_ORIGINS = (
    "http://localhost:19006",
    "http://localhost:8081",
    "http://localhost:8000",
)


def _parse_csv(value: str | None) -> tuple[str, ...]:
    if not value:
        return ()
    return tuple(item.strip() for item in value.split(",") if item.strip())


APP_ENV = os.getenv("APP_ENV", "development").strip().lower()
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").strip().upper()
LOG_FORMAT = os.getenv("LOG_FORMAT", "json").strip().lower()
DATABASE_URL = os.getenv("DATABASE_URL", DEFAULT_DATABASE_URL)
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", DEFAULT_JWT_SECRET_KEY)
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "30"))
ALLOWED_ORIGINS = _parse_csv(os.getenv("ALLOWED_ORIGINS")) or DEFAULT_ALLOWED_ORIGINS
ERROR_REPORTING_WEBHOOK_URL = os.getenv("ERROR_REPORTING_WEBHOOK_URL")


def validate_runtime_config() -> None:
    if ACCESS_TOKEN_EXPIRE_MINUTES <= 0:
        raise RuntimeError("ACCESS_TOKEN_EXPIRE_MINUTES must be greater than 0")
    if REFRESH_TOKEN_EXPIRE_DAYS <= 0:
        raise RuntimeError("REFRESH_TOKEN_EXPIRE_DAYS must be greater than 0")

    if APP_ENV != "production":
        return

    if JWT_SECRET_KEY == DEFAULT_JWT_SECRET_KEY:
        raise RuntimeError("JWT_SECRET_KEY must be changed before running in production")

    if DATABASE_URL == DEFAULT_DATABASE_URL:
        raise RuntimeError("DATABASE_URL must be changed before running in production")

    if not ALLOWED_ORIGINS:
        raise RuntimeError("ALLOWED_ORIGINS must be set before running in production")

    if "*" in ALLOWED_ORIGINS:
        raise RuntimeError("ALLOWED_ORIGINS cannot contain '*' in production")
