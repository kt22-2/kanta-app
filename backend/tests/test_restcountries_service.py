from unittest.mock import AsyncMock, Mock, patch

import pytest

from app.services.restcountries import RestCountriesService


@pytest.mark.asyncio
async def test_fetch_all_uses_supported_fields_only():
    service = RestCountriesService()

    payload = [
        {
            "name": {"common": "Japan"},
            "cca2": "JP",
            "flags": {"svg": "https://flagcdn.com/jp.svg"},
            "capital": ["Tokyo"],
            "region": "Asia",
            "subregion": "Eastern Asia",
            "population": 125700000,
            "languages": {"jpn": "Japanese"},
            "currencies": {"JPY": {"name": "Japanese yen", "symbol": "¥"}},
            "timezones": ["UTC+09:00"],
        }
    ]

    mock_response = Mock()
    mock_response.raise_for_status.return_value = None
    mock_response.json.return_value = payload

    with patch("httpx.AsyncClient.get", new=AsyncMock(return_value=mock_response)) as mock_get:
        countries = await service._fetch_all()

    assert countries[0]["code"] == "JP"
    _, kwargs = mock_get.call_args
    assert kwargs["params"]["fields"] == (
        "name,cca2,flags,capital,region,subregion,population,languages,currencies,timezones"
    )
