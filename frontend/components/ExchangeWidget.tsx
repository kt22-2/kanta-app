"use client";

import useSWR from "swr";
import { TrendingUp } from "lucide-react";
import { getExchangeInfo } from "@/lib/api";

interface Props {
  code: string;
}

export default function ExchangeWidget({ code }: Props) {
  const { data, isLoading } = useSWR(
    ["exchange", code],
    () => getExchangeInfo(code),
    { revalidateOnFocus: false }
  );

  if (isLoading) {
    return (
      <div className="rounded-xl glass-card p-4">
        <div className="h-4 w-24 shimmer rounded mb-3" />
        <div className="h-8 w-40 shimmer rounded" />
      </div>
    );
  }

  if (!data || !data.available || data.rates.length === 0) {
    return (
      <div className="rounded-xl glass-card p-4">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="h-4 w-4 text-accent" />
          <span className="text-xs font-semibold text-muted uppercase tracking-wide">為替レート</span>
        </div>
        <p className="text-sm text-muted">対応外通貨</p>
      </div>
    );
  }

  const isReverseMode = data.base === "USD";

  return (
    <div className="rounded-xl glass-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="h-4 w-4 text-accent" />
        <span className="text-xs font-semibold text-muted uppercase tracking-wide">為替レート</span>
        {data.date && (
          <span className="ml-auto text-xs text-muted">{data.date}</span>
        )}
      </div>
      <div className="space-y-2">
        {data.rates.map((r) => {
          if (isReverseMode) {
            const jpyAmount = (r.rate * 100).toLocaleString("ja-JP", { maximumFractionDigits: 0 });
            return (
              <div key={r.currency_code} className="flex items-baseline justify-between">
                <span className="text-sm text-muted">$100 USD =</span>
                <span className="text-2xl font-black gradient-text">
                  ¥{jpyAmount}
                </span>
              </div>
            );
          }
          const jpyAmount = (100 / r.rate).toLocaleString("ja-JP", { maximumFractionDigits: 0 });
          return (
            <div key={r.currency_code} className="flex items-baseline justify-between">
              <span className="text-sm text-muted">100 {r.currency_code} =</span>
              <span className="text-2xl font-black gradient-text">
                ¥{jpyAmount} JPY
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
