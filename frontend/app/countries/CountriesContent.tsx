"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import { Search, Globe } from "lucide-react";
import CountryCard from "@/components/CountryCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { getCountries } from "@/lib/api";
import { getRegionLabel } from "@/lib/utils";

const REGIONS = ["Asia", "Europe", "Americas", "Africa", "Oceania"];

export default function CountriesContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [region, setRegion] = useState(searchParams.get("region") ?? "");
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: countries, isLoading, error } = useSWR(
    ["countries", debouncedQuery, region],
    () => getCountries(debouncedQuery || undefined, region || undefined),
    { revalidateOnFocus: false }
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-[#F5F5F0] flex items-center gap-2">
          <Globe className="h-6 w-6 text-[#C8A96E]" />
          国一覧
        </h1>
        <p className="mt-1 text-sm text-[#8899AA]">
          {countries ? `${countries.length}カ国` : ""}
        </p>
      </div>

      {/* 検索・フィルタ */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-[#1C2D3E] bg-[#1C2D3E] px-3 py-2">
          <Search className="h-4 w-4 text-[#8899AA] shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="国名・国コードで検索..."
            className="flex-1 bg-transparent text-sm text-[#F5F5F0] placeholder:text-[#8899AA] outline-none"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setRegion("")}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              region === ""
                ? "bg-[#C8A96E] text-[#0F1923]"
                : "border border-[#1C2D3E] bg-[#1C2D3E] text-[#8899AA] hover:text-[#F5F5F0]"
            }`}
          >
            全て
          </button>
          {REGIONS.map((r) => (
            <button
              key={r}
              onClick={() => setRegion(region === r ? "" : r)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                region === r
                  ? "bg-[#C8A96E] text-[#0F1923]"
                  : "border border-[#1C2D3E] bg-[#1C2D3E] text-[#8899AA] hover:text-[#F5F5F0]"
              }`}
            >
              {getRegionLabel(r)}
            </button>
          ))}
        </div>
      </div>

      {/* 結果 */}
      {isLoading && <LoadingSpinner label="国情報を読み込み中..." />}
      {error && (
        <div className="rounded-lg border border-red-900 bg-red-950/30 p-4 text-red-400 text-sm">
          データの読み込みに失敗しました。バックエンドが起動しているか確認してください。
        </div>
      )}
      {countries && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {countries.map((country) => (
            <CountryCard key={country.code} country={country} />
          ))}
        </div>
      )}
      {countries && countries.length === 0 && (
        <div className="py-16 text-center text-[#8899AA]">
          「{query || region}」に一致する国が見つかりませんでした
        </div>
      )}
    </div>
  );
}
