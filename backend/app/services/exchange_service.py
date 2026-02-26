"""Frankfurter API を使った為替レートサービス（キー不要）"""
from __future__ import annotations
import time
from typing import Any

from app.core.http_client import get_http_client

_cache: dict[str, tuple[Any, float]] = {}
_TTL = 3600  # 1時間


class ExchangeService:
    BASE_URL = "https://api.frankfurter.app"

    async def get_exchange_info(self, country_code: str, currency_codes: list[str]) -> dict:
        if not currency_codes:
            return {"country_code": country_code, "base": "JPY", "rates": [], "date": None, "available": False}

        # JPYが対象通貨の場合は逆方向（1 USD → X JPY）で表示
        non_jpy = [c for c in currency_codes if c != "JPY"]
        if not non_jpy:
            return await self._fetch_reverse_jpy(country_code)

        cache_key = f"exchange_{','.join(sorted(non_jpy))}"
        if cache_key in _cache:
            data, ts = _cache[cache_key]
            if time.time() - ts < _TTL:
                return {**data, "country_code": country_code}

        symbols = ",".join(non_jpy)
        try:
            client = get_http_client()
            resp = await client.get(
                f"{self.BASE_URL}/latest",
                params={"base": "JPY", "symbols": symbols},
            )
            resp.raise_for_status()
            raw = resp.json()
        except Exception:
            return {"country_code": country_code, "base": "JPY", "rates": [], "date": None, "available": False}

        rates = [{"currency_code": k, "rate": v} for k, v in raw.get("rates", {}).items()]
        result = {
            "country_code": country_code,
            "base": "JPY",
            "rates": rates,
            "date": raw.get("date"),
            "available": bool(rates),
        }
        _cache[cache_key] = (result, time.time())
        return result

    async def _fetch_reverse_jpy(self, country_code: str) -> dict:
        """JPYが国の通貨の場合: 1 USD → X JPY で表示"""
        cache_key = "exchange_USD_to_JPY"
        if cache_key in _cache:
            data, ts = _cache[cache_key]
            if time.time() - ts < _TTL:
                return {**data, "country_code": country_code}
        try:
            client = get_http_client()
            resp = await client.get(
                f"{self.BASE_URL}/latest",
                params={"base": "USD", "symbols": "JPY"},
            )
            resp.raise_for_status()
            raw = resp.json()
            jpy_rate = raw.get("rates", {}).get("JPY")
            if jpy_rate is None:
                return {"country_code": country_code, "base": "USD", "rates": [], "date": None, "available": False}
            result = {
                "country_code": country_code,
                "base": "USD",
                "rates": [{"currency_code": "JPY", "rate": jpy_rate}],
                "date": raw.get("date"),
                "available": True,
            }
            _cache[cache_key] = (result, time.time())
            return result
        except Exception:
            return {"country_code": country_code, "base": "USD", "rates": [], "date": None, "available": False}
