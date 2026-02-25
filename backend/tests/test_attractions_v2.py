"""TDD: 観光スポットAPI v2（エンリッチ版）のテスト"""
from unittest.mock import patch, AsyncMock

import pytest
from fastapi.testclient import TestClient

from tests.conftest import MOCK_COUNTRY


MOCK_ENRICHED_ATTRACTIONS = {
    "country_code": "JP",
    "country_name": "Japan",
    "otm_attractions": [
        {
            "name": "東京タワー",
            "description": "東京のランドマーク",
            "category": "architecture",
            "latitude": 35.6586,
            "longitude": 139.7454,
            "rating": 7,
            "wikipedia_url": "https://en.wikipedia.org/wiki/Tokyo_Tower",
        }
    ],
    "ai_summary": [
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


def test_enriched_attractions_has_otm_field(client: TestClient):
    """EnrichedAttractionsResponseにotm_attractionsフィールドがある"""
    with patch(
        "app.api.attractions._country_svc.get_country",
        new_callable=AsyncMock,
        return_value=MOCK_COUNTRY,
    ), patch(
        "app.api.attractions._otm_svc.get_attractions",
        new_callable=AsyncMock,
        return_value=MOCK_ENRICHED_ATTRACTIONS["otm_attractions"],
    ), patch(
        "app.api.attractions._ai_svc.generate_attractions",
        new_callable=AsyncMock,
        return_value={
            "attractions": MOCK_ENRICHED_ATTRACTIONS["ai_summary"],
            "best_season": MOCK_ENRICHED_ATTRACTIONS["best_season"],
            "travel_tips": MOCK_ENRICHED_ATTRACTIONS["travel_tips"],
        },
    ):
        response = client.get("/api/countries/JP/attractions")
    assert response.status_code == 200
    data = response.json()
    assert "otm_attractions" in data
    assert isinstance(data["otm_attractions"], list)


def test_enriched_attractions_has_ai_summary_field(client: TestClient):
    """EnrichedAttractionsResponseにai_summaryフィールドがある"""
    with patch(
        "app.api.attractions._country_svc.get_country",
        new_callable=AsyncMock,
        return_value=MOCK_COUNTRY,
    ), patch(
        "app.api.attractions._otm_svc.get_attractions",
        new_callable=AsyncMock,
        return_value=MOCK_ENRICHED_ATTRACTIONS["otm_attractions"],
    ), patch(
        "app.api.attractions._ai_svc.generate_attractions",
        new_callable=AsyncMock,
        return_value={
            "attractions": MOCK_ENRICHED_ATTRACTIONS["ai_summary"],
            "best_season": MOCK_ENRICHED_ATTRACTIONS["best_season"],
            "travel_tips": MOCK_ENRICHED_ATTRACTIONS["travel_tips"],
        },
    ):
        response = client.get("/api/countries/JP/attractions")
    assert response.status_code == 200
    data = response.json()
    assert "ai_summary" in data
    assert isinstance(data["ai_summary"], list)


def test_enriched_attractions_otm_is_list(client: TestClient):
    """otm_attractionsが配列である"""
    with patch(
        "app.api.attractions._country_svc.get_country",
        new_callable=AsyncMock,
        return_value=MOCK_COUNTRY,
    ), patch(
        "app.api.attractions._otm_svc.get_attractions",
        new_callable=AsyncMock,
        return_value=[],
    ), patch(
        "app.api.attractions._ai_svc.generate_attractions",
        new_callable=AsyncMock,
        return_value={
            "attractions": [],
            "best_season": None,
            "travel_tips": [],
        },
    ):
        response = client.get("/api/countries/JP/attractions")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data["otm_attractions"], list)
