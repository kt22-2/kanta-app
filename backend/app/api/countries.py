from fastapi import APIRouter, HTTPException, Query
from app.models.schemas import Country
from app.services.restcountries import RestCountriesService

router = APIRouter(prefix="/api/countries", tags=["countries"])
_svc = RestCountriesService()


@router.get("", response_model=list[Country])
async def list_countries(
    q: str | None = Query(None, description="国名またはコードで検索"),
    region: str | None = Query(None, description="地域フィルタ"),
):
    return await _svc.get_all_countries(query=q, region=region)


@router.get("/{code}", response_model=Country)
async def get_country(code: str):
    country = await _svc.get_country(code)
    if country is None:
        raise HTTPException(status_code=404, detail=f"国コード '{code}' は見つかりませんでした")
    return country
