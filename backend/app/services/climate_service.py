"""Open-Meteo Archive API を使った気候情報サービス（キー不要）
daily データを取得して月次集計する。
"""
from __future__ import annotations
import time
from typing import Any

import httpx

_cache: dict[str, tuple[Any, float]] = {}
_TTL = 30 * 24 * 3600  # 30日間（年間データは不変）


def _monthly_aggregate(times: list[str], values: list[float | None], agg: str) -> dict[int, float | None]:
    """日次データを月ごとに集計する。agg: 'avg' or 'sum'"""
    buckets: dict[int, list[float]] = {m: [] for m in range(1, 13)}
    for t, v in zip(times, values):
        if v is not None:
            month = int(t.split("-")[1])
            buckets[month].append(v)
    result: dict[int, float | None] = {}
    for m, vals in buckets.items():
        if not vals:
            result[m] = None
        elif agg == "sum":
            result[m] = round(sum(vals), 1)
        else:
            result[m] = round(sum(vals) / len(vals), 1)
    return result


class ClimateService:
    BASE_URL = "https://archive-api.open-meteo.com/v1/archive"

    async def get_climate(self, country_code: str, lat: float | None, lon: float | None) -> dict:
        if lat is None or lon is None:
            return {"country_code": country_code, "monthly": [], "available": False}

        cache_key = f"climate_{country_code}"
        if cache_key in _cache:
            data, ts = _cache[cache_key]
            if time.time() - ts < _TTL:
                return data

        params = {
            "latitude": lat,
            "longitude": lon,
            "start_date": "2023-01-01",
            "end_date": "2023-12-31",
            "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum",
            "timezone": "auto",
        }
        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                resp = await client.get(self.BASE_URL, params=params)
                resp.raise_for_status()
                raw = resp.json()
        except Exception:
            return {"country_code": country_code, "monthly": [], "available": False}

        if raw.get("error"):
            return {"country_code": country_code, "monthly": [], "available": False}

        daily = raw.get("daily", {})
        times: list[str] = daily.get("time", [])
        temp_max_daily: list[float | None] = daily.get("temperature_2m_max", [])
        temp_min_daily: list[float | None] = daily.get("temperature_2m_min", [])
        precip_daily: list[float | None] = daily.get("precipitation_sum", [])

        if not times:
            return {"country_code": country_code, "monthly": [], "available": False}

        max_by_month = _monthly_aggregate(times, temp_max_daily, "avg")
        min_by_month = _monthly_aggregate(times, temp_min_daily, "avg")
        precip_by_month = _monthly_aggregate(times, precip_daily, "sum")

        monthly = [
            {
                "month": m,
                "temp_max": max_by_month[m],
                "temp_min": min_by_month[m],
                "precipitation": precip_by_month[m],
            }
            for m in range(1, 13)
        ]

        result = {"country_code": country_code, "monthly": monthly, "available": True}
        _cache[cache_key] = (result, time.time())
        return result
