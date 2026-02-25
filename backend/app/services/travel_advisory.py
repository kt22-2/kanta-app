"""渡航安全情報サービス（外務省APIラッパー + モックデータ）"""
from __future__ import annotations
from datetime import datetime

# 危険レベルラベル
LEVEL_LABELS = {
    0: "安全",
    1: "十分注意",
    2: "不要不急の渡航中止",
    3: "渡航中止勧告",
    4: "退避勧告",
}

# モック安全情報データ（主要国）
_MOCK_SAFETY: dict[str, dict] = {
    "JP": {
        "level": 0,
        "summary": "日本は治安が良く、一般的に旅行者にとって非常に安全な国です。自然災害（地震・台風）には注意が必要です。",
        "details": [
            {"category": "犯罪", "description": "犯罪率は非常に低い。スリや置き引きに軽微な注意は必要。", "severity": "low"},
            {"category": "自然災害", "description": "地震・台風が多い。気象情報を確認すること。", "severity": "medium"},
        ],
    },
    "US": {
        "level": 1,
        "summary": "アメリカは大都市での犯罪に注意が必要です。地域によって安全性が大きく異なります。",
        "details": [
            {"category": "犯罪", "description": "大都市の一部地区では犯罪が多い。夜間の一人歩きに注意。", "severity": "medium"},
            {"category": "銃犯罪", "description": "銃所持が一般的。人が集まる場所でも事件が起こりうる。", "severity": "medium"},
        ],
    },
    "FR": {
        "level": 1,
        "summary": "フランスはテロの脅威が継続しています。観光地・公共交通機関での荷物管理に注意してください。",
        "details": [
            {"category": "テロ", "description": "テロの脅威が継続。人の密集する場所では警戒を。", "severity": "medium"},
            {"category": "スリ・置き引き", "description": "観光地でのスリ被害が多い。貴重品管理を徹底。", "severity": "medium"},
        ],
    },
    "TH": {
        "level": 1,
        "summary": "タイは観光地として人気ですが、麻薬規制が厳しく、政情が不安定な場合があります。",
        "details": [
            {"category": "麻薬", "description": "薬物犯罪の刑罰が非常に厳しい。絶対に関わらないこと。", "severity": "high"},
            {"category": "詐欺", "description": "観光客を狙った詐欺が多い。格安ツアーなどに注意。", "severity": "medium"},
        ],
    },
    "UA": {
        "level": 4,
        "summary": "ウクライナはロシアとの武力紛争が継続しており、全土に退避勧告が発令されています。",
        "details": [
            {"category": "武力紛争", "description": "全土で戦闘・爆撃が継続。即時退避を強く勧告。", "severity": "high"},
            {"category": "インフラ", "description": "電気・水道・通信が不安定。", "severity": "high"},
        ],
    },
    "RU": {
        "level": 3,
        "summary": "ロシアへの渡航は中止を勧告しています。ウクライナ侵攻に関連するリスクがあります。",
        "details": [
            {"category": "政治情勢", "description": "ウクライナ侵攻により、外国人の拘束リスクがある。", "severity": "high"},
            {"category": "制裁", "description": "国際制裁により、金融・交通手段が制限される可能性。", "severity": "high"},
        ],
    },
}

_DEFAULT_SAFETY = {
    "level": 1,
    "summary": "この国の最新の渡航安全情報を外務省の海外安全情報で確認してください。",
    "details": [
        {"category": "一般", "description": "旅行前に最新の安全情報を確認してください。", "severity": "low"},
    ],
}

# モック入国要件データ
_MOCK_ENTRY: dict[str, dict] = {
    "JP": {"visa_required": False, "visa_on_arrival": False, "visa_free_days": 90, "passport_validity_months": 6, "notes": "日本国パスポートは多くの国でビザなし入国可能。"},
    "US": {"visa_required": True, "visa_on_arrival": False, "visa_free_days": None, "passport_validity_months": 6, "notes": "ESTA（電子渡航認証）が必要。事前にオンライン申請が必要です。"},
    "FR": {"visa_required": False, "visa_on_arrival": False, "visa_free_days": 90, "passport_validity_months": 3, "notes": "シェンゲン協定国。90日以内の滞在はビザ不要。"},
    "TH": {"visa_required": False, "visa_on_arrival": True, "visa_free_days": 30, "passport_validity_months": 6, "notes": "30日間はビザ不要。アライバルビザ（30日）も取得可能。"},
    "AU": {"visa_required": True, "visa_on_arrival": False, "visa_free_days": None, "passport_validity_months": 6, "notes": "ETA（電子渡航認証）が必要。オンラインで申請可能。"},
    "GB": {"visa_required": False, "visa_on_arrival": False, "visa_free_days": 180, "passport_validity_months": 6, "notes": "電子渡航認証（ETA）が2024年から必要になりました。"},
}

_DEFAULT_ENTRY = {
    "visa_required": True,
    "visa_on_arrival": False,
    "visa_free_days": None,
    "passport_validity_months": 6,
    "notes": "外務省または現地大使館に入国要件をご確認ください。",
}


class TravelAdvisoryService:
    def get_safety_info(self, country_code: str) -> dict:
        code = country_code.upper()
        base = _MOCK_SAFETY.get(code, _DEFAULT_SAFETY)
        level = base["level"]
        return {
            "country_code": code,
            "level": level,
            "level_label": LEVEL_LABELS.get(level, "不明"),
            "summary": base["summary"],
            "details": base["details"],
            "last_updated": None,
        }

    def get_entry_requirement(self, country_code: str) -> dict:
        code = country_code.upper()
        base = _MOCK_ENTRY.get(code, _DEFAULT_ENTRY)
        return {
            "country_code": code,
            **base,
        }
