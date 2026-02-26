"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import { Search, Globe } from "lucide-react";
import CountryCard from "@/components/CountryCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { getCountries } from "@/lib/api";
import { getRegionLabel } from "@/lib/utils";
import type { SafetyLevel } from "@/lib/types";

const REGIONS = ["Asia", "Europe", "Americas", "Africa", "Oceania"];
type SortKey = "name" | "population" | "safety";

export default function CountriesContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [region, setRegion] = useState(searchParams.get("region") ?? "");
  const [sortBy, setSortBy] = useState<SortKey>("name");
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

  const sorted = useMemo(() => {
    if (!countries) return [];
    const arr = [...countries];
    if (sortBy === "name") {
      arr.sort((a, b) => (a.name_ja ?? a.name).localeCompare(b.name_ja ?? b.name, "ja"));
    } else if (sortBy === "population") {
      arr.sort((a, b) => b.population - a.population);
    } else if (sortBy === "safety") {
      arr.sort((a, b) => (a.safety_level ?? 0) - (b.safety_level ?? 0));
    }
    return arr;
  }, [countries, sortBy]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-[#F5F5F0] flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#C8A96E]/20 to-[#E8C980]/10">
            <Globe className="h-4 w-4 text-[#C8A96E]" />
          </div>
          国一覧
        </h1>
        <p className="mt-1 text-sm text-[#8899AA] ml-11">
          {countries ? `${countries.length}カ国` : ""}
        </p>
      </div>

      {/* 検索・フィルタ */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        {/* 検索バー */}
        <div className="flex flex-1 items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 focus-within:border-[#C8A96E]/40 focus-within:bg-white/[0.06] transition-all duration-200">
          <Search className="h-4 w-4 text-[#8899AA] shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="国名・国コードで検索..."
            className="flex-1 bg-transparent text-sm text-[#F5F5F0] placeholder:text-[#8899AA] outline-none"
          />
        </div>
        {/* フィルタ + ソート */}
        <div className="flex gap-2 flex-wrap items-center">
          <button
            onClick={() => setRegion("")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
              region === ""
                ? "text-[#0F1923] shadow-[0_0_12px_rgba(200,169,110,0.3)]"
                : "border border-white/[0.08] bg-white/[0.04] text-[#8899AA] hover:text-[#F5F5F0] hover:border-[#C8A96E]/30"
            }`}
            style={region === "" ? {
              background: "linear-gradient(135deg, #C8A96E 0%, #E8C980 100%)",
            } : undefined}
          >
            全て
          </button>
          {REGIONS.map((r) => (
            <button
              key={r}
              onClick={() => setRegion(region === r ? "" : r)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                region === r
                  ? "text-[#0F1923] shadow-[0_0_12px_rgba(200,169,110,0.3)]"
                  : "border border-white/[0.08] bg-white/[0.04] text-[#8899AA] hover:text-[#F5F5F0] hover:border-[#C8A96E]/30"
              }`}
              style={region === r ? {
                background: "linear-gradient(135deg, #C8A96E 0%, #E8C980 100%)",
              } : undefined}
            >
              {getRegionLabel(r)}
            </button>
          ))}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="rounded-full px-4 py-1.5 text-sm border border-white/[0.08] bg-[#1C2D3E] text-[#8899AA] outline-none cursor-pointer hover:text-[#F5F5F0] hover:border-[#C8A96E]/30 transition-all duration-200"
          >
            <option value="name">名前順</option>
            <option value="population">人口順</option>
            <option value="safety">安全度順</option>
          </select>
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
          {sorted.map((country) => (
            <CountryCard
              key={country.code}
              country={country}
              safetyLevel={country.safety_level != null ? (country.safety_level as SafetyLevel) : undefined}
            />
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
