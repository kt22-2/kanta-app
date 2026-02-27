"""TDD: X（Twitter）投稿APIのテスト"""
from unittest.mock import patch, AsyncMock

import pytest
from fastapi.testclient import TestClient

from tests.conftest import client  # noqa: F401


MOCK_X_POSTS = [
    {
        "id": "1234567890",
        "text": "世界一周旅行中！タイのバンコクに到着しました🇹🇭 #世界一周 #旅行",
        "created_at": "2026-02-20T10:00:00Z",
        "url": "https://x.com/anta_kaoi/status/1234567890",
        "media_url": None,
        "like_count": 42,
        "retweet_count": 5,
    },
    {
        "id": "1234567891",
        "text": "インドのムンバイは想像以上にカオスだった😂 #インド #旅行",
        "created_at": "2026-02-15T08:30:00Z",
        "url": "https://x.com/anta_kaoi/status/1234567891",
        "media_url": "https://pbs.twimg.com/media/example.jpg",
        "like_count": 128,
        "retweet_count": 20,
    },
]


def test_get_x_posts_returns_200(client: TestClient):
    """GET /api/x/posts が200を返す"""
    with patch(
        "app.api.x_posts._x_svc.get_posts",
        new_callable=AsyncMock,
        return_value=MOCK_X_POSTS,
    ):
        response = client.get("/api/x/posts?username=anta_kaoi")
    assert response.status_code == 200


def test_x_posts_response_is_list(client: TestClient):
    """レスポンスがリストである"""
    with patch(
        "app.api.x_posts._x_svc.get_posts",
        new_callable=AsyncMock,
        return_value=MOCK_X_POSTS,
    ):
        response = client.get("/api/x/posts?username=anta_kaoi")
    data = response.json()
    assert isinstance(data, list)


def test_x_posts_have_required_fields(client: TestClient):
    """各投稿にid, text, created_at, urlフィールドがある"""
    with patch(
        "app.api.x_posts._x_svc.get_posts",
        new_callable=AsyncMock,
        return_value=MOCK_X_POSTS,
    ):
        response = client.get("/api/x/posts?username=anta_kaoi")
    data = response.json()
    assert len(data) > 0
    post = data[0]
    assert "id" in post
    assert "text" in post
    assert "created_at" in post
    assert "url" in post
    assert "like_count" in post
    assert "retweet_count" in post


def test_x_posts_empty_when_no_bearer_token(client: TestClient):
    """Bearer Token未設定時でも空配列を返す（エラーにならない）"""
    with patch(
        "app.api.x_posts._x_svc.get_posts",
        new_callable=AsyncMock,
        return_value=[],
    ):
        response = client.get("/api/x/posts?username=anta_kaoi")
    assert response.status_code == 200
    data = response.json()
    assert data == []


def test_x_posts_default_limit_is_10(client: TestClient):
    """limitパラメータ未指定時は最大10件を返す"""
    many_posts = [
        {
            "id": str(i),
            "text": f"投稿 {i}",
            "created_at": "2026-02-20T10:00:00Z",
            "url": f"https://x.com/anta_kaoi/status/{i}",
            "media_url": None,
            "like_count": i,
            "retweet_count": 0,
        }
        for i in range(15)
    ]
    with patch(
        "app.api.x_posts._x_svc.get_posts",
        new_callable=AsyncMock,
        return_value=many_posts[:10],
    ):
        response = client.get("/api/x/posts?username=anta_kaoi")
    data = response.json()
    assert len(data) <= 10
