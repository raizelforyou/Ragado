from datetime import datetime, timedelta
from typing import Optional
import secrets

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from config.settings import settings
from config.database import get_db
from models.models import AdminUser, RefreshToken

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds until access token expires


class RefreshRequest(BaseModel):
    refresh_token: str


class TokenData(BaseModel):
    email: Optional[str] = None
    token_type: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AdminUserResponse(BaseModel):
    id: int
    email: str
    name: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.jwt_access_token_expire_minutes)
    to_encode.update({
        "exp": expire,
        "type": "access"
    })
    encoded_jwt = jwt.encode(to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)
    return encoded_jwt


def create_refresh_token_string() -> str:
    """Generate a secure random refresh token string."""
    return secrets.token_urlsafe(64)


async def create_refresh_token(db: AsyncSession, admin_id: int) -> str:
    """Create and store a refresh token in the database."""
    token_string = create_refresh_token_string()
    expires_at = datetime.utcnow() + timedelta(days=settings.jwt_refresh_token_expire_days)

    refresh_token = RefreshToken(
        token=token_string,
        admin_id=admin_id,
        expires_at=expires_at,
        is_revoked=False
    )
    db.add(refresh_token)
    await db.commit()

    return token_string


async def verify_refresh_token(db: AsyncSession, token: str) -> Optional[RefreshToken]:
    """Verify a refresh token and return it if valid."""
    result = await db.execute(
        select(RefreshToken).where(
            RefreshToken.token == token,
            RefreshToken.is_revoked == False,
            RefreshToken.expires_at > datetime.utcnow()
        )
    )
    return result.scalar_one_or_none()


async def revoke_refresh_token(db: AsyncSession, token: str) -> None:
    """Revoke a specific refresh token."""
    result = await db.execute(
        select(RefreshToken).where(RefreshToken.token == token)
    )
    refresh_token = result.scalar_one_or_none()
    if refresh_token:
        refresh_token.is_revoked = True
        await db.commit()


async def revoke_all_refresh_tokens(db: AsyncSession, admin_id: int) -> None:
    """Revoke all refresh tokens for an admin user."""
    await db.execute(
        delete(RefreshToken).where(RefreshToken.admin_id == admin_id)
    )
    await db.commit()


async def cleanup_expired_tokens(db: AsyncSession) -> None:
    """Remove expired refresh tokens from database."""
    await db.execute(
        delete(RefreshToken).where(RefreshToken.expires_at < datetime.utcnow())
    )
    await db.commit()


async def create_token_pair(db: AsyncSession, admin: AdminUser) -> TokenPair:
    """Create both access and refresh tokens for an admin user."""
    access_token = create_access_token(data={"sub": admin.email})
    refresh_token = await create_refresh_token(db, admin.id)

    return TokenPair(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.jwt_access_token_expire_minutes * 60
    )


async def get_admin_by_email(db: AsyncSession, email: str) -> Optional[AdminUser]:
    result = await db.execute(select(AdminUser).where(AdminUser.email == email))
    return result.scalar_one_or_none()


async def get_admin_by_id(db: AsyncSession, admin_id: int) -> Optional[AdminUser]:
    result = await db.execute(select(AdminUser).where(AdminUser.id == admin_id))
    return result.scalar_one_or_none()


async def authenticate_admin(db: AsyncSession, email: str, password: str) -> Optional[AdminUser]:
    admin = await get_admin_by_email(db, email)
    if not admin:
        return None
    if not verify_password(password, admin.password_hash):
        return None
    return admin


async def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> AdminUser:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        token = credentials.credentials
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        email: str = payload.get("sub")
        token_type: str = payload.get("type")

        if email is None:
            raise credentials_exception
        if token_type != "access":
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    admin = await get_admin_by_email(db, email)
    if admin is None:
        raise credentials_exception
    if not admin.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin account is disabled")
    return admin
