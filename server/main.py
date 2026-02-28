import logging
from contextlib import asynccontextmanager
from typing import Any

import redis.asyncio as redis
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text

from config import engine, settings

logging.basicConfig(
    level=getattr(logging, settings.log_level.upper()),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    logger.info(f"Starting {settings.app_name} in {settings.app_env} mode")
    yield
    logger.info(f"Shutting down {settings.app_name}")
    await engine.dispose()


app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    debug=settings.debug,
    lifespan=lifespan,
    docs_url="/docs" if settings.is_development else None,
    redoc_url="/redoc" if settings.is_development else None,
)

# CORS configuration - add before routes
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


@app.get("/", tags=["root"])
async def root() -> dict[str, str]:
    """Root endpoint."""
    return {"message": f"Welcome to {settings.app_name} API", "status": "running"}


@app.get("/health", tags=["health"])
async def health_check() -> dict[str, str]:
    """Basic health check endpoint."""
    return {"status": "healthy"}


@app.get("/health/ready", tags=["health"])
async def readiness_check() -> JSONResponse:
    """
    Readiness check - verifies all dependencies are available.
    Returns 200 if ready, 503 if not ready.
    """
    checks: dict[str, Any] = {
        "database": False,
        "redis": False,
    }
    all_healthy = True

    # Check database
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        checks["database"] = True
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        all_healthy = False

    # Check Redis
    try:
        redis_client = redis.from_url(settings.redis_dsn)
        await redis_client.ping()
        await redis_client.close()
        checks["redis"] = True
    except Exception as e:
        logger.error(f"Redis health check failed: {e}")
        all_healthy = False

    status_code = status.HTTP_200_OK if all_healthy else status.HTTP_503_SERVICE_UNAVAILABLE

    return JSONResponse(
        status_code=status_code,
        content={
            "status": "ready" if all_healthy else "not_ready",
            "checks": checks,
        },
    )


@app.get("/health/live", tags=["health"])
async def liveness_check() -> dict[str, str]:
    """
    Liveness check - verifies the application process is running.
    This should always return 200 if the app is alive.
    """
    return {"status": "alive"}


# Include API routers AFTER middleware
from api import api_router

app.include_router(api_router, prefix="/api/v1")
