"""OpenTripMap API 連携サービス"""
from __future__ import annotations
import time
from typing import Any

import httpx

from app.core.config import settings

_OTM_BASE = "https://api.opentripmap.com/0.1/en/places"

# インメモリキャッシュ
_otm_cache: dict[str, tuple[Any, float]] = {}


def _is_expired(ts: float) -> bool:
    return time.time() - ts > settings.cache_ttl_hours * 3600


class OpenTripMapService:
    async def get_attractions(
        self,
        country_code: str,
        latitude: float | None,
        longitude: float | None,
        limit: int = 10,
    ) -> list[dict]:
        """指定した国の観光スポットを取得する。APIキーがない場合や失敗時は空リストを返す。"""
        if not settings.otm_api_key:
            return []
        if latitude is None or longitude is None:
            return []

        cache_key = f"otm_{country_code.upper()}"
        if cache_key in _otm_cache:
            data, ts = _otm_cache[cache_key]
            if not _is_expired(ts):
                return data

        try:
            spots = await self._fetch_radius(latitude, longitude, limit)
            enriched = await self._enrich_spots(spots[:limit])
            _otm_cache[cache_key] = (enriched, time.time())
            return enriched
        except Exception:
            return []

    async def _fetch_radius(
        self, lat: float, lon: float, limit: int
    ) -> list[dict]:
        """国の中心付近の観光スポット一覧を取得する。"""
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(
                f"{_OTM_BASE}/radius",
                params={
                    "apikey": settings.otm_api_key,
                    "radius": 500000,  # 500km 半径
                    "lon": lon,
                    "lat": lat,
                    "kinds": "interesting_places",
                    "rate": "3",  # 重要度フィルタ（3=高評価のみ）
                    "format": "json",
                    "limit": limit * 2,  # 絞り込みのため多めに取得
                },
            )
            resp.raise_for_status()
            return resp.json()

    async def _enrich_spots(self, spots: list[dict]) -> list[dict]:
        """各スポットの詳細情報を取得してマッピングする。"""
        result = []
        async with httpx.AsyncClient(timeout=10.0) as client:
            for spot in spots:
                xid = spot.get("xid")
                if not xid:
                    continue
                name = spot.get("name", "").strip()
                if not name:
                    continue
                try:
                    detail_resp = await client.get(
                        f"{_OTM_BASE}/xid/{xid}",
                        params={"apikey": settings.otm_api_key},
                    )
                    detail_resp.raise_for_status()
                    detail = detail_resp.json()
                except Exception:
                    detail = {}

                point = spot.get("point", {})
                wikipedia_extracts = detail.get("wikipedia_extracts", {})
                description = wikipedia_extracts.get("text") or detail.get("info", {}).get("descr")
                kinds_str = detail.get("kinds", spot.get("kinds", ""))
                category = _map_kind(kinds_str)

                result.append({
                    "name": name,
                    "description": description[:200] if description else None,
                    "category": category,
                    "latitude": point.get("lat"),
                    "longitude": point.get("lon"),
                    "rating": spot.get("rate"),
                    "wikipedia_url": detail.get("wikipedia"),
                })

        return result


def _map_kind(kinds: str) -> str | None:
    """OpenTripMapのkindストリングをカテゴリ文字列にマッピングする。"""
    if not kinds:
        return None
    kinds_lower = kinds.lower()
    if "natural" in kinds_lower or "nature" in kinds_lower:
        return "自然"
    if "architecture" in kinds_lower or "historic" in kinds_lower or "castle" in kinds_lower:
        return "歴史"
    if "religion" in kinds_lower or "temple" in kinds_lower or "church" in kinds_lower:
        return "宗教"
    if "museum" in kinds_lower or "cultural" in kinds_lower or "art" in kinds_lower:
        return "文化"
    if "food" in kinds_lower or "restaurant" in kinds_lower:
        return "食"
    if "sport" in kinds_lower or "amusement" in kinds_lower:
        return "アドベンチャー"
    if "urban" in kinds_lower or "city" in kinds_lower:
        return "都市"
    if "world_heritage" in kinds_lower:
        return "世界遺産"
    return None
