"""Wikipedia API を使った国概要サービス（キー不要）"""
from __future__ import annotations
import time
from typing import Any

from app.core.http_client import get_http_client

_cache: dict[str, tuple[Any, float]] = {}
_TTL = 7 * 24 * 3600  # 7日間


class WikipediaService:
    JA_API = "https://ja.wikipedia.org/w/api.php"
    EN_API = "https://en.wikipedia.org/w/api.php"

    async def get_summary(self, country_code: str, name_ja: str, name_en: str) -> dict:
        cache_key = f"wiki_{country_code}"
        if cache_key in _cache:
            data, ts = _cache[cache_key]
            if time.time() - ts < _TTL:
                return data

        result = await self._fetch(country_code, name_ja, self.JA_API)
        if not result["available"]:
            result = await self._fetch(country_code, name_en, self.EN_API)

        _cache[cache_key] = (result, time.time())
        return result

    async def _fetch(self, country_code: str, title: str, api_url: str) -> dict:
        params = {
            "action": "query",
            "titles": title,
            "prop": "extracts",
            "exintro": 1,
            "explaintext": 1,
            "exchars": 600,
            "format": "json",
            "redirects": 1,
        }
        headers = {"User-Agent": "KantaTravelApp/1.0 (educational travel info app)"}
        try:
            client = get_http_client()
            resp = await client.get(api_url, params=params, headers=headers)
            data = resp.json()

            pages = data.get("query", {}).get("pages", {})
            page = next(iter(pages.values()), {})
            if page.get("pageid") == -1 or not page.get("extract"):
                return {"country_code": country_code, "title": title, "summary": "", "url": None, "available": False}

            extract: str = page["extract"].strip()
            resolved_title: str = page.get("title", title)
            lang = "ja" if api_url == self.JA_API else "en"
            wiki_url = f"https://{lang}.wikipedia.org/wiki/{resolved_title.replace(' ', '_')}"
            return {
                "country_code": country_code,
                "title": resolved_title,
                "summary": extract,
                "url": wiki_url,
                "available": True,
            }
        except Exception:
            return {"country_code": country_code, "title": title, "summary": "", "url": None, "available": False}
