# KANTA - 世界一周旅行者向け情報アプリ

海外で世界一周中の旅行者向けに、安全情報・入国要件・国基本情報・観光スポットを提供するアプリ。

## 構成

```
kanta-app/
├── backend/    # FastAPI (Python 3.11+)
├── frontend/   # Next.js 15 + TypeScript + Tailwind CSS
└── android/    # Kotlin + Jetpack Compose (Clean Architecture)
```

## デザインテーマ

30代男性・世界一周の冒険をテーマにしたダークモバイルファーストデザイン。

## セットアップ

### バックエンド

```bash
cd backend
pip install -e ".[dev]"
cp .env.example .env    # ANTHROPIC_API_KEY を設定
uvicorn app.main:app --reload
```

### フロントエンド

```bash
cd frontend
npm install
cp .env.local.example .env.local    # 必要に応じてAPIのURLを変更
npm run dev
```

### Android

Android Studio で `android/` ディレクトリを開いてビルド。
`android/app/build.gradle.kts` の `API_BASE_URL` を実際のバックエンドURLに変更。

## API エンドポイント

| エンドポイント | 説明 |
|---|---|
| `GET /api/countries` | 国一覧（`?q=検索語&region=Asia`） |
| `GET /api/countries/{code}` | 国詳細 |
| `GET /api/countries/{code}/safety` | 安全情報 |
| `GET /api/countries/{code}/entry` | 入国要件 |
| `GET /api/countries/{code}/attractions` | 観光スポット（AI生成） |
| `GET /health` | ヘルスチェック |

## テスト

```bash
# バックエンド
cd backend && python -m pytest tests/ -v

# フロントエンド
cd frontend && npm test
```

## 技術スタック

### バックエンド
- FastAPI + Uvicorn
- httpx（非同期HTTPクライアント）
- Pydantic v2
- Anthropic Claude API（観光スポット生成）
- RestCountries API（国基本情報）

### フロントエンド
- Next.js 15 (App Router)
- TypeScript + Tailwind CSS v4
- SWR（データフェッチ・キャッシュ）
- lucide-react（アイコン）

### Android
- Jetpack Compose
- MVVM + Clean Architecture
- Hilt（依存性注入）
- Retrofit + Room（API通信・オフラインキャッシュ）
- Coil（国旗画像読み込み）

> Swift/iOS移植を想定した設計で、各クラスに対応するSwift/SwiftUIのコメントを記載。
