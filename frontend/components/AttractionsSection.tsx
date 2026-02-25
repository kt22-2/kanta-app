"use client";

import useSWR from "swr";
import { Star, Calendar, Lightbulb } from "lucide-react";
import { getAttractions } from "@/lib/api";
import OTMAttractionCard from "./OTMAttractionCard";
import type { Attraction } from "@/lib/types";

interface Props {
  code: string;
}

const CATEGORY_EMOJI: Record<string, string> = {
  自然: "\u{1F3D4}\uFE0F",
  文化: "\u{1F3DB}\uFE0F",
  歴史: "\u{1F3F0}",
  食: "\u{1F35C}",
  アドベンチャー: "\u{1F9D7}",
  都市: "\u{1F306}",
  宗教: "\u26E9\uFE0F",
  世界遺産: "\u{1F30D}",
};

function AttractionCard({ attraction }: { attraction: Attraction }) {
  return (
    <div className="rounded-xl border border-[#1C2D3E] bg-[#1C2D3E] p-4">
      <div className="flex items-start gap-3 mb-2">
        <span className="text-2xl">
          {CATEGORY_EMOJI[attraction.category] ?? "\u{1F4CD}"}
        </span>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-[#F5F5F0]">{attraction.name}</h3>
            <span className="text-xs border border-[#C8A96E]/30 text-[#C8A96E] rounded-full px-2 py-0.5">
              {attraction.category}
            </span>
          </div>
          <p className="mt-1 text-sm text-[#8899AA] leading-relaxed">
            {attraction.description}
          </p>
        </div>
      </div>
      {attraction.highlights.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {attraction.highlights.map((h, j) => (
            <span
              key={j}
              className="text-xs bg-[#0F1923] text-[#8899AA] rounded px-2 py-0.5"
            >
              {h}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="h-32 animate-pulse rounded-xl bg-[#1C2D3E]"
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

      {/* OTM観光スポット */}
      {data.otm_attractions && data.otm_attractions.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-bold text-[#F5F5F0] flex items-center gap-2">
            <Star className="h-4 w-4 text-[#C8A96E]" />
            観光スポット
          </h3>
          {data.otm_attractions.slice(0, 10).map((a, i) => (
            <OTMAttractionCard key={i} attraction={a} />
          ))}
        </div>
      )}

      {/* AI サマリー */}
      {data.ai_summary && data.ai_summary.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-bold text-[#F5F5F0] flex items-center gap-2">
            <Star className="h-4 w-4 text-[#C8A96E]" />
            AIおすすめスポット
          </h3>
          {data.ai_summary.map((a, i) => (
            <AttractionCard key={i} attraction={a} />
          ))}
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
