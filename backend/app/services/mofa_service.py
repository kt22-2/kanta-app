"""外務省 海外安全情報サービス（XML OpenData API版）
URL: https://www.ezairyu.mofa.go.jp/opendata/country/{4桁電話コード}.xml
6時間インメモリキャッシュ付き
"""
from __future__ import annotations

import time
import xml.etree.ElementTree as ET

import httpx

# 危険レベルラベル
LEVEL_LABELS = {
    0: "安全",
    1: "十分注意",
    2: "不要不急の渡航中止",
    3: "渡航中止勧告",
    4: "退避勧告",
}

# レベル別デフォルトサマリー
LEVEL_SUMMARIES = {
    0: "現在、この国への危険情報は発出されていません。旅行前に最新の安全情報を確認してください。",
    1: "十分注意が必要です。外務省の最新情報を確認し、安全対策を徹底してください。",
    2: "不要不急の渡航は止めてください。渡航する場合は万全の安全対策が必要です。",
    3: "渡航は止めてください。現在、この国への渡航を中止するよう勧告しています。",
    4: "退避してください。この国への渡航は止め、現地に滞在中の方は速やかに退避してください。",
}

# ISO 2文字コード → 外務省XMLオープンデータ用電話コード（4桁ゼロパディング）
# 一部は外務省独自コード
ISO_TO_MOFA_XML: dict[str, str] = {
    # アジア・太平洋
    "IN": "0091", "ID": "0062", "KH": "0855", "LK": "0094",
    "TH": "0066", "CN": "0086", "NP": "0977", "PK": "0092",
    "BD": "0880", "PH": "0063", "HK": "0852", "MY": "0060",
    "MM": "0095", "LA": "0856", "VN": "0084", "SG": "0065",
    "KR": "0082", "MN": "0976", "BT": "0975", "TL": "0670",
    "AF": "0093", "TW": "0886",
    # 中東
    "AE": "0971", "YE": "0967", "IL": "0972", "IQ": "0964",
    "IR": "0098", "OM": "0968", "QA": "0974", "KW": "0965",
    "SA": "0966", "SY": "0963", "TR": "0090", "BH": "0973",
    "JO": "0962", "LB": "0961", "PS": "0970",
    # 欧州
    "DE": "0049", "FR": "0033", "GB": "0044", "IT": "0039",
    "ES": "0034", "NL": "0031", "BE": "0032", "CH": "0041",
    "AT": "0043", "SE": "0046", "NO": "0047", "DK": "0045",
    "FI": "0358", "PL": "0048", "CZ": "0420", "HU": "0036",
    "RO": "0040", "GR": "0030", "PT": "0351",
    "RU": "9007",  # 外務省独自コード
    "UA": "0380", "BY": "0375", "MD": "0373",
    "LT": "0370", "LV": "0371", "EE": "0372",
    "RS": "0381", "HR": "0385", "SI": "0386", "BA": "0387",
    "MK": "0389", "SK": "0421", "BG": "0359", "AL": "0355",
    # 中央アジア
    "TJ": "0992", "TM": "0993", "AZ": "0994", "GE": "0995",
    "KG": "0996", "UZ": "0998", "KZ": "0007", "AM": "0374",
    "XK": "0383",  # コソボ
    # 南北アメリカ
    "US": "1000",  # 外務省独自コード（本土）
    "CA": "9001",  # 外務省独自コード
    "MX": "0052", "BR": "0055", "AR": "0054", "CL": "0056",
    "CO": "0057", "PE": "0051", "VE": "0058", "EC": "0593",
    "BO": "0591", "PY": "0595", "UY": "0598",
    "GT": "0502", "HN": "0504", "SV": "0503", "NI": "0505",
    "CR": "0506", "PA": "0507", "CU": "0053", "HT": "0509",
    "BZ": "0501", "GY": "0592",
    # アフリカ
    "ZA": "0027", "EG": "0020", "NG": "0234", "KE": "0254",
    "ET": "0251", "TZ": "0255", "GH": "0233", "MA": "0212",
    "TN": "0216", "LY": "0218", "DZ": "0213", "SD": "0249",
    "SS": "0211", "CD": "0243", "CG": "0242", "AO": "0244",
    "MZ": "0258", "ZW": "0263", "ZM": "0260", "SO": "0252",
    "ML": "0223", "BF": "0226", "NE": "0227", "TD": "0235",
    "CF": "0236", "CM": "0237", "GA": "0241", "CI": "0225",
    "SN": "0221", "GN": "0224", "MR": "0222", "GM": "0220",
    "SL": "0232", "LR": "0231", "TG": "0228", "BJ": "0229",
    "RW": "0250", "BI": "0257", "UG": "0256", "MW": "0265",
    "MG": "0261", "NA": "0264", "ER": "0291", "DJ": "0253",
    "GW": "0245",
    # オセアニア
    "AU": "0061", "NZ": "0064", "PG": "0675", "FJ": "0679",
    "SB": "0677",
}

MOFA_XML_BASE_URL = "https://www.ezairyu.mofa.go.jp/opendata/country/{code}.xml"
CACHE_TTL = 6 * 3600  # 6時間

_cache: dict[str, tuple[dict, float]] = {}


def _parse_xml(xml_bytes: bytes) -> tuple[int, str]:
    """外務省XMLオープンデータから最高危険レベルとサマリーを抽出する。
    XML構造: <riskLevel4>1/0</riskLevel4>, <riskLevel3>1/0</riskLevel3>, ...
    """
    try:
        root = ET.fromstring(xml_bytes)
    except ET.ParseError:
        return 1, LEVEL_SUMMARIES[1]

    for lvl in [4, 3, 2, 1]:
        el = root.find(f"riskLevel{lvl}")
        if el is not None and (el.text or "").strip() == "1":
            title_el = root.find("riskTitle")
            lead_el = root.find("riskLead")
            parts = []
            if title_el is not None and title_el.text:
                parts.append(title_el.text.strip())
            if lead_el is not None and lead_el.text:
                parts.append(lead_el.text.strip()[:150])
            summary = "。".join(parts) if parts else LEVEL_SUMMARIES[lvl]
            return lvl, summary[:200]

    return 0, LEVEL_SUMMARIES[0]


async def _fetch_xml(mofa_code: str) -> bytes | None:
    """外務省XMLオープンデータを取得する。HTMLが返った場合はNone（安全国）。"""
    url = MOFA_XML_BASE_URL.format(code=mofa_code)
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(url, follow_redirects=True)
        resp.raise_for_status()
        content_type = resp.headers.get("content-type", "")
        if "text/html" in content_type:
            return None  # XMLなし → 安全国
        return resp.content


class MofaSafetyService:
    """外務省海外安全情報を取得するサービス（6時間キャッシュ）"""

    async def get_safety_info(self, country_code: str) -> dict:
        code = country_code.upper()
        now = time.monotonic()

        # キャッシュヒット確認
        if code in _cache:
            cached_data, cached_at = _cache[code]
            if now - cached_at < CACHE_TTL:
                return cached_data

        mofa_code = ISO_TO_MOFA_XML.get(code)
        if mofa_code is None:
            # マッピングなし → レベル0（危険情報なし）
            result = _build_response(code, 0, LEVEL_SUMMARIES[0])
        else:
            try:
                xml_bytes = await _fetch_xml(mofa_code)
                if xml_bytes is None:
                    result = _build_response(code, 0, LEVEL_SUMMARIES[0])
                else:
                    level, summary = _parse_xml(xml_bytes)
                    result = _build_response(code, level, summary)
            except Exception:
                result = _build_response(code, 1, LEVEL_SUMMARIES[1])

        _cache[code] = (result, now)
        return result


def _build_response(code: str, level: int, summary: str) -> dict:
    """SafetyInfoレスポンス辞書を構築する"""
    details = [
        {
            "category": "外務省危険情報",
            "description": summary,
            "severity": _level_to_severity(level),
        }
    ]
    return {
        "country_code": code,
        "level": level,
        "level_label": LEVEL_LABELS.get(level, "不明"),
        "summary": summary,
        "details": details,
        "last_updated": None,
    }


def _level_to_severity(level: int) -> str:
    """危険レベルを severity 文字列に変換する"""
    if level == 0:
        return "low"
    elif level <= 2:
        return "medium"
    else:
        return "high"
