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


def test_get_countries_with_region_filter(client: TestClient):
    mock_countries = [MOCK_COUNTRY]
    with patch(
        "app.services.restcountries.RestCountriesService.get_all_countries",
        new_callable=AsyncMock,
        return_value=mock_countries,
    ):
        response = client.get("/api/countries?region=Asia")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_get_countries_with_safety_level_filter(client: TestClient):
    """危険度フィルタのテスト"""
    mock_countries = [
        {**MOCK_COUNTRY, "code": "JP", "safety_level": 0},
        {**MOCK_COUNTRY, "code": "US", "safety_level": 1},
        {**MOCK_COUNTRY, "code": "FR", "safety_level": 2},
    ]
    with patch(
        "app.services.restcountries.RestCountriesService.get_all_countries",
        new_callable=AsyncMock,
        return_value=mock_countries,
    ):
        # safety_levelがキャッシュから取得されるようにモック
        import app.api.countries as countries_module
        countries_module._safety_cache = {"JP": 0, "US": 1, "FR": 2}
        countries_module._safety_cache_ts = 9999999999.0  # 期限切れしない値

        # safety_level=0でフィルタ
        response = client.get("/api/countries?safety_level=0")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["code"] == "JP"

        # safety_level=1でフィルタ
        response = client.get("/api/countries?safety_level=1")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["code"] == "US"


def test_get_countries_with_region_and_safety_level_filter(client: TestClient):
    """地域＋危険度の複合フィルタのテスト"""
    mock_countries_asia = [
        {**MOCK_COUNTRY, "code": "JP", "region": "Asia", "safety_level": 0},
        {**MOCK_COUNTRY, "code": "TH", "region": "Asia", "safety_level": 1},
    ]
    with patch(
        "app.services.restcountries.RestCountriesService.get_all_countries",
        new_callable=AsyncMock,
        return_value=mock_countries_asia,
    ):
        # safety_levelがキャッシュから取得されるようにモック
        import app.api.countries as countries_module
        countries_module._safety_cache = {"JP": 0, "TH": 1}
        countries_module._safety_cache_ts = 9999999999.0  # 期限切れしない値

        # region=Asia + safety_level=0でフィルタ
        response = client.get("/api/countries?region=Asia&safety_level=0")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["code"] == "JP"

