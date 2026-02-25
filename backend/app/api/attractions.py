from fastapi import APIRouter, HTTPException
from app.models.schemas import EnrichedAttractionsResponse
from app.services.ai_service import AIService
from app.services.opentripmap_service import OpenTripMapService
from app.services.restcountries import RestCountriesService

router = APIRouter(prefix="/api/countries", tags=["attractions"])
_ai_svc = AIService()
_otm_svc = OpenTripMapService()
_country_svc = RestCountriesService()


@router.get("/{code}/attractions", response_model=EnrichedAttractionsResponse)
async def get_attractions(code: str):
    country = await _country_svc.get_country(code)
    if country is None:
        raise HTTPException(status_code=404, detail=f"国コード '{code}' は見つかりませんでした")

    # OpenTripMapから観光スポット取得（失敗時は空配列）
    otm_attractions: list[dict] = []
    try:
        coords = await _country_svc.get_coordinates(code)
        if coords:
            otm_attractions = await _otm_svc.get_attractions(
                lat=coords[0], lon=coords[1], country_code=country["code"]
            )
    except Exception:
        otm_attractions = []

    # Claude AIでsummary生成（失敗時は空配列）
    ai_data: dict = {}
    try:
        ai_data = await _ai_svc.generate_attractions(
            country_code=country["code"],
            country_name=country["name"],
        )
    except Exception:
        ai_data = {"attractions": [], "best_season": None, "travel_tips": []}

    return {
        "country_code": country["code"],
        "country_name": country["name"],
        "otm_attractions": otm_attractions,
        "ai_summary": ai_data.get("attractions", []),
        "best_season": ai_data.get("best_season"),
        "travel_tips": ai_data.get("travel_tips", []),
    }
