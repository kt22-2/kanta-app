"""観光スポット情報生成サービス（Claude AI または静的データ）"""
from __future__ import annotations
import json
import re

from app.core.config import settings

# インメモリキャッシュ（観光情報は頻繁に変わらないため長めにキャッシュ）
_attractions_cache: dict[str, dict] = {}

# 国別の静的観光情報データ（Claude APIが使えない場合のフォールバック）
_STATIC_DATA: dict[str, dict] = {
    "JP": {
        "ai_summary": [
            {"name": "富士山", "description": "日本のシンボルであり、世界文化遺産にも登録された標高3776mの活火山。5合目までバスでアクセス可能で、夏季は登山も楽しめる。", "category": "自然", "highlights": ["日本最高峰", "世界文化遺産", "ご来光"]},
            {"name": "京都・嵐山", "description": "竹林の小径や渡月橋で有名な京都西郊の景勝地。天龍寺など多くの寺社が集まり、四季折々の自然美が楽しめる。", "category": "文化", "highlights": ["竹林の小径", "渡月橋", "天龍寺"]},
            {"name": "沖縄・慶良間諸島", "description": "「ケラマブルー」と呼ばれる透明度抜群の海が広がる離島群。世界有数のダイビングスポットとして知られる。", "category": "アドベンチャー", "highlights": ["ケラマブルー", "ダイビング", "ウミガメ"]},
            {"name": "屋久島", "description": "樹齢7200年の縄文杉が鎮座する世界自然遺産の島。苔むす原生林トレッキングは冒険心をくすぐる絶景体験。", "category": "自然", "highlights": ["縄文杉", "世界自然遺産", "原生林トレッキング"]},
            {"name": "東京・渋谷・新宿", "description": "世界最大規模のスクランブル交差点や最先端のポップカルチャーが集まる東京の繁華街。夜景や食文化も充実。", "category": "都市", "highlights": ["スクランブル交差点", "ナイトライフ", "ストリートフード"]},
        ],
        "best_season": "春（3〜5月）の桜シーズンと秋（9〜11月）の紅葉シーズンが特に美しい。夏は花火大会や祭りが多い。",
        "travel_tips": [
            "ICカード（Suica / ICOCA）を購入すると電車・バス移動が格段に便利になります。",
            "コンビニ（セブン・ファミマ・ローソン）はATMも兼ねており、24時間利用可能で非常に便利です。",
            "飲食店でのチップは不要。むしろ渡すと失礼になることもあります。",
            "地震対策として宿泊先の避難経路を確認しておきましょう。",
            "SIMフリーのポケットWi-Fiをレンタルするとどこでもネット接続できます。",
        ],
    },
    "US": {
        "ai_summary": [
            {"name": "グランドキャニオン", "description": "コロラド川が数百万年かけて刻んだ全長446kmの大峡谷。ヘリコプターツアーやラフティングなど冒険的な体験が充実。", "category": "自然", "highlights": ["世界遺産", "ヘリコプターツアー", "ラフティング"]},
            {"name": "イエローストーン国立公園", "description": "世界初の国立公園。間欠泉「オールド・フェイスフル」やバイソンの群れなど、野生の自然が色濃く残る。", "category": "自然", "highlights": ["間欠泉", "野生動物", "温泉地帯"]},
            {"name": "ニューヨーク・マンハッタン", "description": "自由の女神、タイムズスクエア、セントラルパークなど世界的名所が集中。食文化・芸術・エンタメの最前線。", "category": "都市", "highlights": ["自由の女神", "タイムズスクエア", "ブロードウェイ"]},
            {"name": "ラスベガス", "description": "砂漠に突如現れる不夜城。カジノ、世界クラスのショー、美食レストランが集積するエンタメ都市。", "category": "都市", "highlights": ["カジノ", "ショー", "グランドキャニオンへのアクセス拠点"]},
            {"name": "ハワイ・ビッグアイランド", "description": "活火山キラウエアが今も噴火を続ける島。溶岩フィールドのトレッキングは他の国立公園では体験できない体験。", "category": "アドベンチャー", "highlights": ["キラウエア火山", "溶岩トレッキング", "星空観察"]},
        ],
        "best_season": "地域によって異なるが、春（4〜5月）と秋（9〜10月）が気候的に過ごしやすい。夏は観光ピークで混雑する。",
        "travel_tips": [
            "チップ文化が根付いており、レストランでは請求額の15〜20%が目安です。",
            "医療費が非常に高いため、旅行保険への加入は必須です。",
            "広大な国土のため、移動手段として国内線や長距離バス（グレイハウンド）の利用を検討しましょう。",
            "州によってガンの規制・大麻規制などルールが異なります。",
            "クレジットカードはほぼ全店舗で使用可能。現金はほぼ不要です。",
        ],
    },
    "FR": {
        "ai_summary": [
            {"name": "エッフェル塔", "description": "パリの象徴。夜間のライトアップは特に幻想的で、毎時間5分間の点滅イルミネーションは世界的に有名。", "category": "歴史", "highlights": ["夜間ライトアップ", "展望台", "セーヌ川クルーズとの組み合わせ"]},
            {"name": "ルーヴル美術館", "description": "世界最大級の美術館。モナ・リザやミロのヴィーナスなど3万5千点以上の作品を所蔵。事前予約必須。", "category": "文化", "highlights": ["モナ・リザ", "ミロのヴィーナス", "世界最大の美術館"]},
            {"name": "モンサンミッシェル", "description": "満潮時に孤島となる幻想的な修道院島。ノルマンディー海岸の世界遺産で、満潮・干潮のタイミングに合わせた訪問が必須。", "category": "世界遺産", "highlights": ["満潮時の絶景", "中世の修道院", "世界遺産"]},
            {"name": "プロヴァンス・ラベンダー畑", "description": "7月にはヴァランソールなどの丘一面が紫に染まるラベンダー畑が広がる。レンタカーでの周遊がおすすめ。", "category": "自然", "highlights": ["ラベンダー畑", "7月が見頃", "ロゼワイン産地"]},
            {"name": "シャモニー・モンブラン", "description": "ヨーロッパ最高峰モンブランのお膝元。ロープウェイで標高3842mのエギーユ・デュ・ミディへアクセスでき、雄大なアルプスを一望できる。", "category": "アドベンチャー", "highlights": ["モンブラン", "ロープウェイ", "スキー・ハイキング"]},
        ],
        "best_season": "春（4〜6月）と初秋（9〜10月）が観光に最適。7〜8月は混雑と猛暑に注意。ラベンダーは7月が見頃。",
        "travel_tips": [
            "パリの地下鉄（メトロ）は10枚回数券（carnet）を購入すると割安になります。",
            "レストランでのランチはプリフィクスメニューを利用するとコスパよく食事できます。",
            "スリに注意。特にエッフェル塔周辺や地下鉄内では貴重品管理を徹底してください。",
            "多くの美術館は月曜または火曜が定休日。事前に確認を。",
            "フランス語で「ボンジュール（Bonjour）」と一言挨拶するだけで現地の人の態度が変わります。",
        ],
    },
    "TH": {
        "ai_summary": [
            {"name": "バンコク王宮・ワット・プラケオ", "description": "エメラルド仏を祀るタイ最神聖の寺院と宮殿群。金色に輝く仏塔と精緻な装飾は圧巻の美しさ。", "category": "宗教", "highlights": ["エメラルド仏", "王宮", "チャオプラヤー川クルーズとの組み合わせ"]},
            {"name": "チェンマイ山岳トレッキング", "description": "ドイインタノン国立公園でのトレッキングや少数民族の村訪問など、バンコクとは全く異なる北タイの自然と文化を体験。", "category": "アドベンチャー", "highlights": ["少数民族の村", "象乗り体験", "タイ最高峰"]},
            {"name": "クラビ・ライレイビーチ", "description": "石灰岩の断崖に囲まれた秘境ビーチ。船でしかアクセスできず、エメラルドグリーンの海とロッククライミングが楽しめる。", "category": "アドベンチャー", "highlights": ["秘境ビーチ", "ロッククライミング", "スノーケリング"]},
            {"name": "アユタヤ遺跡", "description": "14世紀から18世紀まで繁栄したアユタヤ王朝の首都遺跡群。木に覆われた仏頭など独特の景観が世界遺産に登録。", "category": "世界遺産", "highlights": ["木の根に覆われた仏頭", "世界遺産", "バンコクから日帰り可"]},
            {"name": "コ・タオ・ダイビング", "description": "世界最安値級のダイビングライセンス取得地として有名。透明度が高くウミガメも多い初心者に最適なダイビングスポット。", "category": "アドベンチャー", "highlights": ["格安ダイビングライセンス", "ウミガメ", "美しいサンゴ礁"]},
        ],
        "best_season": "11月〜2月が乾季で最も快適。3〜5月は酷暑、6〜10月は雨季（南部は特に雨量多）。",
        "travel_tips": [
            "仏像や寺院での撮影時は肌の露出に注意。タンクトップや短パンでは入場不可な寺院も多い。",
            "タクシーはメーター使用を必ず要求。「いくら？」と先に聞いてくる運転手は避けましょう。",
            "屋台料理は衛生面より混雑している店（地元民が多い）を選ぶ方が安全で美味しい。",
            "水道水は飲めないためペットボトル水を常備する。コンビニで安価に購入可能。",
            "グラブ（Grab）アプリが配車サービスとして非常に便利。ぼったくり防止にもなる。",
        ],
    },
    "IT": {
        "ai_summary": [
            {"name": "コロッセオ（ローマ）", "description": "古代ローマ最大の円形闘技場。収容人数5万人の巨大建造物で、地下通路や剣闘士の控え室も見学可能。", "category": "歴史", "highlights": ["古代ローマ最大の闘技場", "地下見学ツアー", "フォロ・ロマーノとセット"]},
            {"name": "ヴェネツィア水上都市", "description": "118の島に170本の運河が走る水上都市。ゴンドラでの運河巡りやカーニバル時期の仮面祭は世界的に有名。", "category": "文化", "highlights": ["ゴンドラ", "カーニバル（2月）", "サン・マルコ広場"]},
            {"name": "アマルフィ海岸", "description": "断崖絶壁に張り付く色鮮やかな村々が続くイタリア南部の絶景海岸。レモンチェッロの産地でもある。", "category": "自然", "highlights": ["絶景ドライブ", "レモンチェッロ", "世界遺産"]},
            {"name": "ドロミーティ山塊", "description": "ユネスコ世界自然遺産の石灰岩山群。夏はハイキング、冬はスキーリゾートとして世界中の冒険者が集まる。", "category": "アドベンチャー", "highlights": ["世界自然遺産", "ハイキング・スキー", "「Via Ferrata」ルート"]},
            {"name": "シチリア島・エトナ山", "description": "ヨーロッパ最大の活火山で、今も噴煙を上げる。ガイドツアーでの山頂アタックは唯一無二の体験。", "category": "アドベンチャー", "highlights": ["活火山", "山頂トレッキング", "火口見学"]},
        ],
        "best_season": "春（4〜6月）と秋（9〜10月）が観光に最適。7〜8月はローマ・南部が酷暑で観光客も最多。",
        "travel_tips": [
            "コロッセオ・ウフィツィ美術館などは事前オンライン予約が必須。当日券は長蛇の列。",
            "スリが非常に多い。リュックは前に抱える、財布はフロントポケットへ。",
            "バール（BAR）での立ち飲みコーヒーはテーブル席の半額以下。地元スタイルを体験しよう。",
            "レストランのコペルト（席料）は1〜3ユーロ/人が相場。サービス料とは別です。",
            "公共交通のバリデート（刻印）を忘れると無賃乗車扱いで罰金になります。",
        ],
    },
}


class AIService:
    def __init__(self) -> None:
        self._client = None

    @property
    def client(self):
        if self._client is None and settings.anthropic_api_key:
            try:
                import anthropic
                self._client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
            except Exception:
                self._client = None
        return self._client

    async def generate_attractions(self, country_code: str, country_name: str) -> dict:
        cache_key = country_code.upper()
        if cache_key in _attractions_cache:
            return _attractions_cache[cache_key]

        # Anthropic APIが利用可能な場合はAI生成を試みる
        if self.client:
            result = await self._generate_with_ai(country_code, country_name)
            if result:
                _attractions_cache[cache_key] = result
                return result

        # 静的データを使用
        result = self._get_static_data(country_code, country_name)
        _attractions_cache[cache_key] = result
        return result

    async def _generate_with_ai(self, country_code: str, country_name: str) -> dict | None:
        """Claude AIで観光情報を生成する。失敗時はNoneを返す。"""
        prompt = f"""\
{country_name}（国コード: {country_code}）を旅行する日本人旅行者向けに、観光情報をJSON形式で提供してください。

以下のJSONフォーマットで回答してください（JSONのみ、他のテキストなし）:
{{
  "ai_summary": [
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
            json_match = re.search(r"\{[\s\S]*\}", raw_text)
            if json_match:
                raw_text = json_match.group()
            data = json.loads(raw_text)
            return {
                "country_code": country_code.upper(),
                "country_name": country_name,
                **data,
            }
        except Exception:
            return None

    def _get_static_data(self, country_code: str, country_name: str) -> dict:
        """静的データまたはデフォルトフォールバックを返す。"""
        code = country_code.upper()
        if code in _STATIC_DATA:
            return {
                "country_code": code,
                "country_name": country_name,
                **_STATIC_DATA[code],
            }
        # 静的データもない場合の汎用フォールバック
        return {
            "country_code": code,
            "country_name": country_name,
            "ai_summary": [],
            "best_season": None,
            "travel_tips": [
                "旅行前に現地の気候・治安情報を確認してください。",
                "現地通貨と旅行保険の準備をお忘れなく。",
                "外務省の海外安全情報も必ずチェックしてください。",
            ],
        }
