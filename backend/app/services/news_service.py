"""NewsAPI.org 連携サービス"""
from __future__ import annotations
import time
from typing import Any

import httpx

from app.core.config import settings

# インメモリキャッシュ（30分）
_news_cache: dict[str, tuple[Any, float]] = {}


def _is_expired(ts: float) -> bool:
    return time.time() - ts > settings.news_cache_ttl_minutes * 60


class NewsService:
    BASE_URL = "https://newsapi.org/v2/everything"

    async def get_news(self, country_code: str, country_name: str) -> dict:
        """国名でニュースを取得する。APIキー未設定時は空リストを返す。"""
        if not settings.news_api_key:
            return {
                "country_code": country_code.upper(),
                "articles": [],
                "total": 0,
            }

        cache_key = f"news_{country_code.upper()}"
        if cache_key in _news_cache:
            data, ts = _news_cache[cache_key]
            if not _is_expired(ts):
                return data

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(
                    self.BASE_URL,
                    params={
                        "q": country_name,
                        "language": "en",
                        "pageSize": 10,
                        "sortBy": "publishedAt",
                        "apiKey": settings.news_api_key,
                    },
                )
                resp.raise_for_status()
                raw = resp.json()

            articles = []
            for article in raw.get("articles", []):
                articles.append({
                    "title": article.get("title", ""),
                    "description": article.get("description"),
                    "url": article.get("url", ""),
                    "source": article.get("source", {}).get("name", ""),
                    "published_at": article.get("publishedAt"),
                })

            result = {
                "country_code": country_code.upper(),
                "articles": articles,
                "total": len(articles),
            }
            _news_cache[cache_key] = (result, time.time())
            return result
        except Exception:
            return {
                "country_code": country_code.upper(),
                "articles": [],
                "total": 0,
            }
