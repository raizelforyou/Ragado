from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from config.database import get_db
from api.auth import (
    TokenPair,
    RefreshRequest,
    LoginRequest,
    AdminUserResponse,
    authenticate_admin,
    create_token_pair,
    get_current_admin,
    get_password_hash,
    get_admin_by_email,
    get_admin_by_id,
    verify_refresh_token,
    revoke_refresh_token,
    revoke_all_refresh_tokens,
    create_access_token,
)
from models.models import AdminUser

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenPair)
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate admin user and return access + refresh tokens."""
    admin = await authenticate_admin(db, request.email, request.password)
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return await create_token_pair(db, admin)


@router.post("/refresh", response_model=TokenPair)
async def refresh_tokens(request: RefreshRequest, db: AsyncSession = Depends(get_db)):
    """Refresh access token using a valid refresh token."""
    # Verify the refresh token
    refresh_token = await verify_refresh_token(db, request.refresh_token)
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Get the admin user
    admin = await get_admin_by_id(db, refresh_token.admin_id)
    if not admin or not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )

    # Revoke the old refresh token (token rotation)
    await revoke_refresh_token(db, request.refresh_token)

    # Create new token pair
    return await create_token_pair(db, admin)


@router.post("/logout")
async def logout(
    request: RefreshRequest,
    db: AsyncSession = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    """Logout by revoking the refresh token."""
    await revoke_refresh_token(db, request.refresh_token)
    return {"message": "Successfully logged out"}


@router.post("/logout-all")
async def logout_all(
    db: AsyncSession = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    """Logout from all devices by revoking all refresh tokens."""
    await revoke_all_refresh_tokens(db, admin.id)
    return {"message": "Successfully logged out from all devices"}


@router.get("/me", response_model=AdminUserResponse)
async def get_current_user(admin: AdminUser = Depends(get_current_admin)):
    """Get current authenticated admin user."""
    return admin


@router.post("/seed", response_model=AdminUserResponse, status_code=status.HTTP_201_CREATED)
async def seed_admin(db: AsyncSession = Depends(get_db)):
    """Create a default admin user (for development only)."""
    existing = await get_admin_by_email(db, "admin@ragado.com")
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Admin user already exists"
        )

    admin = AdminUser(
        email="admin@ragado.com",
        password_hash=get_password_hash("admin123"),
        name="Admin User",
        is_active=True
    )
    db.add(admin)
    await db.commit()
    await db.refresh(admin)
    return admin
