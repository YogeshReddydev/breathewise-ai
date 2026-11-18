import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse

from app.api.router import api_router
from app.core.config import get_settings
from app.core.security import InMemoryRateLimiter

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("breathewise")

# Initialize global rate limiters
# General endpoints: 120 requests/minute per client IP
general_limiter = InMemoryRateLimiter(max_requests=120, window_seconds=60)
# Chat / AI generation: 30 requests/minute per client IP
chat_limiter = InMemoryRateLimiter(max_requests=30, window_seconds=60)


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    logger.info(f"Starting {settings.APP_NAME} in {settings.ENVIRONMENT} mode")
    yield
    logger.info(f"Shutting down {settings.APP_NAME}")


app = FastAPI(
    title="BreatheWise AI - Urban Air Quality Assistant",
    description="Intelligent urban air quality and environmental health advisory API powered by Open-Meteo & Gemini AI",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

settings = get_settings()

# Setup CORS with explicit origin whitelist
cors_origins = settings.cors_origins_list if settings.cors_origins_list else ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=r"^https://.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


@app.middleware("http")
async def security_and_rate_limit_middleware(request: Request, call_next):
    # Payload size defense (1MB max payload)
    content_length = request.headers.get("content-length")
    if content_length:
        try:
            if int(content_length) > 1_048_576:
                return JSONResponse(
                    status_code=413,
                    content={"detail": "Request payload exceeds 1MB limit."},
                )
        except ValueError:
            pass

    client_ip = request.client.host if request.client else "unknown"
    path = request.url.path

    # Apply rate limiting for API requests (skip internal health checks)
    if path.startswith("/api/chat") and not chat_limiter.is_allowed(client_ip):
        return JSONResponse(
            status_code=429,
            content={"detail": "Too many AI assistant requests. Please wait a moment before sending another query."},
        )
    elif path.startswith("/api/") and not path.endswith("/health") and not general_limiter.is_allowed(client_ip):
        return JSONResponse(
            status_code=429,
            content={"detail": "Too many requests. Please throttle your queries."},
        )

    response = await call_next(request)

    # Attach OWASP secure HTTP headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(self), camera=(), microphone=()"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com data:; "
        "img-src 'self' data: https:; "
        "connect-src 'self' http://localhost:* http://127.0.0.1:* https://*.vercel.app https://air-quality-api.open-meteo.com;"
    )

    return response


# Mount API routes
app.include_router(api_router)


@app.get("/health", tags=["System"])
@app.get("/api/health", tags=["System"])
async def health_check():
    """Health check endpoint for container and deployment monitors."""
    return {
        "status": "healthy",
        "service": "BreatheWise AI Backend",
        "version": "0.1.0",
        "default_provider": settings.DEFAULT_AQI_PROVIDER,
        "gemini_active": bool(settings.GEMINI_API_KEY),
    }


@app.get("/docs", include_in_schema=False)
async def redirect_docs():
    return RedirectResponse(url="/api/docs")


@app.get("/redoc", include_in_schema=False)
async def redirect_redoc():
    return RedirectResponse(url="/api/redoc")


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error processing {request.method} {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal environmental processing error occurred. Please try again."},
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
