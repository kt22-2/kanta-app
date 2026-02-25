"""TDD: ニュースAPIのテスト"""
from unittest.mock import patch, AsyncMock

import pytest
from fastapi.testclient import TestClient

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
        "app.api.news._news_svc.get_news",
        new_callable=AsyncMock,
        return_value=MOCK_NEWS_RESPONSE,
    ), patch(
        "app.api.news._country_svc.get_country",
        new_callable=AsyncMock,
        return_value=MOCK_COUNTRY,
    ):
        response = client.get("/api/countries/JP/news")
    assert response.status_code == 200


def test_news_response_has_required_fields(client: TestClient):
    """レスポンスにcountry_code, articles, totalフィールドがある"""
    with patch(
        "app.api.news._news_svc.get_news",
        new_callable=AsyncMock,
        return_value=MOCK_NEWS_RESPONSE,
    ), patch(
        "app.api.news._country_svc.get_country",
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
        "app.api.news._news_svc.get_news",
        new_callable=AsyncMock,
        return_value=MOCK_NEWS_RESPONSE,
    ), patch(
        "app.api.news._country_svc.get_country",
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
        "app.api.news._news_svc.get_news",
        new_callable=AsyncMock,
        return_value=empty_response,
    ), patch(
        "app.api.news._country_svc.get_country",
        new_callable=AsyncMock,
        return_value=MOCK_COUNTRY,
    ):
        response = client.get("/api/countries/JP/news")
    assert response.status_code == 200
    data = response.json()
    assert data["articles"] == []
    assert data["total"] == 0
