from fastapi import APIRouter

from api.routes import applications, auth

api_router = APIRouter()

api_router.include_router(
    auth.router,
    tags=["auth"],
)

api_router.include_router(
    applications.router,
    prefix="/applications",
    tags=["applications"],
)
