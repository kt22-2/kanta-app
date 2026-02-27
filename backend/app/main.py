from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import countries, safety, attractions, news, x_posts
from app.core.config import settings
from app.core.http_client import get_http_client, close_http_client


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 起動時: httpx コネクションプール初期化
    get_http_client()
    yield
    # 終了時: httpx クライアントクローズ
    await close_http_client()


app = FastAPI(
    title="Kanta World Travel API",
    description="世界一周旅行者向け安全・入国・観光情報API",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS設定（フロントエンド・AndroidからのアクセスをAllow）
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ルーター登録
app.include_router(countries.router)
app.include_router(safety.router)
app.include_router(attractions.router)
app.include_router(news.router)
app.include_router(x_posts.router)


@app.get("/health", tags=["system"])
async def health_check():
    return {"status": "ok", "version": "0.1.0"}


@app.get("/api/search", tags=["search"])
async def search(q: str = ""):
    from app.services.restcountries import RestCountriesService
    svc = RestCountriesService()
    return await svc.get_all_countries(query=q)
