"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import { Search, Globe, X } from "lucide-react";
import CountryCard from "@/components/CountryCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import { getCountries } from "@/lib/api";
import { getRegionLabel } from "@/lib/utils";
import { HERITAGE_COUNT } from "@/lib/heritage-counts";
import type { SafetyLevel } from "@/lib/types";

const REGIONS = ["Asia", "Europe", "Americas", "Africa", "Oceania"];
type SortKey = "name" | "population" | "safety" | "heritage";

const SAFETY_FILTERS: Array<{ level: SafetyLevel | null; label: string; activeClass: string }> = [
  { level: null, label: "全て",     activeClass: "" },
  { level: 0,    label: "安全",     activeClass: "text-green-400 border-green-700 bg-green-900/50 shadow-[0_0_10px_rgba(74,222,128,0.2)]" },
  { level: 1,    label: "注意",     activeClass: "text-yellow-400 border-yellow-700 bg-yellow-900/50 shadow-[0_0_10px_rgba(251,191,36,0.2)]" },
  { level: 2,    label: "危険",     activeClass: "text-orange-400 border-orange-700 bg-orange-900/50 shadow-[0_0_10px_rgba(251,146,60,0.2)]" },
  { level: 3,    label: "渡航中止", activeClass: "text-red-400 border-red-700 bg-red-900/50 shadow-[0_0_10px_rgba(248,113,113,0.2)]" },
  { level: 4,    label: "退避勧告", activeClass: "text-red-200 border-red-900 bg-red-950/70 shadow-[0_0_12px_rgba(248,113,113,0.3)]" },
];

export default function CountriesContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [region, setRegion] = useState(searchParams.get("region") ?? "");
  const [safetyLevel, setSafetyLevel] = useState<SafetyLevel | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>("name");
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: countries, isLoading, error, mutate } = useSWR(
    ["countries", debouncedQuery, region],
    () => getCountries(debouncedQuery || undefined, region || undefined),
    { revalidateOnFocus: false }
  );

  const sorted = useMemo(() => {
    if (!countries) return [];
    let arr = [...countries];
    // 危険度フィルタ（クライアントサイド）
    if (safetyLevel !== null) {
      arr = arr.filter((c) => c.safety_level === safetyLevel);
    }
    if (sortBy === "name") {
      arr.sort((a, b) => (a.name_ja ?? a.name).localeCompare(b.name_ja ?? b.name, "ja"));
    } else if (sortBy === "population") {
      arr.sort((a, b) => b.population - a.population);
    } else if (sortBy === "safety") {
      arr.sort((a, b) => (a.safety_level ?? 0) - (b.safety_level ?? 0));
    } else if (sortBy === "heritage") {
      arr.sort((a, b) => (HERITAGE_COUNT[b.code] ?? 0) - (HERITAGE_COUNT[a.code] ?? 0));
    }
    return arr;
  }, [countries, sortBy, safetyLevel]);

  const hasFilter = query !== "" || region !== "" || safetyLevel !== null;

  const clearFilters = () => {
    setQuery("");
    setRegion("");
    setSafetyLevel(null);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-foreground flex items-center gap-3">
          <div className="section-icon">
            <Globe className="h-4 w-4 text-accent" />
          </div>
          国一覧
        </h1>
        <p className="mt-1 text-sm text-muted ml-11">
          {countries ? (
            <>
              <span className="font-semibold text-foreground">{sorted.length}</span>
              <span>カ国</span>
            </>
          ) : ""}
        </p>
      </div>

      {/* 検索・フィルタ */}
      <div className="mb-6 flex flex-col gap-3">

        {/* 検索バー */}
        <div className="flex items-center gap-2 rounded-full border border-white/8 bg-white/4 px-4 py-2 focus-within:border-accent/40 focus-within:bg-white/6 transition-all duration-200">
          <Search className="h-4 w-4 text-muted shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="国名・国コードで検索..."
            aria-label="国を検索"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-muted hover:text-foreground transition-colors"
              aria-label="検索をクリア"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* 地域フィルタ */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted font-medium w-10 shrink-0">地域</span>
          <button
            onClick={() => setRegion("")}
            aria-pressed={region === ""}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
              region === ""
                ? "text-background shadow-[0_0_12px_rgba(200,169,110,0.3)]"
                : "border border-white/8 bg-white/4 text-muted hover:text-foreground hover:border-accent/30"
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
              aria-pressed={region === r}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                region === r
                  ? "text-background shadow-[0_0_12px_rgba(200,169,110,0.3)]"
                  : "border border-white/8 bg-white/4 text-muted hover:text-foreground hover:border-accent/30"
              }`}
              style={region === r ? {
                background: "linear-gradient(135deg, #C8A96E 0%, #E8C980 100%)",
              } : undefined}
            >
              {getRegionLabel(r)}
            </button>
          ))}
        </div>

        {/* 危険度フィルタ + ソート + リセット */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted font-medium w-10 shrink-0">危険度</span>
          {SAFETY_FILTERS.map(({ level, label, activeClass }) => {
            const isActive = safetyLevel === level;
            return (
              <button
                key={label}
                onClick={() => {
                  if (level === null) {
                    setSafetyLevel(null);
                  } else {
                    setSafetyLevel(safetyLevel === level ? null : level);
                  }
                }}
                aria-pressed={isActive}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 border ${
                  isActive
                    ? level === null
                      ? "text-background shadow-[0_0_12px_rgba(200,169,110,0.3)]"
                      : activeClass
                    : "border-white/8 bg-white/4 text-muted hover:text-foreground hover:border-accent/30"
                }`}
                style={isActive && level === null ? {
                  background: "linear-gradient(135deg, #C8A96E 0%, #E8C980 100%)",
                } : undefined}
              >
                {label}
              </button>
            );
          })}
          <div className="ml-auto flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              aria-label="ソート順"
              className="rounded-full px-4 py-1.5 text-sm border border-white/8 bg-surface text-muted outline-none cursor-pointer hover:text-foreground hover:border-accent/30 transition-all duration-200"
            >
              <option value="name">名前順</option>
              <option value="population">人口順</option>
              <option value="safety">安全度順</option>
              <option value="heritage">世界遺産順</option>
            </select>
            {hasFilter && (
              <button
                onClick={clearFilters}
                className="rounded-full px-3 py-1.5 text-xs font-medium text-muted hover:text-foreground border border-white/8 hover:border-accent/30 transition-all duration-200"
              >
                リセット
              </button>
            )}
          </div>
        </div>

      </div>

      {/* 結果 */}
      {isLoading && <LoadingSpinner label="国情報を読み込み中..." />}
      {error && (
        <ErrorState
          description="バックエンドが起動しているか確認してください"
          onRetry={() => mutate()}
        />
      )}
      {countries && sorted.length > 0 && (
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
      {countries && sorted.length === 0 && (
        <EmptyState
          title="一致する国が見つかりませんでした"
          description="条件に一致する国はありません"
          action={{ label: "フィルタをクリア", onClick: clearFilters }}
        />
      )}
    </div>
  );
}
