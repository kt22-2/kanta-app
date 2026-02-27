"""X（Twitter）API v2 を使った投稿取得サービス"""
from __future__ import annotations
import os
import time
from typing import Any

from app.core.http_client import get_http_client

_cache: dict[str, tuple[Any, float]] = {}
_TTL = 1800  # 30分


class XService:
    BASE_URL = "https://api.twitter.com/2"

    async def get_posts(self, username: str, limit: int = 10) -> list[dict]:
        bearer_token = os.environ.get("X_BEARER_TOKEN", "")
        if not bearer_token:
            return []

        cache_key = f"x_posts_{username}_{limit}"
        if cache_key in _cache:
            data, ts = _cache[cache_key]
            if time.time() - ts < _TTL:
                return data

        try:
            client = get_http_client()
            headers = {"Authorization": f"Bearer {bearer_token}"}

            # まずユーザーIDを取得
            user_resp = await client.get(
                f"{self.BASE_URL}/users/by/username/{username}",
                headers=headers,
            )
            user_resp.raise_for_status()
            user_id = user_resp.json()["data"]["id"]

            # ツイートを取得
            tweets_resp = await client.get(
                f"{self.BASE_URL}/users/{user_id}/tweets",
                headers=headers,
                params={
                    "max_results": min(limit, 100),
                    "tweet.fields": "id,text,created_at,public_metrics,attachments",
                    "expansions": "attachments.media_keys",
                    "media.fields": "url,preview_image_url,type",
                    "exclude": "retweets,replies",
                },
            )
            tweets_resp.raise_for_status()
            raw = tweets_resp.json()
        except Exception:
            return []

        tweets = raw.get("data", [])
        media_map: dict[str, str] = {}
        for m in raw.get("includes", {}).get("media", []):
            key = m.get("media_key", "")
            url = m.get("url") or m.get("preview_image_url")
            if url:
                media_map[key] = url

        result = []
        for t in tweets[:limit]:
            metrics = t.get("public_metrics", {})
            media_keys = t.get("attachments", {}).get("media_keys", [])
            media_url = media_map.get(media_keys[0]) if media_keys else None
            result.append({
                "id": t["id"],
                "text": t["text"],
                "created_at": t.get("created_at", ""),
                "url": f"https://x.com/{username}/status/{t['id']}",
                "media_url": media_url,
                "like_count": metrics.get("like_count", 0),
                "retweet_count": metrics.get("retweet_count", 0),
            })

        _cache[cache_key] = (result, time.time())
        return result
