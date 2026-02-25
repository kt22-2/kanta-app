"""TDD: 国情報APIのテスト（先に書く → 失敗確認 → 実装）"""
from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient

from tests.conftest import MOCK_COUNTRY


def test_health_check(client: TestClient):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_get_countries_returns_list(client: TestClient):
    mock_countries = [MOCK_COUNTRY]
    with patch(
        "app.services.restcountries.RestCountriesService.get_all_countries",
        new_callable=AsyncMock,
        return_value=mock_countries,
    ):
        response = client.get("/api/countries")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1


def test_get_countries_with_query(client: TestClient):
    mock_countries = [MOCK_COUNTRY]
    with patch(
        "app.services.restcountries.RestCountriesService.get_all_countries",
        new_callable=AsyncMock,
        return_value=mock_countries,
    ):
        response = client.get("/api/countries?q=Japan")
    assert response.status_code == 200
    data = response.json()
    assert any(c["name"] == "Japan" for c in data)


def test_get_country_by_code(client: TestClient):
    with patch(
        "app.services.restcountries.RestCountriesService.get_country",
        new_callable=AsyncMock,
        return_value=MOCK_COUNTRY,
    ):
        response = client.get("/api/countries/JP")
    assert response.status_code == 200
    data = response.json()
    assert data["code"] == "JP"
    assert data["name"] == "Japan"


def test_get_country_not_found(client: TestClient):
    with patch(
        "app.services.restcountries.RestCountriesService.get_country",
        new_callable=AsyncMock,
        return_value=None,
    ):
        response = client.get("/api/countries/INVALID")
    assert response.status_code == 404


def test_country_has_required_fields(client: TestClient):
    with patch(
        "app.services.restcountries.RestCountriesService.get_country",
        new_callable=AsyncMock,
        return_value=MOCK_COUNTRY,
    ):
        response = client.get("/api/countries/JP")
    data = response.json()
    for field in ["code", "name", "flag_url", "flag_emoji", "region", "population"]:
        assert field in data, f"フィールド '{field}' が不足しています"


def test_search_endpoint(client: TestClient):
    mock_countries = [MOCK_COUNTRY]
    with patch(
        "app.services.restcountries.RestCountriesService.get_all_countries",
        new_callable=AsyncMock,
        return_value=mock_countries,
    ):
        response = client.get("/api/search?q=Japan")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
