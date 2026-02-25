"""TDD: 安全情報APIのテスト"""
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

from tests.conftest import MOCK_SAFETY


def test_get_safety_info(client: TestClient):
    with patch(
        "app.services.travel_advisory.TravelAdvisoryService.get_safety_info",
        return_value=MOCK_SAFETY,
    ):
        response = client.get("/api/countries/JP/safety")
    assert response.status_code == 200
    data = response.json()
    assert data["country_code"] == "JP"
    assert data["level"] == 0
    assert data["level_label"] == "安全"


def test_safety_level_range(client: TestClient):
    with patch(
        "app.services.travel_advisory.TravelAdvisoryService.get_safety_info",
        return_value=MOCK_SAFETY,
    ):
        response = client.get("/api/countries/JP/safety")
    data = response.json()
    assert 0 <= data["level"] <= 4


def test_safety_has_summary(client: TestClient):
    with patch(
        "app.services.travel_advisory.TravelAdvisoryService.get_safety_info",
        return_value=MOCK_SAFETY,
    ):
        response = client.get("/api/countries/JP/safety")
    data = response.json()
    assert "summary" in data
    assert len(data["summary"]) > 0


def test_safety_has_details(client: TestClient):
    with patch(
        "app.services.travel_advisory.TravelAdvisoryService.get_safety_info",
        return_value=MOCK_SAFETY,
    ):
        response = client.get("/api/countries/JP/safety")
    data = response.json()
    assert "details" in data
    assert isinstance(data["details"], list)


def test_get_entry_requirement(client: TestClient):
    from tests.conftest import MOCK_ENTRY
    with patch(
        "app.services.travel_advisory.TravelAdvisoryService.get_entry_requirement",
        return_value=MOCK_ENTRY,
    ):
        response = client.get("/api/countries/JP/entry")
    assert response.status_code == 200
    data = response.json()
    assert data["country_code"] == "JP"
    assert "visa_required" in data
