from fastapi import APIRouter
from app.models.schemas import SafetyInfo, EntryRequirement
from app.services.travel_advisory import TravelAdvisoryService

router = APIRouter(prefix="/api/countries", tags=["safety"])
_svc = TravelAdvisoryService()


@router.get("/{code}/safety", response_model=SafetyInfo)
async def get_safety_info(code: str):
    return _svc.get_safety_info(code)


@router.get("/{code}/entry", response_model=EntryRequirement)
async def get_entry_requirement(code: str):
    return _svc.get_entry_requirement(code)
