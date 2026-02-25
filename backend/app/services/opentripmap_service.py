"""OpenTripMap API 連携サービス"""
from __future__ import annotations
import time
from typing import Any

import httpx

from app.core.config import settings

# インメモリキャッシュ（24時間）
_otm_cache: dict[str, tuple[Any, float]] = {}


def _is_expired(ts: float) -> bool:
    return time.time() - ts > settings.cache_ttl_hours * 3600


class OpenTripMapService:
    BASE_URL = "https://api.opentripmap.com/0.1/en"

    async def get_attractions(
        self, lat: float, lon: float, country_code: str
    ) -> list[dict]:
        """座標周辺の観光スポットを取得する。APIキー未設定時は空リストを返す。"""
        if not settings.opentripmap_api_key:
            return []

        cache_key = f"otm_{country_code.upper()}"
        if cache_key in _otm_cache:
            data, ts = _otm_cache[cache_key]
            if not _is_expired(ts):
                return data

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(
                    f"{self.BASE_URL}/places/radius",
                    params={
                        "radius": 50000,
                        "lon": lon,
                        "lat": lat,
                        "kinds": "cultural,natural,architecture",
                        "format": "json",
                        "limit": 10,
                        "apikey": settings.opentripmap_api_key,
                    },
                )
                resp.raise_for_status()
                raw_places = resp.json()

            attractions = []
            for place in raw_places:
                attractions.append({
                    "name": place.get("name", ""),
                    "description": place.get("wikipedia_extracts", {}).get("text") if isinstance(place.get("wikipedia_extracts"), dict) else None,
                    "category": place.get("kinds", "").split(",")[0] if place.get("kinds") else None,
                    "latitude": place.get("point", {}).get("lat"),
                    "longitude": place.get("point", {}).get("lon"),
                    "rating": place.get("rate"),
                    "wikipedia_url": place.get("wikipedia"),
                })

            _otm_cache[cache_key] = (attractions, time.time())
            return attractions
        except Exception:
            return []
