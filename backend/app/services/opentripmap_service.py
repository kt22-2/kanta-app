"""OpenTripMap API 連携サービス"""
from __future__ import annotations
import time
from typing import Any

import httpx

from app.core.config import settings

# インメモリキャッシュ（24時間）
_otm_cache: dict[str, tuple[Any, float]] = {}

# 主要国の首都・主要都市座標（国コード → (lat, lon)）
# RestCountries の国中心座標より著名な観光地に近い都市を優先
_CAPITAL_COORDS: dict[str, tuple[float, float]] = {
    "JP": (35.6762, 139.6503),   # 東京
    "US": (38.8951, -77.0364),   # ワシントンDC
    "FR": (48.8566, 2.3522),     # パリ
    "GB": (51.5074, -0.1278),    # ロンドン
    "DE": (52.5200, 13.4050),    # ベルリン
    "IT": (41.9028, 12.4964),    # ローマ
    "ES": (40.4168, -3.7038),    # マドリード
    "CN": (39.9042, 116.4074),   # 北京
    "KR": (37.5665, 126.9780),   # ソウル
    "IN": (28.6139, 77.2090),    # ニューデリー
    "AU": (-33.8688, 151.2093),  # シドニー
    "CA": (45.4215, -75.6972),   # オタワ
    "BR": (-15.7942, -47.8822),  # ブラジリア
    "MX": (19.4326, -99.1332),   # メキシコシティ
    "TH": (13.7563, 100.5018),   # バンコク
    "VN": (21.0278, 105.8342),   # ハノイ
    "ID": (-6.2088, 106.8456),   # ジャカルタ
    "SG": (1.3521, 103.8198),    # シンガポール
    "MY": (3.1390, 101.6869),    # クアラルンプール
    "EG": (30.0444, 31.2357),    # カイロ
    "TR": (39.9334, 32.8597),    # アンカラ
    "GR": (37.9755, 23.7348),    # アテネ
    "PT": (38.7169, -9.1399),    # リスボン
    "NL": (52.3676, 4.9041),     # アムステルダム
    "CH": (46.9481, 7.4474),     # ベルン
    "AT": (48.2082, 16.3738),    # ウィーン
    "RU": (55.7558, 37.6173),    # モスクワ
    "SA": (24.6877, 46.7219),    # リヤド
    "AE": (25.2048, 55.2708),    # ドバイ
    "MA": (33.9716, -6.8498),    # ラバト
    "PE": (-12.0464, -77.0428),  # リマ
    "AR": (-34.6037, -58.3816),  # ブエノスアイレス
}


def _is_expired(ts: float) -> bool:
    return time.time() - ts > settings.cache_ttl_hours * 3600


class OpenTripMapService:
    BASE_URL = "https://api.opentripmap.com/0.1/en"

    async def get_attractions(
        self, lat: float, lon: float, country_code: str
    ) -> list[dict]:
        """観光スポットを取得する。APIキー未設定時は空リストを返す。"""
        if not settings.otm_api_key:
            return []

        cache_key = f"otm_{country_code.upper()}"
        if cache_key in _otm_cache:
            data, ts = _otm_cache[cache_key]
            if not _is_expired(ts):
                return data

        # 首都・主要都市の座標があればそちらを優先
        search_lat, search_lon = _CAPITAL_COORDS.get(country_code.upper(), (lat, lon))

        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                resp = await client.get(
                    f"{self.BASE_URL}/places/radius",
                    params={
                        "radius": 300000,  # 300km
                        "lon": search_lon,
                        "lat": search_lat,
                        "kinds": "cultural,historic,natural,architecture,religion",
                        "format": "json",
                        "limit": 30,
                        "rate": "3h",   # 評価3以上（高評価スポットのみ）
                        "apikey": settings.otm_api_key,
                    },
                )
                resp.raise_for_status()
                raw_places = resp.json()

            seen_names: set[str] = set()
            attractions = []
            for place in raw_places:
                name = place.get("name", "").strip()
                # 名前がない or 空 or 重複スポットは除外
                if not name or name in seen_names:
                    continue
                seen_names.add(name)
                attractions.append({
                    "name": name,
                    "description": place.get("wikipedia_extracts", {}).get("text") if isinstance(place.get("wikipedia_extracts"), dict) else None,
                    "category": place.get("kinds", "").split(",")[0] if place.get("kinds") else None,
                    "latitude": place.get("point", {}).get("lat"),
                    "longitude": place.get("point", {}).get("lon"),
                    "rating": place.get("rate"),
                    "wikipedia_url": place.get("wikipedia"),
                })
                if len(attractions) >= 10:
                    break

            _otm_cache[cache_key] = (attractions, time.time())
            return attractions
        except Exception:
            return []
