import asyncio

from fastapi import APIRouter
from app.models.schemas import SafetyInfo, EntryRequirement
from app.services.travel_advisory import TravelAdvisoryService
from app.services.mofa_service import MofaSafetyService, LEVEL_LABELS, LEVEL_SUMMARIES, _level_to_severity
from app.services.state_dept_service import StateDeptService

router = APIRouter(prefix="/api/countries", tags=["safety"])
_travel_svc = TravelAdvisoryService()
_mofa_svc = MofaSafetyService()
_state_svc = StateDeptService()


@router.get("/{code}/safety", response_model=SafetyInfo)
async def get_safety_info(code: str):
    """外務省 + 米国国務省の安全情報を統合して返す"""
    mofa_task = _mofa_svc.get_safety_info(code)
    state_task = _state_svc.get_advisory(code)
    mofa_result, state_result = await asyncio.gather(
        mofa_task, state_task, return_exceptions=True
    )

    # MOFA フォールバック（通常は発生しない）
    if isinstance(mofa_result, Exception):
        mofa_result = {
            "country_code": code.upper(),
            "level": 1,
            "level_label": "十分注意",
            "summary": LEVEL_SUMMARIES[1],
            "details": [],
            "last_updated": None,
        }

    mofa_result = dict(mofa_result)
    mofa_result["details"] = list(mofa_result.get("details", []))

    # State Dept 統合
    if not isinstance(state_result, Exception):
        state_level = state_result.get("level", 0)
        # 両ソースの高い方のレベルを採用
        if state_level > mofa_result["level"]:
            mofa_result["level"] = state_level
            mofa_result["level_label"] = LEVEL_LABELS.get(state_level, "不明")

        # 有効なメッセージのみ details に追加
        msg = state_result.get("message", "")
        if msg and msg not in ("情報なし", "情報取得失敗"):
            mofa_result["details"].append({
                "category": "米国国務省渡航情報",
                "description": msg,
                "severity": _level_to_severity(state_level),
            })

    return mofa_result


@router.get("/{code}/entry", response_model=EntryRequirement)
async def get_entry_requirement(code: str):
    """入国要件情報を返す"""
    return _travel_svc.get_entry_requirement(code)
