"""TDD: 観光スポットAPIのテスト（v2: EnrichedAttractionsResponse対応）"""
from unittest.mock import patch, AsyncMock

import pytest
from fastapi.testclient import TestClient

from tests.conftest import MOCK_COUNTRY, MOCK_ATTRACTIONS


def _patch_attractions():
    """attractionsエンドポイントの依存サービスをモックする"""
    return (
        patch(
            "app.api.attractions._country_svc.get_country",
            new_callable=AsyncMock,
            return_value=MOCK_COUNTRY,
        ),
        patch(
            "app.api.attractions._otm_svc.get_attractions",
            new_callable=AsyncMock,
            return_value=[],
        ),
        patch(
            "app.api.attractions._ai_svc.generate_attractions",
            new_callable=AsyncMock,
            return_value=MOCK_ATTRACTIONS,
        ),
    )


def test_get_attractions(client: TestClient):
    p1, p2, p3 = _patch_attractions()
    with p1, p2, p3:
        response = client.get("/api/countries/JP/attractions")
    assert response.status_code == 200
    data = response.json()
    assert data["country_code"] == "JP"
    assert isinstance(data["ai_summary"], list)
    assert len(data["ai_summary"]) > 0


def test_attractions_have_required_fields(client: TestClient):
    p1, p2, p3 = _patch_attractions()
    with p1, p2, p3:
        response = client.get("/api/countries/JP/attractions")
    data = response.json()
    for attraction in data["ai_summary"]:
        assert "name" in attraction
        assert "description" in attraction
        assert "category" in attraction
        assert "highlights" in attraction


def test_attractions_have_travel_tips(client: TestClient):
    p1, p2, p3 = _patch_attractions()
    with p1, p2, p3:
        response = client.get("/api/countries/JP/attractions")
    data = response.json()
    assert "travel_tips" in data
    assert isinstance(data["travel_tips"], list)
