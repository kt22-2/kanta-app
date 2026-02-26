FROM python:3.11-slim

WORKDIR /app

# 依存関係ファイルをコピーしてインストール
COPY pyproject.toml .
RUN pip install --no-cache-dir -e .

# アプリケーションコードをコピー
COPY app/ ./app/

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
