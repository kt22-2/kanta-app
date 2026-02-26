"use client";

import useSWR from "swr";
import { Star, Calendar, Lightbulb, Globe } from "lucide-react";
import { getAttractions } from "@/lib/api";
import OTMAttractionCard from "./OTMAttractionCard";
import HeritageSiteCard from "./HeritageSiteCard";

interface Props {
  code: string;
}

function Skeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="h-32 shimmer rounded-xl"
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );
}

export default function AttractionsSection({ code }: Props) {
  const { data, error, isLoading } = useSWR(
    `/api/countries/${code}/attractions`,
    () => getAttractions(code)
  );

  if (isLoading) return <Skeleton />;

  if (error) {
    return (
      <p className="text-sm text-[#8899AA]">
        観光情報の読み込みに失敗しました
      </p>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-4">
      {/* ベストシーズン */}
      {data.best_season && (
        <div className="flex items-center gap-3 rounded-xl border border-[#C8A96E]/30 bg-[#C8A96E]/10 p-4">
          <Calendar className="h-5 w-5 text-[#C8A96E] shrink-0" />
          <div>
            <p className="text-xs text-[#C8A96E] font-semibold">ベストシーズン</p>
            <p className="text-sm text-[#F5F5F0]">{data.best_season}</p>
          </div>
        </div>
      )}

      {/* 世界遺産 */}
      {data.heritage_sites && data.heritage_sites.length > 0 && (
        <div>
          <h3 className="mb-3 font-bold text-[#F5F5F0] flex items-center gap-2">
            <Globe className="h-4 w-4 text-[#C8A96E]" />
            世界遺産（{data.heritage_sites.length}件）
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.heritage_sites.map((site, i) => (
              <HeritageSiteCard key={i} site={site} />
            ))}
          </div>
        </div>
      )}

      {/* OTM観光スポット */}
      {data.otm_attractions && data.otm_attractions.length > 0 && (
        <div>
          <h3 className="mb-3 font-bold text-[#F5F5F0] flex items-center gap-2">
            <Star className="h-4 w-4 text-[#C8A96E]" />
            観光スポット
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.otm_attractions.slice(0, 10).map((a, i) => (
              <OTMAttractionCard key={i} attraction={a} />
            ))}
          </div>
        </div>
      )}

      {/* 旅行のコツ */}
      {data.travel_tips && data.travel_tips.length > 0 && (
        <div>
          <h3 className="mb-3 font-bold text-[#F5F5F0] flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-[#C8A96E]" />
            旅行のコツ
          </h3>
          <ul className="space-y-2">
            {data.travel_tips.map((tip, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-[#8899AA]"
              >
                <span className="mt-0.5 text-[#C8A96E] font-bold shrink-0">
                  {i + 1}.
                </span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
