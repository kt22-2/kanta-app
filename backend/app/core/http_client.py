"""共有 httpx.AsyncClient のシングルトン管理

全サービスで同一のコネクションプールを共有し、
リクエスト毎のTCP接続確立/破棄のオーバーヘッドを削減する。
"""
from __future__ import annotations

import httpx

_client: httpx.AsyncClient | None = None


def get_http_client() -> httpx.AsyncClient:
    """共有 httpx.AsyncClient を返す。未初期化なら自動生成。"""
    global _client
    if _client is None:
        _client = httpx.AsyncClient(
            limits=httpx.Limits(
                max_connections=100,
                max_keepalive_connections=20,
            ),
            timeout=httpx.Timeout(30.0, connect=10.0),
        )
    return _client


async def close_http_client() -> None:
    """アプリケーション終了時にクライアントをクローズする。"""
    global _client
    if _client is not None:
        await _client.aclose()
        _client = None
