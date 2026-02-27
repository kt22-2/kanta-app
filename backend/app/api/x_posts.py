from fastapi import APIRouter
from app.models.schemas import XPost
from app.services.x_service import XService

router = APIRouter(prefix="/api/x", tags=["x"])
_x_svc = XService()


@router.get("/posts", response_model=list[XPost])
async def get_x_posts(username: str = "anta_kaoi", limit: int = 10):
    return await _x_svc.get_posts(username=username, limit=limit)
