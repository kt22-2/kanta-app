"""Claude AI を使った観光スポット情報生成サービス"""
from __future__ import annotations
import json
import re

import anthropic

from app.core.config import settings

# インメモリキャッシュ（観光情報は頻繁に変わらないため長めにキャッシュ）
_attractions_cache: dict[str, dict] = {}


class AIService:
    def __init__(self) -> None:
        self._client: anthropic.Anthropic | None = None

    @property
    def client(self) -> anthropic.Anthropic:
        if self._client is None:
            self._client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
        return self._client

    async def generate_attractions(self, country_code: str, country_name: str) -> dict:
        cache_key = country_code.upper()
        if cache_key in _attractions_cache:
            return _attractions_cache[cache_key]

        prompt = f"""\
{country_name}（国コード: {country_code}）を旅行する日本人旅行者向けに、観光情報をJSON形式で提供してください。

以下のJSONフォーマットで回答してください（JSONのみ、他のテキストなし）:
{{
  "attractions": [
    {{
      "name": "観光地名",
      "description": "100文字程度の説明",
      "category": "自然|文化|歴史|食|アドベンチャー|都市|宗教|世界遺産",
      "highlights": ["見どころ1", "見どころ2", "見どころ3"]
    }}
  ],
  "best_season": "ベストシーズンの説明（例: 春（3-5月）と秋（9-11月）が過ごしやすい）",
  "travel_tips": [
    "旅行のコツ1",
    "旅行のコツ2",
    "旅行のコツ3",
    "旅行のコツ4",
    "旅行のコツ5"
  ]
}}

観光スポットは5〜8か所を厳選してください。特に冒険心のある30代男性が興味を持つようなスポットを含めてください。"""

        try:
            message = self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=2000,
                messages=[{"role": "user", "content": prompt}],
            )
            raw_text = message.content[0].text.strip()
            # JSONブロック抽出
            json_match = re.search(r"\{[\s\S]*\}", raw_text)
            if json_match:
                raw_text = json_match.group()
            attractions_data = json.loads(raw_text)
        except Exception:
            # AI生成失敗時のフォールバック
            attractions_data = {
                "attractions": [
                    {
                        "name": f"{country_name}の主要観光地",
                        "description": f"{country_name}を代表する観光スポットです。",
                        "category": "文化",
                        "highlights": ["現地文化", "歴史的建造物", "地元料理"],
                    }
                ],
                "best_season": "現地の観光局にお問い合わせください。",
                "travel_tips": [
                    "旅行前に現地の気候を確認してください。",
                    "現地通貨を用意しておくと便利です。",
                    "旅行保険への加入を強くお勧めします。",
                ],
            }

        result = {
            "country_code": country_code.upper(),
            "country_name": country_name,
            **attractions_data,
        }
        _attractions_cache[cache_key] = result
        return result
