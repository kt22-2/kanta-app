import asyncio
import time
from typing import Any

from fastapi import APIRouter, HTTPException, Query
from app.models.schemas import (
    Country,
    ExchangeInfo,
    WikiSummary,
    ClimateInfo,
    EconomicInfo,
)
from app.services.restcountries import RestCountriesService
from app.services.mofa_service import MofaSafetyService
from app.services.exchange_service import ExchangeService
from app.services.wikipedia_service import WikipediaService
from app.services.climate_service import ClimateService
from app.services.worldbank_service import WorldBankService

router = APIRouter(prefix="/api/countries", tags=["countries"])
_svc = RestCountriesService()
_mofa_svc = MofaSafetyService()
_exchange_svc = ExchangeService()
_wiki_svc = WikipediaService()
_climate_svc = ClimateService()
_wb_svc = WorldBankService()

# safety_level キャッシュ（国コード → level）: MOFA 一括取得結果を保持
_safety_cache: dict[str, int | None] = {}
_safety_cache_ts: float = 0.0
_SAFETY_CACHE_TTL = 6 * 3600  # 6時間
_safety_task: asyncio.Task | None = None  # バックグラウンドタスク
_safety_lock = asyncio.Lock()  # 重複起動防止


async def _warm_safety_cache(codes: list[str]) -> None:
    """全国の安全レベルをバックグラウンドで取得してキャッシュする"""
    global _safety_cache, _safety_cache_ts
    sem = asyncio.Semaphore(20)

    async def _fetch(code: str) -> tuple[str, int | None]:
        async with sem:
            try:
                info = await _mofa_svc.get_safety_info(code)
                return code, info.get("level")
            except Exception:
                return code, None

    results = await asyncio.gather(*[_fetch(c) for c in codes])
    _safety_cache = dict(results)
    _safety_cache_ts = time.time()


@router.get("", response_model=list[Country])
async def list_countries(
    q: str | None = Query(None, description="国名またはコードで検索"),
    region: str | None = Query(None, description="地域フィルタ"),
    safety_level: int | None = Query(None, description="危険度フィルタ (0-4)", ge=0, le=4),
):
    global _safety_task, _safety_cache_ts

    countries = await _svc.get_all_countries(query=q, region=region)

    # キャッシュが有効なら即座に付与
    if _safety_cache and time.time() - _safety_cache_ts < _SAFETY_CACHE_TTL:
        for c in countries:
            c["safety_level"] = _safety_cache.get(c["code"])
    else:
        # キャッシュなし/期限切れ: バックグラウンドで更新開始し、今は safety_level なしで返す
        async with _safety_lock:
            if _safety_task is None or _safety_task.done():
                all_codes = [c["code"] for c in await _svc.get_all_countries()]
                _safety_task = asyncio.create_task(_warm_safety_cache(all_codes))
        # キャッシュに一部データがある場合はそれを使う
        for c in countries:
            c["safety_level"] = _safety_cache.get(c["code"])

    # 危険度フィルタを適用
    if safety_level is not None:
        countries = [c for c in countries if c.get("safety_level") == safety_level]

    return countries


@router.get("/{code}", response_model=Country)
async def get_country(code: str):
    country = await _svc.get_country(code)
    if country is None:
        raise HTTPException(status_code=404, detail=f"国コード '{code}' は見つかりませんでした")
    try:
        info = await _mofa_svc.get_safety_info(code)
        country["safety_level"] = info.get("level")
    except Exception:
        country["safety_level"] = None
    return country


@router.get("/{code}/exchange", response_model=ExchangeInfo)
async def get_exchange(code: str):
    country = await _svc.get_country(code)
    if country is None:
        raise HTTPException(status_code=404, detail=f"国コード '{code}' は見つかりませんでした")
    currency_codes = [c["code"] for c in country.get("currencies", [])]
    return await _exchange_svc.get_exchange_info(code, currency_codes)


@router.get("/{code}/wiki", response_model=WikiSummary)
async def get_wiki(code: str):
    country = await _svc.get_country(code)
    if country is None:
        raise HTTPException(status_code=404, detail=f"国コード '{code}' は見つかりませんでした")
    name_ja = country.get("name_ja") or country["name"]
    name_en = country["name"]
    return await _wiki_svc.get_summary(code, name_ja, name_en)


@router.get("/{code}/climate", response_model=ClimateInfo)
async def get_climate(code: str):
    country = await _svc.get_country(code)
    if country is None:
        raise HTTPException(status_code=404, detail=f"国コード '{code}' は見つかりませんでした")
    lat = country.get("latitude")
    lon = country.get("longitude")
    return await _climate_svc.get_climate(code, lat, lon)


@router.get("/{code}/economic", response_model=EconomicInfo)
async def get_economic(code: str):
    country = await _svc.get_country(code)
    if country is None:
        raise HTTPException(status_code=404, detail=f"国コード '{code}' は見つかりませんでした")
    return await _wb_svc.get_economic_info(code)
