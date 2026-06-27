from fastapi import APIRouter
from backend.app.api.endpoints import auth, assessment, reports, dashboard, analytics, map, recommendations

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(assessment.router, prefix="/assessment", tags=["assessment"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(map.router, prefix="/map", tags=["map"])
api_router.include_router(recommendations.router, prefix="/recommendations", tags=["recommendations"])
