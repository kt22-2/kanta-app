import asyncio

from fastapi import APIRouter, HTTPException
from app.models.schemas import EnrichedAttractionsResponse
from app.services.opentripmap_service import OpenTripMapService
from app.services.restcountries import RestCountriesService
from app.services.ai_service import AIService
from app.services.heritage_service import HeritageService

router = APIRouter(prefix="/api/countries", tags=["attractions"])
_otm_svc = OpenTripMapService()
_country_svc = RestCountriesService()
_ai_svc = AIService()
_heritage_svc = HeritageService()


@router.get("/{code}/attractions", response_model=EnrichedAttractionsResponse)
async def get_attractions(code: str):
    country = await _country_svc.get_country(code)
    if country is None:
        raise HTTPException(status_code=404, detail=f"国コード '{code}' は見つかりませんでした")

    async def _fetch_otm() -> list[dict]:
        try:
            coords = await _country_svc.get_coordinates(code)
            if coords:
                return await _otm_svc.get_attractions(
                    lat=coords[0], lon=coords[1], country_code=country["code"]
                )
        except Exception:
            pass
        return []

    async def _fetch_ai() -> dict:
        try:
            return await _ai_svc.generate_attractions(country["code"], country["name"])
        except Exception:
            return {"attractions": [], "best_season": None, "travel_tips": []}

    async def _fetch_heritage() -> list[dict]:
        try:
            return await _heritage_svc.get_heritage_sites(
                country["code"], country.get("name", "")
            )
        except Exception:
            return []

    otm_attractions, ai_data, heritage_sites = await asyncio.gather(
        _fetch_otm(), _fetch_ai(), _fetch_heritage()
    )

    return {
        "country_code": country["code"],
        "country_name": country["name"],
        "heritage_sites": heritage_sites,
        "otm_attractions": otm_attractions,
        "ai_summary": ai_data.get("attractions", []),
        "best_season": ai_data.get("best_season"),
        "travel_tips": ai_data.get("travel_tips", []),
    }
