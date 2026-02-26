"""UNESCO 世界遺産サービス（Wikipedia Category API 利用・APIキー不要）"""
from __future__ import annotations
import time
from typing import Any

import httpx

from app.core.config import settings

# インメモリキャッシュ（24時間）
_heritage_cache: dict[str, tuple[Any, float]] = {}


def _is_expired(ts: float) -> bool:
    return time.time() - ts > settings.cache_ttl_hours * 3600


class HeritageService:
    WIKI_API = "https://en.wikipedia.org/w/api.php"
    _HEADERS = {"User-Agent": "kanta-app/1.0 (https://github.com/kanta-app)"}

    async def _get_category_members(
        self, category: str, client: httpx.AsyncClient
    ) -> list[str]:
        """Wikipedia カテゴリに属するページタイトルを取得する。"""
        resp = await client.get(
            self.WIKI_API,
            params={
                "action": "query",
                "list": "categorymembers",
                "cmtitle": f"Category:{category}",
                "cmlimit": "50",
                "cmtype": "page",
                "cmnamespace": "0",
                "format": "json",
            },
        )
        raw = resp.json()
        members = raw.get("query", {}).get("categorymembers", [])
        # "List of..." / "UNESCO..." のような非スポット記事を除外
        return [
            m["title"]
            for m in members
            if not m["title"].startswith(("List of", "UNESCO", "World Heritage"))
        ]

    async def _get_page_details(
        self, titles: list[str], client: httpx.AsyncClient
    ) -> list[dict]:
        """ページの座標・説明・URL を一括取得する。"""
        if not titles:
            return []

        titles_str = "|".join(titles[:50])
        resp = await client.get(
            self.WIKI_API,
            params={
                "action": "query",
                "titles": titles_str,
                "prop": "coordinates|description|info|pageimages",
                "inprop": "url",
                "pithumbsize": "400",
                "piprop": "thumbnail",
                "format": "json",
                "redirects": "1",
            },
        )
        raw = resp.json()
        pages = raw.get("query", {}).get("pages", {})

        results: list[dict] = []
        for page_id, page in pages.items():
            if page_id == "-1":
                continue
            title = page.get("title", "")
            if not title:
                continue
            coords = page.get("coordinates", [])
            lat = coords[0].get("lat") if coords else None
            lon = coords[0].get("lon") if coords else None
            desc = page.get("description") or None
            url = page.get("fullurl") or None
            thumbnail = page.get("thumbnail", {})
            image_url = thumbnail.get("source") or None

            results.append(
                {
                    "name": title,
                    "description": desc,
                    "registered_year": None,
                    "latitude": lat,
                    "longitude": lon,
                    "image_url": image_url,
                    "wikipedia_url": url,
                }
            )

        return results

    async def get_heritage_sites(
        self, country_code: str, country_name: str = ""
    ) -> list[dict]:
        """国コードと国名から Wikipedia を使い UNESCO 世界遺産一覧を取得する。"""
        iso = country_code.upper()
        cache_key = f"heritage_{iso}"
        if cache_key in _heritage_cache:
            data, ts = _heritage_cache[cache_key]
            if not _is_expired(ts):
                return data

        if not country_name:
            _heritage_cache[cache_key] = ([], time.time())
            return []

        # "the" が必要な国名を処理（United States, United Kingdom など）
        name = country_name
        candidates = [
            f"World Heritage Sites in {name}",
            f"World Heritage Sites in the {name}",
        ]

        try:
            async with httpx.AsyncClient(
                timeout=15.0, headers=self._HEADERS
            ) as client:
                titles: list[str] = []
                for cat in candidates:
                    titles = await self._get_category_members(cat, client)
                    if titles:
                        break

                if not titles:
                    _heritage_cache[cache_key] = ([], time.time())
                    return []

                sites = await self._get_page_details(titles, client)
                _heritage_cache[cache_key] = (sites, time.time())
                return sites

        except Exception:
            return []
