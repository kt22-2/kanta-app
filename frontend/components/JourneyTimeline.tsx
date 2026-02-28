"use client";

import { useState } from "react";
import type { LivestreamPoint } from "@/lib/livestream-data";
import {
  groupPointsByLocation,
  getCountryFlag,
  getYouTubeVideoId,
  getYouTubeThumbnail,
} from "@/lib/livestream-data";

interface Props {
  points: LivestreamPoint[];
}

// "2026/2/6" → "2026-02-06"（文字列比較可能な形式に正規化）
// "2024-01-01" のようなハイフン形式はそのまま返す
function normalizeDate(date: string): string {
  if (date.includes("-")) return date;
  const parts = date.split("/");
  if (parts.length !== 3) return date;
  const [y, m, d] = parts;
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

const INITIAL_DISPLAY_COUNT = 5;

export default function JourneyTimeline({ points }: Props) {
  if (points.length === 0) return null;

  const locationGroups = groupPointsByLocation(points);

  // 国ごとにまとめ、最初の動画日付を記録
  const countryFirstDate = new Map<string, string>();
  const countryLatestDate = new Map<string, string>();
  const byCountry = new Map<
    string,
    Array<{ city: string; videos: LivestreamPoint[] }>
  >();

  for (const group of locationGroups) {
    const existing = byCountry.get(group.country) ?? [];
    existing.push({ city: group.city, videos: group.videos });
    byCountry.set(group.country, existing);

    const groupFirstDate = normalizeDate(group.videos[0]?.date ?? "9999/1/1");
    const groupLastDate = normalizeDate(
      group.videos[group.videos.length - 1]?.date ?? "0000/1/1"
    );
    if (
      !countryFirstDate.has(group.country) ||
      groupFirstDate < countryFirstDate.get(group.country)!
    ) {
      countryFirstDate.set(group.country, groupFirstDate);
    }
    if (
      !countryLatestDate.has(group.country) ||
      groupLastDate > countryLatestDate.get(group.country)!
    ) {
      countryLatestDate.set(group.country, groupLastDate);
    }
  }

  // 最初の訪問日順にソート（時系列順）
  const countryOrder = [...byCountry.keys()].sort(
    (a, b) =>
      (countryFirstDate.get(a) ?? "").localeCompare(
        countryFirstDate.get(b) ?? ""
      )
  );

  // 最も最近訪問した国（最新日付の国）
  let latestCountry = countryOrder[0];
  for (const country of countryOrder) {
    if (
      (countryLatestDate.get(country) ?? "") >
      (countryLatestDate.get(latestCountry) ?? "")
    ) {
      latestCountry = country;
    }
  }

  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
        <span className="text-accent">📖</span>
        旅程タイムライン
      </h2>
      <div className="space-y-8">
        {countryOrder.map((country) => {
          const flag = getCountryFlag(country);
          const cityGroups = byCountry.get(country) ?? [];
          const isCurrent = country === latestCountry;

          return (
            <CountrySection
              key={country}
              country={country}
              flag={flag}
              cityGroups={cityGroups}
              isLatest={isCurrent}
            />
          );
        })}
      </div>
    </section>
  );
}

function CountrySection({
  country,
  flag,
  cityGroups,
  isLatest,
}: {
  country: string;
  flag: string;
  cityGroups: Array<{ city: string; videos: LivestreamPoint[] }>;
  isLatest: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(isLatest);

  return (
    <div className="relative">
      {/* 縦線 */}
      <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-accent/20" />

      {/* 国ヘッダー */}
      <button
        onClick={() => setIsExpanded((v) => !v)}
        className="relative z-10 flex items-center gap-3 mb-4 w-full text-left group"
      >
        <div className="w-10 h-10 rounded-full bg-surface border-2 border-accent/40 flex items-center justify-center text-xl shrink-0 group-hover:border-accent transition-colors">
          {flag}
        </div>
        <div className="flex items-center gap-2 flex-1">
          <span className="text-lg font-bold text-foreground">{country}</span>
          {isLatest && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent font-medium border border-accent/30">
              現在地
            </span>
          )}
        </div>
        <span className="text-muted text-sm">{isExpanded ? "▲" : "▼"}</span>
      </button>

      {/* 都市・動画リスト */}
      {isExpanded && (
        <div className="ml-14 space-y-6">
          {cityGroups.map((cityGroup) => (
            <CityGroup key={cityGroup.city} cityGroup={cityGroup} />
          ))}
        </div>
      )}
    </div>
  );
}

function CityGroup({
  cityGroup,
}: {
  cityGroup: { city: string; videos: LivestreamPoint[] };
}) {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll
    ? cityGroup.videos
    : cityGroup.videos.slice(0, INITIAL_DISPLAY_COUNT);
  const hasMore = cityGroup.videos.length > INITIAL_DISPLAY_COUNT;

  return (
    <div>
      <div className="text-sm text-muted font-medium mb-3 flex items-center gap-1">
        <span className="text-accent">📍</span>
        {cityGroup.city}
        <span className="ml-1 text-xs">({cityGroup.videos.length}本)</span>
      </div>
      <div className="space-y-2">
        {displayed.map((video) => (
          <VideoCard key={video.youtubeUrl} video={video} />
        ))}
      </div>
      {hasMore && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-3 text-sm text-accent hover:text-accent-light transition-colors flex items-center gap-1"
        >
          もっと見る ({cityGroup.videos.length - INITIAL_DISPLAY_COUNT}本)
          <span>▼</span>
        </button>
      )}
    </div>
  );
}

function VideoCard({ video }: { video: LivestreamPoint }) {
  const videoId = getYouTubeVideoId(video.youtubeUrl);
  const thumbnail = videoId ? getYouTubeThumbnail(videoId) : null;

  return (
    <a
      href={video.youtubeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex gap-3 p-2 rounded-lg hover:bg-surface/60 transition-colors group"
    >
      {thumbnail && (
        <div className="relative shrink-0 w-24 h-[54px] rounded overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnail}
            alt={video.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-white text-lg">▶</span>
          </div>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground line-clamp-2 leading-snug">
          {video.title}
        </div>
        <div className="text-xs text-muted mt-1">{video.date}</div>
      </div>
    </a>
  );
}
