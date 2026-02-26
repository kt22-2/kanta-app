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

# 広域情報のtypeCdカテゴリマッピング
WIDEAREA_CATEGORIES = {
    "C50": "テロ情報",
    "C51": "感染症情報",
    "C52": "広域情報",
}

# ISO 2文字コード → 外務省XMLオープンデータ用コード（4桁ゼロパディング）
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
    "RU": "9007",
    "UA": "0380", "BY": "0375", "MD": "0373",
    "LT": "0370", "LV": "0371", "EE": "0372",
    "RS": "0381", "HR": "0385", "SI": "0386", "BA": "0387",
    "MK": "0389", "SK": "0421", "BG": "0359", "AL": "0355",
    # 中央アジア
    "TJ": "0992", "TM": "0993", "AZ": "0994", "GE": "0995",
    "KG": "0996", "UZ": "0998", "KZ": "0007", "AM": "0374",
    "XK": "0383",
    # 南北アメリカ
    "US": "1000",
    "CA": "9001",
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


def _get_text(root: ET.Element, tag: str) -> str:
    """XMLタグのテキストを安全に取得する"""
    el = root.find(tag)
    return el.text.strip() if el is not None and el.text else ""


def _parse_xml(xml_bytes: bytes) -> dict:
    """外務省XMLオープンデータから安全情報を詳細に抽出する。"""
    try:
        root = ET.fromstring(xml_bytes)
    except ET.ParseError:
        return {
            "level": 1, "summary": LEVEL_SUMMARIES[1],
            "details": [], "mofa_url": None,
            "infection_level": 0, "safety_measure_url": None,
        }

    # --- 危険レベル ---
    level = 0
    for lvl in [4, 3, 2, 1]:
        el = root.find(f"riskLevel{lvl}")
        if el is not None and (el.text or "").strip() == "1":
            level = lvl
            break

    # --- サマリー ---
    title = _get_text(root, "riskTitle")
    lead = _get_text(root, "riskLead")
    parts = []
    if title:
        parts.append(title)
    if lead:
        parts.append(lead[:200])
    summary = "。".join(parts) if parts else LEVEL_SUMMARIES[level]

    # --- 外務省ページURL ---
    mofa_url = _get_text(root, "riskUrl") or None

    # --- 安全対策ページURL ---
    safety_measure_url = _get_text(root, "safetyMeasureUrl") or None

    # --- 感染症レベル ---
    infection_level = 0
    for lvl in [4, 3, 2, 1]:
        el = root.find(f"infectionLevel{lvl}")
        if el is not None and (el.text or "").strip() == "1":
            infection_level = lvl
            break

    # --- details 配列構築 ---
    details: list[dict] = []

    # 危険情報メイン
    if level > 0 and summary:
        details.append({
            "category": "外務省危険情報",
            "description": summary[:300],
            "severity": _level_to_severity(level),
        })

    # 感染症情報
    if infection_level > 0:
        desc = f"感染症危険レベル{infection_level}が発出されています。"
        details.append({
            "category": "感染症情報",
            "description": desc,
            "severity": _level_to_severity(infection_level),
        })

    # 広域情報（テロ・感染症等）― タイトル重複を排除
    seen_titles: set[str] = set()
    for spot in root.findall(".//wideareaSpot"):
        type_cd = _get_text(spot, "typeCd")
        spot_title = _get_text(spot, "title")
        spot_lead = _get_text(spot, "lead")
        if not spot_title or spot_title in seen_titles:
            continue
        seen_titles.add(spot_title)
        category = WIDEAREA_CATEGORIES.get(type_cd, "広域情報")
        desc = spot_title
        if spot_lead:
            desc += f"。{spot_lead[:150]}"
        details.append({
            "category": category,
            "description": desc[:300],
            "severity": "medium",
        })
        if len(details) >= 8:
            break

    # 領事メール（最新3件）― タイトル重複を排除
    mails = root.findall(".//mail")
    for mail in mails[:6]:
        mail_title = _get_text(mail, "title")
        mail_lead = _get_text(mail, "lead")
        mail_date = _get_text(mail, "leaveDate")
        if not mail_title or mail_title in seen_titles:
            continue
        seen_titles.add(mail_title)
        desc = mail_title
        if mail_lead:
            desc += f"。{mail_lead[:150]}"
        if mail_date:
            desc = f"[{mail_date[:10]}] {desc}"
        details.append({
            "category": "領事メール",
            "description": desc[:300],
            "severity": "low",
        })

    # レベル0で details が空の場合
    if not details:
        details.append({
            "category": "外務省危険情報",
            "description": LEVEL_SUMMARIES[level],
            "severity": "low",
        })

    return {
        "level": level,
        "summary": summary[:300],
        "details": details,
        "mofa_url": mofa_url,
        "infection_level": infection_level,
        "safety_measure_url": safety_measure_url,
    }


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

        if code in _cache:
            cached_data, cached_at = _cache[code]
            if now - cached_at < CACHE_TTL:
                return cached_data

        mofa_code = ISO_TO_MOFA_XML.get(code)
        if mofa_code is None:
            result = _build_response(code, 0, LEVEL_SUMMARIES[0])
        else:
            try:
                xml_bytes = await _fetch_xml(mofa_code)
                if xml_bytes is None:
                    result = _build_response(code, 0, LEVEL_SUMMARIES[0])
                else:
                    parsed = _parse_xml(xml_bytes)
                    result = {
                        "country_code": code,
                        "level": parsed["level"],
                        "level_label": LEVEL_LABELS.get(parsed["level"], "不明"),
                        "summary": parsed["summary"],
                        "details": parsed["details"],
                        "last_updated": None,
                        "mofa_url": parsed["mofa_url"],
                        "infection_level": parsed["infection_level"],
                        "safety_measure_url": parsed["safety_measure_url"],
                    }
            except Exception:
                result = _build_response(code, 1, LEVEL_SUMMARIES[1])

        _cache[code] = (result, now)
        return result


def _build_response(code: str, level: int, summary: str) -> dict:
    """SafetyInfoレスポンス辞書を構築する（フォールバック用）"""
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
        "mofa_url": None,
        "infection_level": 0,
        "safety_measure_url": None,
    }


def _level_to_severity(level: int) -> str:
    """危険レベルを severity 文字列に変換する"""
    if level == 0:
        return "low"
    elif level <= 2:
        return "medium"
    else:
        return "high"
