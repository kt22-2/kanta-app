"""ニュース取得サービス（Google News RSS 利用、APIキー不要）"""
from __future__ import annotations
import re
import time
import xml.etree.ElementTree as ET
from typing import Any

from app.core.config import settings
from app.core.http_client import get_http_client

_GNEWS_BASE = "https://gnews.io/api/v4"
_GOOGLE_NEWS_RSS = "https://news.google.com/rss/search"

# インメモリキャッシュ（ニュースは1時間で更新）
_news_cache: dict[str, tuple[Any, float]] = {}
_NEWS_CACHE_TTL_HOURS = 1


def _is_expired(ts: float) -> bool:
    return time.time() - ts > _NEWS_CACHE_TTL_HOURS * 3600


class GNewsService:
    async def get_news(self, country_code: str, country_name: str, max_results: int = 10) -> dict:
        """国のニュースを取得する。GNews APIキーがあればそちらを優先、なければGoogle News RSSを使用。"""
        cache_key = country_code.upper()
        if cache_key in _news_cache:
            data, ts = _news_cache[cache_key]
            if not _is_expired(ts):
                return data

        if settings.gnews_api_key:
            articles = await self._fetch_from_gnews(country_name, max_results)
        else:
            articles = await self._fetch_from_google_rss(country_code, country_name, max_results)

        result = {
            "country_code": country_code.upper(),
            "articles": articles,
            "total": len(articles),
        }
        _news_cache[cache_key] = (result, time.time())
        return result

    async def _fetch_from_gnews(self, country_name: str, max_results: int) -> list[dict]:
        """GNews APIからニュース記事を取得する。"""
        for lang in ("ja", "en"):
            try:
                client = get_http_client()
                resp = await client.get(
                    f"{_GNEWS_BASE}/search",
                    params={
                        "q": country_name,
                        "lang": lang,
                        "max": min(max_results, 10),
                        "apikey": settings.gnews_api_key,
                        "sortby": "publishedAt",
                    },
                )
                if resp.status_code == 403:
                    break
                resp.raise_for_status()
                data = resp.json()
                raw_articles = data.get("articles", [])
                if raw_articles:
                    return [_parse_gnews_article(a) for a in raw_articles]
            except Exception:
                continue
        return []

    async def _fetch_from_google_rss(
        self, country_code: str, country_name: str, max_results: int
    ) -> list[dict]:
        """Google News RSSからニュースを取得する（APIキー不要）。"""
        articles: list[dict] = []

        # 日本語ニュースを試みる（国コードに基づいて言語を設定）
        query_sets = [
            (country_name, "ja", "JP"),  # 日本語
            (country_name, "en", "US"),  # 英語
        ]

        for query, hl_lang, gl_country in query_sets:
            try:
                fetched = await self._fetch_rss(query, hl_lang, gl_country, max_results)
                if fetched:
                    articles = fetched
                    break
            except Exception:
                continue

        return articles[:max_results]

    async def _fetch_rss(
        self, query: str, hl: str, gl: str, limit: int
    ) -> list[dict]:
        ceid = f"{gl}:{hl}"
        client = get_http_client()
        resp = await client.get(
            _GOOGLE_NEWS_RSS,
            params={"q": query, "hl": hl, "gl": gl, "ceid": ceid},
            headers={"User-Agent": "Mozilla/5.0 (compatible; TravelApp/1.0)"},
        )
        resp.raise_for_status()
        return _parse_rss(resp.text, limit)


def _parse_rss(xml_text: str, limit: int) -> list[dict]:
    """Google News RSS XMLを解析して記事リストに変換する。"""
    try:
        root = ET.fromstring(xml_text)
    except ET.ParseError:
        return []

    channel = root.find("channel")
    if channel is None:
        return []

    articles = []
    for item in channel.findall("item")[:limit]:
        title_el = item.find("title")
        link_el = item.find("link")
        desc_el = item.find("description")
        pub_el = item.find("pubDate")
        source_el = item.find("source")

        title = title_el.text if title_el is not None else ""
        if not title:
            continue

        # Google News RSSの title には "記事タイトル - メディア名" 形式が多い
        source_from_title = ""
        if " - " in title:
            parts = title.rsplit(" - ", 1)
            title = parts[0].strip()
            source_from_title = parts[1].strip()

        source = (
            source_el.text if source_el is not None and source_el.text
            else source_from_title or "Google News"
        )

        description = None
        if desc_el is not None and desc_el.text:
            # HTMLタグを除去
            description = re.sub(r"<[^>]+>", "", desc_el.text).strip()
            if not description:
                description = None

        articles.append({
            "title": title,
            "description": description,
            "url": link_el.text if link_el is not None else "",
            "source": source,
            "published_at": pub_el.text if pub_el is not None else None,
        })

    return articles


def _parse_gnews_article(raw: dict) -> dict:
    source = raw.get("source", {})
    return {
        "title": raw.get("title", ""),
        "description": raw.get("description"),
        "url": raw.get("url", ""),
        "source": source.get("name", "") if isinstance(source, dict) else str(source),
        "published_at": raw.get("publishedAt"),
    }
