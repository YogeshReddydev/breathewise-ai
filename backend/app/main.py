import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.v1.aqi import router as aqi_router
from app.api.v1.recommendations import router as recs_router
from app.api.v1.family import router as family_router
from app.api.v1.consultation import router as consult_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - [%(levelname)s] - %(name)s - %(message)s"
)
logger = logging.getLogger("breathewise")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing BreatheWise AI Atmospheric Engine...")
    yield
    logger.info("Shutting down BreatheWise AI services.")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Intelligent Urban Air Quality Assistant & Family Environmental Health Platform",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers
API_V1_PREFIX = "/api/v1"
app.include_router(aqi_router, prefix=API_V1_PREFIX)
app.include_router(recs_router, prefix=API_V1_PREFIX)
app.include_router(family_router, prefix=API_V1_PREFIX)
app.include_router(consult_router, prefix=API_V1_PREFIX)


@app.get("/", tags=["Health"])
async def root():
    return {
        "status": "online",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs_url": "/docs",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "gemini_configured": bool(settings.GEMINI_API_KEY),
        "default_provider": settings.DEFAULT_AQI_PROVIDER,
    }
