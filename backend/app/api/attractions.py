from fastapi import APIRouter, HTTPException
from app.models.schemas import AttractionsResponse
from app.services.ai_service import AIService
from app.services.restcountries import RestCountriesService

router = APIRouter(prefix="/api/countries", tags=["attractions"])
_ai_svc = AIService()
_country_svc = RestCountriesService()


@router.get("/{code}/attractions", response_model=AttractionsResponse)
async def get_attractions(code: str):
    country = await _country_svc.get_country(code)
    if country is None:
        raise HTTPException(status_code=404, detail=f"国コード '{code}' は見つかりませんでした")
    return await _ai_svc.generate_attractions(
        country_code=country["code"],
        country_name=country["name"],
    )
