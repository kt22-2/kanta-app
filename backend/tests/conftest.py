import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch

from app.main import app

MOCK_COUNTRY = {
    "code": "JP",
    "name": "Japan",
    "name_ja": "日本",
    "capital": "Tokyo",
    "region": "アジア",
    "subregion": "Eastern Asia",
    "population": 125700000,
    "languages": ["Japanese"],
    "currencies": [{"code": "JPY", "name": "Japanese yen", "symbol": "¥"}],
    "flag_url": "https://flagcdn.com/jp.svg",
    "flag_emoji": "🇯🇵",
    "latitude": 36.0,
    "longitude": 138.0,
}

MOCK_SAFETY = {
    "country_code": "JP",
    "level": 0,
    "level_label": "安全",
    "summary": "日本は一般的に安全な国です。",
    "details": [
        {
            "category": "犯罪",
            "description": "犯罪率は低く、旅行者にとって比較的安全です。",
            "severity": "low",
        }
    ],
    "last_updated": None,
    "regional_risks": [],
}

MOCK_ENTRY = {
    "country_code": "JP",
    "visa_required": False,
    "visa_on_arrival": False,
    "visa_free_days": 90,
    "passport_validity_months": 6,
    "notes": "日本人はビザなしで入国可能。",
}

MOCK_ATTRACTIONS = {
    "country_code": "JP",
    "country_name": "Japan",
    "attractions": [
        {
            "name": "富士山",
            "description": "日本のシンボルである霊峰。",
            "category": "自然",
            "highlights": ["世界遺産", "登山", "絶景"],
        }
    ],
    "best_season": "春（3月〜5月）と秋（9月〜11月）",
    "travel_tips": ["交通ICカードを活用する", "現金も用意しておく"],
}


@pytest.fixture
def client():
    return TestClient(app)
