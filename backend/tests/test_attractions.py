"""TDD: 観光スポットAPIのテスト"""
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

from tests.conftest import MOCK_ATTRACTIONS


def test_get_attractions(client: TestClient):
    with patch(
        "app.services.ai_service.AIService.generate_attractions",
        return_value=MOCK_ATTRACTIONS,
    ):
        response = client.get("/api/countries/JP/attractions")
    assert response.status_code == 200
    data = response.json()
    assert data["country_code"] == "JP"
    assert isinstance(data["attractions"], list)
    assert len(data["attractions"]) > 0


def test_attractions_have_required_fields(client: TestClient):
    with patch(
        "app.services.ai_service.AIService.generate_attractions",
        return_value=MOCK_ATTRACTIONS,
    ):
        response = client.get("/api/countries/JP/attractions")
    data = response.json()
    for attraction in data["attractions"]:
        assert "name" in attraction
        assert "description" in attraction
        assert "category" in attraction
        assert "highlights" in attraction


def test_attractions_have_travel_tips(client: TestClient):
    with patch(
        "app.services.ai_service.AIService.generate_attractions",
        return_value=MOCK_ATTRACTIONS,
    ):
        response = client.get("/api/countries/JP/attractions")
    data = response.json()
    assert "travel_tips" in data
    assert isinstance(data["travel_tips"], list)
