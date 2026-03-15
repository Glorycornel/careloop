from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import JWT_ALGORITHM, JWT_SECRET_KEY
from app.core.security import (
    create_access_token,
    create_refresh_token,
    get_password_hash,
    get_refresh_token_expiry,
    hash_token,
    verify_password,
)
from app.db.session import get_db
from app.models.refresh_token import RefreshToken
from app.models.user import User
from app.schemas.auth import LoginRequest, RefreshTokenRequest, Token
from app.schemas.user import UserCreate, UserOut, UserUpdate
from app.utils.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _normalize_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def _issue_token_pair(db: Session, user: User) -> Token:
    access_token = create_access_token(str(user.id))
    refresh_token = create_refresh_token(str(user.id))
    db.add(
        RefreshToken(
            user_id=user.id,
            token_hash=hash_token(refresh_token),
            expires_at=get_refresh_token_expiry(),
        )
    )
    db.commit()
    return Token(access_token=access_token, refresh_token=refresh_token)


def _decode_refresh_token_or_401(refresh_token: str) -> dict:
    try:
        payload = jwt.decode(refresh_token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
    except JWTError as exc:
        raise HTTPException(status_code=401, detail="Invalid refresh token") from exc

    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    if payload.get("sub") is None or payload.get("jti") is None:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    return payload


def _get_refresh_token_record_or_401(db: Session, refresh_token: str) -> RefreshToken:
    token_record = (
        db.query(RefreshToken)
        .filter(RefreshToken.token_hash == hash_token(refresh_token))
        .first()
    )
    if token_record is None:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    if token_record.revoked_at is not None:
        raise HTTPException(status_code=401, detail="Refresh token has been revoked")
    if _normalize_utc(token_record.expires_at) <= _utcnow():
        raise HTTPException(status_code=401, detail="Refresh token has expired")
    return token_record


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        full_name=payload.full_name,
        email=payload.email,
        hashed_password=get_password_hash(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    return _issue_token_pair(db, user)


@router.post("/refresh", response_model=Token)
def refresh(payload: RefreshTokenRequest, db: Session = Depends(get_db)):
    token_record = _get_refresh_token_record_or_401(db, payload.refresh_token)
    decoded_token = _decode_refresh_token_or_401(payload.refresh_token)
    user = db.query(User).filter(User.id == int(decoded_token["sub"])).first()
    if user is None or user.id != token_record.user_id:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    token_record.revoked_at = _utcnow()
    replacement_tokens = _issue_token_pair(db, user)
    return replacement_tokens


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(payload: RefreshTokenRequest, db: Session = Depends(get_db)):
    try:
        token_record = _get_refresh_token_record_or_401(db, payload.refresh_token)
    except HTTPException as exc:
        if exc.status_code == 401:
            return None
        raise
    _decode_refresh_token_or_401(payload.refresh_token)
    token_record.revoked_at = _utcnow()
    db.commit()
    return None


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserOut)
def update_me(
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    current_user.full_name = payload.full_name
    db.commit()
    db.refresh(current_user)
    return current_user
