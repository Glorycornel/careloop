from app.core import config


def test_validate_runtime_config_allows_development_defaults(monkeypatch):
    monkeypatch.setattr(config, "APP_ENV", "development")
    monkeypatch.setattr(config, "DATABASE_URL", config.DEFAULT_DATABASE_URL)
    monkeypatch.setattr(config, "JWT_SECRET_KEY", config.DEFAULT_JWT_SECRET_KEY)
    monkeypatch.setattr(config, "ALLOWED_ORIGINS", config.DEFAULT_ALLOWED_ORIGINS)
    monkeypatch.setattr(config, "ACCESS_TOKEN_EXPIRE_MINUTES", 60)
    monkeypatch.setattr(config, "REFRESH_TOKEN_EXPIRE_DAYS", 30)

    config.validate_runtime_config()


def test_validate_runtime_config_rejects_default_secret_in_production(monkeypatch):
    monkeypatch.setattr(config, "APP_ENV", "production")
    monkeypatch.setattr(config, "DATABASE_URL", "postgresql+psycopg2://prod:secret@db:5432/careloop")
    monkeypatch.setattr(config, "JWT_SECRET_KEY", config.DEFAULT_JWT_SECRET_KEY)
    monkeypatch.setattr(config, "ALLOWED_ORIGINS", ("https://careloop.app",))
    monkeypatch.setattr(config, "ACCESS_TOKEN_EXPIRE_MINUTES", 60)
    monkeypatch.setattr(config, "REFRESH_TOKEN_EXPIRE_DAYS", 30)

    try:
        config.validate_runtime_config()
        assert False, "Expected RuntimeError for default JWT secret in production"
    except RuntimeError as exc:
        assert "JWT_SECRET_KEY" in str(exc)


def test_validate_runtime_config_rejects_wildcard_cors_in_production(monkeypatch):
    monkeypatch.setattr(config, "APP_ENV", "production")
    monkeypatch.setattr(config, "DATABASE_URL", "postgresql+psycopg2://prod:secret@db:5432/careloop")
    monkeypatch.setattr(config, "JWT_SECRET_KEY", "super-secret")
    monkeypatch.setattr(config, "ALLOWED_ORIGINS", ("*",))
    monkeypatch.setattr(config, "ACCESS_TOKEN_EXPIRE_MINUTES", 60)
    monkeypatch.setattr(config, "REFRESH_TOKEN_EXPIRE_DAYS", 30)

    try:
        config.validate_runtime_config()
        assert False, "Expected RuntimeError for wildcard CORS in production"
    except RuntimeError as exc:
        assert "ALLOWED_ORIGINS" in str(exc)


def test_validate_runtime_config_rejects_non_positive_token_expiry(monkeypatch):
    monkeypatch.setattr(config, "APP_ENV", "development")
    monkeypatch.setattr(config, "ACCESS_TOKEN_EXPIRE_MINUTES", 0)
    monkeypatch.setattr(config, "REFRESH_TOKEN_EXPIRE_DAYS", 30)

    try:
        config.validate_runtime_config()
        assert False, "Expected RuntimeError for invalid token expiry"
    except RuntimeError as exc:
        assert "ACCESS_TOKEN_EXPIRE_MINUTES" in str(exc)


def test_validate_runtime_config_rejects_non_positive_refresh_expiry(monkeypatch):
    monkeypatch.setattr(config, "APP_ENV", "development")
    monkeypatch.setattr(config, "ACCESS_TOKEN_EXPIRE_MINUTES", 60)
    monkeypatch.setattr(config, "REFRESH_TOKEN_EXPIRE_DAYS", 0)

    try:
        config.validate_runtime_config()
        assert False, "Expected RuntimeError for invalid refresh token expiry"
    except RuntimeError as exc:
        assert "REFRESH_TOKEN_EXPIRE_DAYS" in str(exc)
