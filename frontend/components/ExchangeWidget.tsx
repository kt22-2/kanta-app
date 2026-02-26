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
          <TrendingUp className="h-4 w-4 text-[#C8A96E]" />
          <span className="text-xs font-semibold text-[#8899AA] uppercase tracking-wide">為替レート</span>
        </div>
        <p className="text-sm text-[#8899AA]">対応外通貨</p>
      </div>
    );
  }

  // JPYが対象（USD→JPY モード）の場合
  const isReverseMode = data.base === "USD";

  return (
    <div className="rounded-xl glass-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="h-4 w-4 text-[#C8A96E]" />
        <span className="text-xs font-semibold text-[#8899AA] uppercase tracking-wide">為替レート</span>
        {data.date && (
          <span className="ml-auto text-xs text-[#8899AA]">{data.date}</span>
        )}
      </div>
      <div className="space-y-2">
        {data.rates.map((r) => {
          if (isReverseMode) {
            return (
              <div key={r.currency_code} className="flex items-baseline justify-between">
                <span className="text-sm text-[#8899AA]">$1 USD =</span>
                <span
                  className="text-2xl font-black"
                  style={{
                    background: "linear-gradient(135deg, #C8A96E 0%, #E8C980 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  } as React.CSSProperties}
                >
                  ¥{r.rate.toLocaleString("ja-JP", { maximumFractionDigits: 2 })}
                </span>
              </div>
            );
          }
          const converted = (10000 * r.rate).toFixed(2);
          return (
            <div key={r.currency_code} className="flex items-baseline justify-between">
              <span className="text-sm text-[#8899AA]">¥10,000 =</span>
              <span
                className="text-2xl font-black"
                style={{
                  background: "linear-gradient(135deg, #C8A96E 0%, #E8C980 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                } as React.CSSProperties}
              >
                {Number(converted).toLocaleString()} {r.currency_code}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
