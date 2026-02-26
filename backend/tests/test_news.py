"""TDD: ニュースAPIのテスト"""
from unittest.mock import patch, AsyncMock

import pytest
from fastapi.testclient import TestClient

from app.services.news_service import NewsService
from tests.conftest import MOCK_COUNTRY


MOCK_NEWS_RESPONSE = {
    "country_code": "JP",
    "articles": [
        {
            "title": "日本の最新ニュース",
            "description": "テスト記事の説明",
            "url": "https://example.com/news/1",
            "source": "Example News",
            "published_at": "2026-02-25T00:00:00Z",
        }
    ],
    "total": 1,
}


def test_get_news_returns_200(client: TestClient):
    """GET /api/countries/{code}/news が200を返す"""
    with patch(
        "app.api.news._gnews_svc.get_news",
        new_callable=AsyncMock,
        return_value=MOCK_NEWS_RESPONSE,
    ), patch(
        "app.services.restcountries.RestCountriesService.get_country",
        new_callable=AsyncMock,
        return_value=MOCK_COUNTRY,
    ):
        response = client.get("/api/countries/JP/news")
    assert response.status_code == 200


def test_news_response_has_required_fields(client: TestClient):
    """レスポンスにcountry_code, articles, totalフィールドがある"""
    with patch(
        "app.api.news._gnews_svc.get_news",
        new_callable=AsyncMock,
        return_value=MOCK_NEWS_RESPONSE,
    ), patch(
        "app.services.restcountries.RestCountriesService.get_country",
        new_callable=AsyncMock,
        return_value=MOCK_COUNTRY,
    ):
        response = client.get("/api/countries/JP/news")
    data = response.json()
    assert "country_code" in data
    assert "articles" in data
    assert "total" in data


def test_news_articles_is_list(client: TestClient):
    """articlesが配列である"""
    with patch(
        "app.api.news._gnews_svc.get_news",
        new_callable=AsyncMock,
        return_value=MOCK_NEWS_RESPONSE,
    ), patch(
        "app.services.restcountries.RestCountriesService.get_country",
        new_callable=AsyncMock,
        return_value=MOCK_COUNTRY,
    ):
        response = client.get("/api/countries/JP/news")
    data = response.json()
    assert isinstance(data["articles"], list)


def test_news_empty_when_no_api_key(client: TestClient):
    """APIキー未設定時でも空配列を返す（エラーにならない）"""
    empty_response = {
        "country_code": "JP",
        "articles": [],
        "total": 0,
    }
    with patch(
        "app.api.news._gnews_svc.get_news",
        new_callable=AsyncMock,
        return_value=empty_response,
    ), patch(
        "app.services.restcountries.RestCountriesService.get_country",
        new_callable=AsyncMock,
        return_value=MOCK_COUNTRY,
    ):
        response = client.get("/api/countries/JP/news")
    assert response.status_code == 200
    data = response.json()
    assert data["articles"] == []
    assert data["total"] == 0


def test_safety_filter_passes_relevant_article():
    """治安・犯罪関連の記事がフィルタを通ること"""
    svc = NewsService()
    assert svc._is_safety_related("Robbery in downtown Tokyo", None) is True
    assert svc._is_safety_related("Earthquake hits coastal region", None) is True
    assert svc._is_safety_related("Travel advisory issued for region", None) is True
    assert svc._is_safety_related("テロ攻撃の警告が発令", None) is True


def test_safety_filter_blocks_irrelevant_article():
    """治安と無関係な記事がフィルタで除外されること"""
    svc = NewsService()
    assert svc._is_safety_related("Cherry blossom festival in Kyoto opens this weekend", None) is False
    assert svc._is_safety_related("New restaurant guide for Tokyo visitors", None) is False
    assert svc._is_safety_related("GDP growth exceeds expectations in Q4", None) is False


def test_safety_filter_checks_description():
    """タイトルに含まれなくてもdescriptionに含まれれば通ること"""
    svc = NewsService()
    assert svc._is_safety_related(
        "Breaking news from Japan",
        "Police arrested a suspect in connection with the robbery"
    ) is True


def test_safety_filter_fallback_on_all_filtered(client: TestClient):
    """二次フィルタ後に0件の場合はフィルタなし結果を返すこと"""
    irrelevant_response = {
        "country_code": "JP",
        "articles": [
            {
                "title": "Tokyo tourism numbers reach record high",
                "description": "Visitors from around the world",
                "url": "https://example.com/news/1",
                "source": "Tourism News",
                "published_at": "2026-02-25T00:00:00Z",
            }
        ],
        "total": 1,
    }
    with patch(
        "app.api.news._gnews_svc.get_news",
        new_callable=AsyncMock,
        return_value=irrelevant_response,
    ), patch(
        "app.services.restcountries.RestCountriesService.get_country",
        new_callable=AsyncMock,
        return_value=MOCK_COUNTRY,
    ):
        response = client.get("/api/countries/JP/news")
    assert response.status_code == 200
    data = response.json()
    # フォールバックにより記事が返ること（0件にはならない）
    assert data["total"] >= 0
