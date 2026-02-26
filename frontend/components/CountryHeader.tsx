"use client";

import dynamic from "next/dynamic";
import type { Country, SafetyInfo, SafetyLevel } from "@/lib/types";
import { formatPopulation, getRegionLabel } from "@/lib/utils";
import SafetyBadge from "./SafetyBadge";

const CountryMap = dynamic(() => import("./CountryMap"), { ssr: false });

interface Props {
  country: Country;
  safety: SafetyInfo | null;
}

export default function CountryHeader({ country, safety }: Props) {
  return (
    <div className="mb-6 overflow-hidden rounded-2xl glass-card gradient-border-hover">
      <div className="lg:flex lg:min-h-[280px]">

        {/* 左: 国旗 + 情報オーバーレイ */}
        <div className="relative h-56 lg:h-auto lg:w-1/2 overflow-hidden shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={country.flag_url}
            alt={`${country.name} 国旗`}
            className="w-full h-full object-cover opacity-65"
          />
          {/* グラデーションオーバーレイ */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent" />
          <div className="absolute inset-0 hidden lg:block bg-gradient-to-r from-transparent via-transparent to-background/30" />

          {/* 国旗絵文字（左上） */}
          <span className="absolute top-4 left-4 text-4xl" aria-hidden="true">{country.flag_emoji}</span>

          {/* 安全バッジ（右上） */}
          {safety && (
            <div className="absolute top-3 right-3">
              <SafetyBadge level={safety.level as SafetyLevel} size="md" />
            </div>
          )}

          {/* 国名・英語名・ステータス（下部オーバーレイ） */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h1 className="text-2xl lg:text-3xl font-black text-foreground leading-tight">
              {country.name_ja ?? country.name}
            </h1>
            <p className="text-muted text-sm mt-0.5 mb-3">{country.name}</p>
            <div className="grid grid-cols-3 gap-2 text-sm">
              {country.capital && (
                <div className="rounded-lg bg-background/60 backdrop-blur-sm border border-white/10 px-3 py-2">
                  <p className="text-xs text-muted mb-0.5">首都</p>
                  <p className="font-semibold text-foreground truncate text-xs">{country.capital}</p>
                </div>
              )}
              <div className="rounded-lg bg-background/60 backdrop-blur-sm border border-white/10 px-3 py-2">
                <p className="text-xs text-muted mb-0.5">地域</p>
                <p className="font-semibold text-foreground truncate text-xs">{getRegionLabel(country.region)}</p>
              </div>
              <div className="rounded-lg bg-background/60 backdrop-blur-sm border border-white/10 px-3 py-2">
                <p className="text-xs text-muted mb-0.5">人口</p>
                <p className="font-semibold text-foreground truncate text-xs">{formatPopulation(country.population)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 右: 世界地図 */}
        <div className="h-48 lg:h-auto lg:w-1/2">
          {country.latitude != null && country.longitude != null ? (
            <CountryMap
              latitude={country.latitude}
              longitude={country.longitude}
              name={country.name_ja ?? country.name}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-surface/30">
              <p className="text-muted text-sm">位置情報なし</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
