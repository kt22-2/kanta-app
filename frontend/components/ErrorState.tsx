"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

interface Props {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export default function ErrorState({
  title = "データの読み込みに失敗しました",
  description = "ネットワーク接続を確認してください",
  onRetry,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
        <AlertCircle className="h-7 w-7 text-red-400" />
      </div>
      <h3 className="text-base font-bold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted max-w-sm">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 flex items-center gap-2 rounded-lg border border-white/8 bg-white/4 px-4 py-2 text-sm font-medium text-foreground hover:bg-white/8 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          再試行
        </button>
      )}
    </div>
  );
}
