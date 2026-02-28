"use client";

import type { CountryGroup } from "@/lib/livestream-data";

interface Props {
  groups: CountryGroup[];
  onCountryClick: (lat: number, lng: number, country: string) => void;
}

export default function CountrySummaryCards({ groups, onCountryClick }: Props) {
  if (groups.length === 0) return null;

  const lastIndex = groups.length - 1;

  return (
    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-accent/30">
      {groups.map((group, index) => (
        <button
          key={group.country}
          onClick={() => onCountryClick(group.lat, group.lng, group.country)}
          className="glass-card flex-shrink-0 w-48 p-4 text-left hover:border-accent/50 transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-accent/50 rounded-xl"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">{group.flag}</span>
            {index === lastIndex && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent font-medium border border-accent/30">
                現在地
              </span>
            )}
          </div>
          <div className="font-bold text-foreground text-base mb-1">
            {group.country}
          </div>
          <div className="text-muted text-xs mb-2 truncate">
            {group.cities.join("・")}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-accent font-semibold text-sm">
              {group.totalVideos}本
            </span>
            <span className="text-muted text-xs">
              {group.dateRange.split(" ~ ")[0]}〜
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
