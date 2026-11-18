from fastapi import APIRouter
from app.api.routes_aqi import router as aqi_router
from app.api.routes_chat import router as chat_router
from app.api.routes_profiles import router as profiles_router
from app.api.routes_recommendations import router as recommendations_router
from app.api.routes_sustainability import router as sustainability_router

api_router = APIRouter(prefix="/api")

api_router.include_router(aqi_router)
api_router.include_router(recommendations_router)
api_router.include_router(profiles_router)
api_router.include_router(sustainability_router)
api_router.include_router(chat_router)
