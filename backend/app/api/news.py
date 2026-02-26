from fastapi import APIRouter, HTTPException
from app.models.schemas import NewsResponse
from app.services.gnews import GNewsService
from app.services.restcountries import RestCountriesService

router = APIRouter(prefix="/api/countries", tags=["news"])
_gnews_svc = GNewsService()
_country_svc = RestCountriesService()


@router.get("/{code}/news", response_model=NewsResponse)
async def get_news(code: str):
    country = await _country_svc.get_country(code)
    if country is None:
        raise HTTPException(status_code=404, detail=f"国コード '{code}' は見つかりませんでした")
    return await _gnews_svc.get_news(
        country_code=country["code"],
        country_name=country["name"],
    )
