"""RestCountries API v3.1 連携サービス"""
from __future__ import annotations
import time
from typing import Any

import httpx

from app.core.config import settings

# シンプルなインメモリキャッシュ
_cache: dict[str, tuple[Any, float]] = {}


def _is_expired(ts: float) -> bool:
    return time.time() - ts > settings.cache_ttl_hours * 3600


REGION_MAP = {
    "Africa": "アフリカ",
    "Americas": "アメリカ",
    "Asia": "アジア",
    "Europe": "ヨーロッパ",
    "Oceania": "オセアニア",
    "Antarctic": "南極",
}

NAME_JA_MAP = {
    "JP": "日本",
    "US": "アメリカ合衆国",
    "GB": "イギリス",
    "FR": "フランス",
    "DE": "ドイツ",
    "IT": "イタリア",
    "ES": "スペイン",
    "CN": "中国",
    "KR": "韓国",
    "IN": "インド",
    "AU": "オーストラリア",
    "CA": "カナダ",
    "BR": "ブラジル",
    "MX": "メキシコ",
    "TH": "タイ",
    "VN": "ベトナム",
    "ID": "インドネシア",
    "SG": "シンガポール",
    "MY": "マレーシア",
    "PH": "フィリピン",
    "EG": "エジプト",
    "ZA": "南アフリカ",
    "TR": "トルコ",
    "GR": "ギリシャ",
    "PT": "ポルトガル",
    "NL": "オランダ",
    "CH": "スイス",
    "AT": "オーストリア",
    "BE": "ベルギー",
    "SE": "スウェーデン",
    "NO": "ノルウェー",
    "DK": "デンマーク",
    "FI": "フィンランド",
    "PL": "ポーランド",
    "CZ": "チェコ",
    "HU": "ハンガリー",
    "RO": "ルーマニア",
    "NZ": "ニュージーランド",
    "AR": "アルゼンチン",
    "CL": "チリ",
    "CO": "コロンビア",
    "PE": "ペルー",
    "MA": "モロッコ",
    "KE": "ケニア",
    "NG": "ナイジェリア",
    "GH": "ガーナ",
    "TZ": "タンザニア",
    "ET": "エチオピア",
    "RU": "ロシア",
    "UA": "ウクライナ",
    "SA": "サウジアラビア",
    "AE": "アラブ首長国連邦",
    "IL": "イスラエル",
    "IR": "イラン",
    "IQ": "イラク",
    "PK": "パキスタン",
    "BD": "バングラデシュ",
    "LK": "スリランカ",
    "NP": "ネパール",
    "MM": "ミャンマー",
    "KH": "カンボジア",
    "LA": "ラオス",
    "MN": "モンゴル",
    "UZ": "ウズベキスタン",
    "KZ": "カザフスタン",
    "CU": "キューバ",
    "JM": "ジャマイカ",
    "PA": "パナマ",
    "CR": "コスタリカ",
    "GT": "グアテマラ",
    "HN": "ホンジュラス",
    "SV": "エルサルバドル",
    "BO": "ボリビア",
    "PY": "パラグアイ",
    "UY": "ウルグアイ",
    "VE": "ベネズエラ",
    "EC": "エクアドル",
    "IS": "アイスランド",
    "IE": "アイルランド",
    "HR": "クロアチア",
    "RS": "セルビア",
    "BG": "ブルガリア",
    "SK": "スロバキア",
    "SI": "スロベニア",
    "LT": "リトアニア",
    "LV": "ラトビア",
    "EE": "エストニア",
    "BY": "ベラルーシ",
    "MD": "モルドバ",
    "AL": "アルバニア",
    "MK": "北マケドニア",
    "BA": "ボスニア・ヘルツェゴビナ",
    "ME": "モンテネグロ",
    "XK": "コソボ",
    "LU": "ルクセンブルク",
    "MT": "マルタ",
    "CY": "キプロス",
    "LI": "リヒテンシュタイン",
    "MC": "モナコ",
    "AD": "アンドラ",
    "SM": "サンマリノ",
    "VA": "バチカン",
}


def _parse_country(raw: dict) -> dict:
    code = raw.get("cca2", "")
    name_common = raw.get("name", {}).get("common", "")
    latlng = raw.get("latlng", [])
    languages_raw = raw.get("languages", {})
    currencies_raw = raw.get("currencies", {})

    currencies = []
    for cur_code, cur_info in currencies_raw.items():
        currencies.append(
            {
                "code": cur_code,
                "name": cur_info.get("name", ""),
                "symbol": cur_info.get("symbol"),
            }
        )

    flags = raw.get("flags", {})
    flag_url = flags.get("svg") or flags.get("png") or ""

    return {
        "code": code,
        "name": name_common,
        "name_ja": NAME_JA_MAP.get(code),
        "capital": raw.get("capital", [None])[0] if raw.get("capital") else None,
        "region": raw.get("region", ""),
        "subregion": raw.get("subregion"),
        "population": raw.get("population", 0),
        "languages": list(languages_raw.values()),
        "currencies": currencies,
        "flag_url": flag_url,
        "flag_emoji": raw.get("flag", ""),
        "latitude": latlng[0] if len(latlng) > 0 else None,
        "longitude": latlng[1] if len(latlng) > 1 else None,
        "borders": raw.get("borders", []),
        "timezones": raw.get("timezones", []),
    }


class RestCountriesService:
    def __init__(self) -> None:
        self.base_url = settings.restcountries_base_url

    async def get_all_countries(self, query: str | None = None, region: str | None = None) -> list[dict]:
        cache_key = f"all_countries"
        if cache_key in _cache:
            data, ts = _cache[cache_key]
            if not _is_expired(ts):
                countries = data
            else:
                countries = await self._fetch_all()
                _cache[cache_key] = (countries, time.time())
        else:
            countries = await self._fetch_all()
            _cache[cache_key] = (countries, time.time())

        # フィルタリング
        if query:
            q = query.lower()
            countries = [
                c for c in countries
                if q in c["name"].lower()
                or (c["name_ja"] and q in c["name_ja"])
                or q in c["code"].lower()
            ]
        if region:
            countries = [c for c in countries if c["region"].lower() == region.lower()]

        return countries

    async def get_country(self, code: str) -> dict | None:
        cache_key = f"country_{code.upper()}"
        if cache_key in _cache:
            data, ts = _cache[cache_key]
            if not _is_expired(ts):
                return data

        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                resp = await client.get(
                    f"{self.base_url}/alpha/{code}",
                    params={"fields": "name,cca2,flags,flag,capital,region,subregion,population,languages,currencies,latlng,borders,timezones"},
                )
                if resp.status_code == 404:
                    return None
                resp.raise_for_status()
                raw = resp.json()
                # APIは単一オブジェクトまたはリストで返すことがある
                if isinstance(raw, list):
                    raw = raw[0]
                country = _parse_country(raw)
                _cache[cache_key] = (country, time.time())
                return country
            except (httpx.HTTPStatusError, httpx.TimeoutException):
                return None

    async def get_coordinates(self, code: str) -> tuple[float, float] | None:
        """国コードから座標(lat, lng)を取得する。エラー時はNone。"""
        # まずキャッシュされた国情報から取得を試みる
        country = await self.get_country(code)
        if country and country.get("latitude") is not None and country.get("longitude") is not None:
            return (country["latitude"], country["longitude"])
        return None

    async def _fetch_all(self) -> list[dict]:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.get(
                f"{self.base_url}/all",
                params={"fields": "name,cca2,flags,capital,region,subregion,population,languages,currencies,latlng"},
            )
            resp.raise_for_status()
            return [_parse_country(r) for r in resp.json()]
