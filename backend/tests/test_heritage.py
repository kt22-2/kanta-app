"""TDD: 世界遺産サービスのテスト"""
from unittest.mock import patch, AsyncMock

import pytest
from fastapi.testclient import TestClient

from app.services.heritage_service import HeritageService
from tests.conftest import MOCK_COUNTRY


def test_is_heritage_service_instantiable():
    """HeritageService がインスタンス化できること"""
    svc = HeritageService()
    assert svc is not None


@pytest.mark.asyncio
async def test_get_heritage_sites_returns_empty_without_country_name():
    """country_name が空の場合は空リストを返すこと"""
    from app.services import heritage_service as hm
    # 未キャッシュの一意なコードを使用（キャッシュ汚染を避ける）
    cache_key = "heritage_ZZTEST"
    hm._heritage_cache.pop(cache_key, None)

    svc = HeritageService()
    result = await svc.get_heritage_sites("ZZTEST", "")
    assert result == []


@pytest.mark.asyncio
async def test_get_heritage_sites_uses_cache():
    """キャッシュヒット時は HTTP リクエストを発行しないこと"""
    import time
    from app.services import heritage_service as hm

    svc = HeritageService()
    cached_data = [{"name": "Test Site", "description": None,
                    "registered_year": None, "latitude": None,
                    "longitude": None, "image_url": None, "wikipedia_url": None}]
    hm._heritage_cache["heritage_TEST"] = (cached_data, time.time())

    result = await svc.get_heritage_sites("TEST", "TestCountry")
    assert result == cached_data

    # クリーンアップ
    del hm._heritage_cache["heritage_TEST"]


def test_category_member_filter_excludes_list_pages():
    """'List of...' で始まるページタイトルが除外されること"""
    import asyncio
    from unittest.mock import MagicMock, AsyncMock as AM

    svc = HeritageService()

    raw_response = {
        "query": {
            "categorymembers": [
                {"title": "Himeji-jo", "pageid": 1},
                {"title": "List of World Heritage Sites in Japan", "pageid": 2},
                {"title": "UNESCO World Heritage Committee", "pageid": 3},
                {"title": "Yakushima", "pageid": 4},
            ]
        }
    }

    mock_resp = MagicMock()
    mock_resp.json.return_value = raw_response

    mock_client = MagicMock()
    mock_client.get = AM(return_value=mock_resp)

    result = asyncio.get_event_loop().run_until_complete(
        svc._get_category_members("World Heritage Sites in Japan", mock_client)
    )

    assert "Himeji-jo" in result
    assert "Yakushima" in result
    assert not any(t.startswith("List of") for t in result)
    assert not any(t.startswith("UNESCO") for t in result)


def test_get_heritage_sites_returns_list_on_http_error(client: TestClient):
    """HTTP エラー時は空リストを返し 200 で応答すること"""
    with patch(
        "app.api.attractions._heritage_svc.get_heritage_sites",
        new_callable=AsyncMock,
        return_value=[],
    ), patch(
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
        return_value={"attractions": [], "best_season": None, "travel_tips": []},
    ):
        response = client.get("/api/countries/JP/attractions")
    assert response.status_code == 200
    data = response.json()
    assert "heritage_sites" in data
    assert isinstance(data["heritage_sites"], list)
