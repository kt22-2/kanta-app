"""US State Department 渡航情報サービス"""
from __future__ import annotations
import time
from typing import Any

import httpx

# インメモリキャッシュ（6時間）
_state_cache: dict[str, tuple[Any, float]] = {}
_STATE_CACHE_TTL_HOURS = 6

DATA_URL = "https://travel.state.gov/content/dam/travelData/TravelAdvisoryLatestCountry-en.json"


def _is_expired(ts: float) -> bool:
    return time.time() - ts > _STATE_CACHE_TTL_HOURS * 3600


class StateDeptService:
    async def get_advisory(self, country_code: str) -> dict:
        """国コードで渡航勧告情報を取得する。"""
        code = country_code.upper()
        cache_key = f"state_{code}"
        if cache_key in _state_cache:
            data, ts = _state_cache[cache_key]
            if not _is_expired(ts):
                return data

        try:
            advisories = await self._fetch_all()
            # 国コードで検索
            for advisory in advisories:
                iso_code = advisory.get("ISO_Code", "").upper()
                if iso_code == code:
                    level_str = advisory.get("Advisory_Level", "")
                    # "Level 1 - Exercise Normal Precautions" のようなフォーマット
                    level = 0
                    message = level_str
                    if "Level" in level_str:
                        try:
                            level = int(level_str.split(" ")[1])
                        except (IndexError, ValueError):
                            pass
                        parts = level_str.split(" - ", 1)
                        if len(parts) > 1:
                            message = parts[1]

                    result = {"level": level, "message": message}
                    _state_cache[cache_key] = (result, time.time())
                    return result

            result = {"level": 0, "message": "情報なし"}
            _state_cache[cache_key] = (result, time.time())
            return result
        except Exception:
            return {"level": 0, "message": "情報取得失敗"}

    async def _fetch_all(self) -> list[dict]:
        """全渡航勧告データを取得する"""
        cache_key = "_all_advisories"
        if cache_key in _state_cache:
            data, ts = _state_cache[cache_key]
            if not _is_expired(ts):
                return data

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(DATA_URL)
            resp.raise_for_status()
            raw = resp.json()

        advisories = raw if isinstance(raw, list) else raw.get("data", [])
        _state_cache[cache_key] = (advisories, time.time())
        return advisories
