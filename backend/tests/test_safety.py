"""TDD: 安全情報APIのテスト"""
from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient

from tests.conftest import MOCK_SAFETY


def test_get_safety_info(client: TestClient):
    with patch(
        "app.services.mofa_service.MofaSafetyService.get_safety_info",
        new_callable=AsyncMock,
        return_value=MOCK_SAFETY,
    ), patch(
        "app.services.state_dept_service.StateDeptService.get_advisory",
        new_callable=AsyncMock,
        return_value={"level": 0, "message": "情報取得失敗"},
    ):
        response = client.get("/api/countries/JP/safety")
    assert response.status_code == 200
    data = response.json()
    assert data["country_code"] == "JP"
    assert data["level"] == 0
    assert data["level_label"] == "安全"


def test_safety_level_range(client: TestClient):
    with patch(
        "app.services.mofa_service.MofaSafetyService.get_safety_info",
        new_callable=AsyncMock,
        return_value=MOCK_SAFETY,
    ), patch(
        "app.services.state_dept_service.StateDeptService.get_advisory",
        new_callable=AsyncMock,
        return_value={"level": 0, "message": "情報取得失敗"},
    ):
        response = client.get("/api/countries/JP/safety")
    data = response.json()
    assert 0 <= data["level"] <= 4


def test_safety_has_summary(client: TestClient):
    with patch(
        "app.services.mofa_service.MofaSafetyService.get_safety_info",
        new_callable=AsyncMock,
        return_value=MOCK_SAFETY,
    ), patch(
        "app.services.state_dept_service.StateDeptService.get_advisory",
        new_callable=AsyncMock,
        return_value={"level": 0, "message": "情報取得失敗"},
    ):
        response = client.get("/api/countries/JP/safety")
    data = response.json()
    assert "summary" in data
    assert len(data["summary"]) > 0


def test_safety_has_details(client: TestClient):
    with patch(
        "app.services.mofa_service.MofaSafetyService.get_safety_info",
        new_callable=AsyncMock,
        return_value=MOCK_SAFETY,
    ), patch(
        "app.services.state_dept_service.StateDeptService.get_advisory",
        new_callable=AsyncMock,
        return_value={"level": 0, "message": "情報取得失敗"},
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


# ── XML解析ユニットテスト ─────────────────────────────────────────

class TestXmlParsing:
    def test_xml_parse_level4(self):
        from app.services.mofa_service import _parse_xml
        xml = (
            '<?xml version="1.0"?>'
            "<opendata><riskLevel4>1</riskLevel4><riskLevel3>0</riskLevel3>"
            "<riskLevel2>0</riskLevel2><riskLevel1>0</riskLevel1>"
            "<riskTitle>\u30a6\u30af\u30e9\u30a4\u30ca\u306e\u5371\u967a\u60c5\u5831</riskTitle>"
            "<riskLead>\u5168\u571f\u306b\u9000\u907f\u52e7\u544a</riskLead></opendata>"
        ).encode("utf-8")
        level, summary = _parse_xml(xml)
        assert level == 4

    def test_xml_parse_level1(self):
        from app.services.mofa_service import _parse_xml
        xml = (
            '<?xml version="1.0"?>'
            "<opendata><riskLevel4>0</riskLevel4><riskLevel3>0</riskLevel3>"
            "<riskLevel2>0</riskLevel2><riskLevel1>1</riskLevel1>"
            "<riskTitle>\u30ab\u30b6\u30d5\u30b9\u30bf\u30f3\u306e\u5371\u967a\u60c5\u5831</riskTitle></opendata>"
        ).encode("utf-8")
        level, _ = _parse_xml(xml)
        assert level == 1

    def test_xml_parse_level0(self):
        from app.services.mofa_service import _parse_xml
        xml = (
            '<?xml version="1.0"?>'
            "<opendata><riskLevel4>0</riskLevel4><riskLevel3>0</riskLevel3>"
            "<riskLevel2>0</riskLevel2><riskLevel1>0</riskLevel1></opendata>"
        ).encode("utf-8")
        level, _ = _parse_xml(xml)
        assert level == 0

    def test_xml_parse_highest_wins(self):
        from app.services.mofa_service import _parse_xml
        xml = (
            '<?xml version="1.0"?>'
            "<opendata><riskLevel4>0</riskLevel4><riskLevel3>1</riskLevel3>"
            "<riskLevel2>1</riskLevel2><riskLevel1>1</riskLevel1>"
            "<riskTitle>\u30bf\u30a4\u306e\u5371\u967a\u60c5\u5831</riskTitle></opendata>"
        ).encode("utf-8")
        level, _ = _parse_xml(xml)
        assert level == 3


# ── State Dept 統合テスト ─────────────────────────────────────────

class TestStateDeptIntegration:
    def test_state_dept_higher_level_adopted(self, client):
        mofa_data = {**MOCK_SAFETY, "level": 1, "level_label": "十分注意"}
        state_data = {"level": 3, "message": "Reconsider Travel"}
        with patch(
            "app.services.mofa_service.MofaSafetyService.get_safety_info",
            new_callable=AsyncMock,
            return_value=mofa_data,
        ), patch(
            "app.services.state_dept_service.StateDeptService.get_advisory",
            new_callable=AsyncMock,
            return_value=state_data,
        ):
            response = client.get("/api/countries/XX/safety")
        assert response.json()["level"] == 3

    def test_state_dept_lower_level_not_adopted(self, client):
        mofa_data = {**MOCK_SAFETY, "level": 4, "level_label": "退避勧告"}
        state_data = {"level": 1, "message": "Exercise Normal Precautions"}
        with patch(
            "app.services.mofa_service.MofaSafetyService.get_safety_info",
            new_callable=AsyncMock,
            return_value=mofa_data,
        ), patch(
            "app.services.state_dept_service.StateDeptService.get_advisory",
            new_callable=AsyncMock,
            return_value=state_data,
        ):
            response = client.get("/api/countries/YY/safety")
        assert response.json()["level"] == 4

    def test_state_dept_message_added_to_details(self, client):
        mofa_data = dict(MOCK_SAFETY)
        state_data = {"level": 2, "message": "Exercise Increased Caution"}
        with patch(
            "app.services.mofa_service.MofaSafetyService.get_safety_info",
            new_callable=AsyncMock,
            return_value=mofa_data,
        ), patch(
            "app.services.state_dept_service.StateDeptService.get_advisory",
            new_callable=AsyncMock,
            return_value=state_data,
        ):
            response = client.get("/api/countries/ZZ/safety")
        categories = [d["category"] for d in response.json()["details"]]
        assert "米国国務省渡航情報" in categories

    def test_state_dept_failure_graceful(self, client):
        with patch(
            "app.services.mofa_service.MofaSafetyService.get_safety_info",
            new_callable=AsyncMock,
            return_value=MOCK_SAFETY,
        ), patch(
            "app.services.state_dept_service.StateDeptService.get_advisory",
            new_callable=AsyncMock,
            side_effect=Exception("network error"),
        ):
            response = client.get("/api/countries/JP/safety")
        assert response.status_code == 200
        assert response.json()["level"] == 0
