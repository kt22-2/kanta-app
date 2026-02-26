"""World Bank API を使った経済指標サービス（キー不要）"""
from __future__ import annotations
import time
from typing import Any

import httpx

_cache: dict[str, tuple[Any, float]] = {}
_TTL = 7 * 24 * 3600  # 7日間


class WorldBankService:
    BASE_URL = "https://api.worldbank.org/v2/country"

    async def get_economic_info(self, country_code: str) -> dict:
        cache_key = f"wb_{country_code}"
        if cache_key in _cache:
            data, ts = _cache[cache_key]
            if time.time() - ts < _TTL:
                return data

        indicator = "NY.GDP.PCAP.CD"  # 一人当たりGDP（USD）
        url = f"{self.BASE_URL}/{country_code}/indicator/{indicator}"
        params = {"format": "json", "mrv": 5, "per_page": 5}

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(url, params=params)
                resp.raise_for_status()
                raw = resp.json()
        except Exception:
            return {"country_code": country_code, "gdp_per_capita": None, "gdp_year": None, "available": False}

        # World Bank は [metadata, data] の配列を返す
        if not isinstance(raw, list) or len(raw) < 2:
            return {"country_code": country_code, "gdp_per_capita": None, "gdp_year": None, "available": False}

        entries = raw[1] or []
        # 最新の非Nullエントリを探す
        gdp_value = None
        gdp_year = None
        for entry in entries:
            if entry.get("value") is not None:
                gdp_value = entry["value"]
                gdp_year = int(entry["date"]) if entry.get("date") else None
                break

        result = {
            "country_code": country_code,
            "gdp_per_capita": gdp_value,
            "gdp_year": gdp_year,
            "available": gdp_value is not None,
        }
        _cache[cache_key] = (result, time.time())
        return result
