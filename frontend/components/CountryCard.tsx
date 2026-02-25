import Link from "next/link";
import type { Country } from "@/lib/types";
import type { SafetyLevel } from "@/lib/types";
import { formatPopulation, getRegionLabel } from "@/lib/utils";
import SafetyBadge from "./SafetyBadge";

interface Props {
  country: Country;
  safetyLevel?: SafetyLevel;
}

export default function CountryCard({ country, safetyLevel }: Props) {
  return (
    <Link href={`/countries/${country.code}`}>
      <div className="group relative overflow-hidden rounded-xl border border-[#1C2D3E] bg-[#1C2D3E] hover:border-[#C8A96E] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#C8A96E]/10">
        {/* 国旗エリア */}
        <div className="relative h-32 overflow-hidden bg-[#0F1923] flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={country.flag_url}
            alt={`${country.name} 国旗`}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1C2D3E] to-transparent" />
          <span className="absolute bottom-2 right-2 text-2xl">{country.flag_emoji}</span>
        </div>

        {/* カード下部 */}
        <div className="p-3 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-[#F5F5F0] text-sm leading-tight">
                {country.name}
              </h3>
              {country.name_ja && (
                <p className="text-[#8899AA] text-xs">{country.name_ja}</p>
              )}
            </div>
            {safetyLevel !== undefined && (
              <SafetyBadge level={safetyLevel} />
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-[#8899AA]">
            <span>{getRegionLabel(country.region)}</span>
            <span>·</span>
            <span>{formatPopulation(country.population)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
