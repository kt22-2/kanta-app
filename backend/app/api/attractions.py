from fastapi import APIRouter, HTTPException
from app.models.schemas import EnrichedAttractionsResponse
from app.services.ai_service import AIService
from app.services.opentripmap import OpenTripMapService
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

    ai_data, otm_spots = await _fetch_both(country)

    return {
        "country_code": country["code"],
        "country_name": country["name"],
        "otm_attractions": otm_spots,
        "ai_summary": ai_data.get("ai_summary", []),
        "best_season": ai_data.get("best_season"),
        "travel_tips": ai_data.get("travel_tips", []),
    }


async def _fetch_both(country: dict) -> tuple[dict, list[dict]]:
    """AI観光情報とOTM観光スポットを並行取得する。"""
    import asyncio
    ai_task = asyncio.create_task(
        _ai_svc.generate_attractions(
            country_code=country["code"],
            country_name=country["name"],
        )
    )
    otm_task = asyncio.create_task(
        _otm_svc.get_attractions(
            country_code=country["code"],
            latitude=country.get("latitude"),
            longitude=country.get("longitude"),
        )
    )
    ai_data, otm_spots = await asyncio.gather(ai_task, otm_task)
    return ai_data, otm_spots
