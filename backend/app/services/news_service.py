"""GNews API + Google News RSS フォールバック ニュースサービス"""
from __future__ import annotations
import asyncio
import time
import xml.etree.ElementTree as ET
from typing import Any
from urllib.parse import quote

import httpx

from app.core.config import settings

# インメモリキャッシュ（30分）
_news_cache: dict[str, tuple[Any, float]] = {}

# 安全・治安・犯罪・情勢関連キーワード（クエリ絞り込み + 二次フィルタで使用）
_SAFETY_KEYWORDS_EN = [
    "crime", "murder", "robbery", "theft", "assault", "violence",
    "security", "danger", "warning", "alert", "travel advisory",
    "conflict", "war", "terrorism", "attack", "explosion",
    "protest", "riot", "unrest", "coup", "sanctions",
    "arrest", "gang", "drug", "kidnapping", "scam",
    "earthquake", "flood", "hurricane", "typhoon", "disaster",
]

_SAFETY_KEYWORDS_JA = [
    "犯罪", "殺人", "強盗", "窃盗", "暴行", "暴力",
    "治安", "危険", "警告", "注意喚起", "渡航情報",
    "紛争", "戦争", "テロ", "攻撃", "爆発",
    "デモ", "暴動", "クーデター", "制裁",
    "逮捕", "麻薬", "誘拐", "詐欺",
    "地震", "洪水", "台風", "ハリケーン", "災害",
]


def _is_expired(ts: float) -> bool:
    return time.time() - ts > settings.news_cache_ttl_minutes * 60


class NewsService:
    GNEWS_URL = "https://gnews.io/api/v4/search"
    RSS_URL = "https://news.google.com/rss/search"

    def _is_safety_related(self, title: str, description: str | None) -> bool:
        """タイトル・説明文に安全・治安・犯罪・情勢関連キーワードが含まれるか判定。"""
        text = (title + " " + (description or "")).lower()
        all_kws = [k.lower() for k in _SAFETY_KEYWORDS_EN + _SAFETY_KEYWORDS_JA]
        return any(kw in text for kw in all_kws)

    async def get_news(self, country_code: str, country_name: str, max_results: int = 10) -> dict:
        """国の治安・犯罪・情勢ニュースを取得する。GNews API → Google News RSS の順でフォールバック。"""
        cache_key = f"news_{country_code.upper()}"
        if cache_key in _news_cache:
            data, ts = _news_cache[cache_key]
            if not _is_expired(ts):
                return data

        articles: list[dict] = []

        # GNews API（APIキーあり）: 英語・日本語を並行取得してマージ
        if settings.gnews_api_key:
            try:
                en_articles, ja_articles = await asyncio.gather(
                    self._fetch_from_gnews(country_name, max_results, lang="en"),
                    self._fetch_from_gnews(country_name, max_results, lang="ja"),
                )
                seen: set[str] = set()
                merged: list[dict] = []
                for a in en_articles + ja_articles:
                    url = a.get("url", "")
                    if url and url not in seen:
                        seen.add(url)
                        merged.append(a)
                articles = merged[:max_results]
            except Exception:
                articles = []

        # Google News RSS フォールバック（APIキーなし or GNews失敗時）
        if not articles:
            try:
                articles = await self._fetch_from_google_rss(country_name, max_results)
            except Exception:
                articles = []

        # 二次フィルタ：治安・犯罪・情勢に無関係な記事を除外
        filtered = [
            a for a in articles
            if self._is_safety_related(a.get("title", ""), a.get("description"))
        ]
        # フィルタ後0件の場合はフォールバック（記事が表示されなくなるのを防ぐ）
        articles = filtered if filtered else articles

        result = {
            "country_code": country_code.upper(),
            "articles": articles,
            "total": len(articles),
        }
        _news_cache[cache_key] = (result, time.time())
        return result

    async def _fetch_from_gnews(self, country_name: str, max_results: int, lang: str = "en") -> list[dict]:
        """GNews API からニュースを取得する。安全キーワードでクエリを絞り込む。"""
        # クエリ例: "Japan" (crime OR security OR warning OR conflict OR attack OR terrorism OR ...)
        safety_terms = " OR ".join(_SAFETY_KEYWORDS_EN[:12])
        query = f'"{country_name}" ({safety_terms})'

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(
                self.GNEWS_URL,
                params={
                    "q": query,
                    "lang": lang,
                    "max": max_results,
                    "apikey": settings.gnews_api_key,
                },
            )
            resp.raise_for_status()
            raw = resp.json()

        articles = []
        for article in raw.get("articles", []):
            title = article.get("title", "")
            # GNews は "[removed]" というダミータイトルを返すことがある
            if not title or title == "[removed]":
                continue
            articles.append({
                "title": title,
                "description": article.get("description"),
                "url": article.get("url", ""),
                "source": article.get("source", {}).get("name", ""),
                "published_at": article.get("publishedAt"),
            })
        return articles

    async def _fetch_from_google_rss(self, country_name: str, max_results: int) -> list[dict]:
        """Google News RSS からニュースを取得する（APIキー不要）。安全キーワードでクエリを絞り込む。"""
        # クエリ例: "Japan" (crime OR security OR warning OR conflict OR attack OR terrorism OR violence OR danger)
        safety_q = " OR ".join(_SAFETY_KEYWORDS_EN[:8])
        query = quote(f'"{country_name}" ({safety_q})')
        url = f"{self.RSS_URL}?q={query}&hl=en&gl=US&ceid=US:en"

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(url, follow_redirects=True)
            resp.raise_for_status()

        root = ET.fromstring(resp.text)

        articles = []
        for item in root.findall(".//item")[:max_results]:
            title_el = item.find("title")
            link_el = item.find("link")
            source_el = item.find("source")
            pub_date_el = item.find("pubDate")
            desc_el = item.find("description")

            title = title_el.text if title_el is not None else ""
            if not title:
                continue

            articles.append({
                "title": title,
                "description": desc_el.text if desc_el is not None else None,
                "url": link_el.text if link_el is not None else "",
                "source": source_el.text if source_el is not None else "Google News",
                "published_at": pub_date_el.text if pub_date_el is not None else None,
            })

        return articles
