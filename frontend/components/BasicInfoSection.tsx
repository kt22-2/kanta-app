import Link from "next/link";
import { Info, DollarSign } from "lucide-react";
import type { Country, EconomicInfo } from "@/lib/types";
import ExchangeWidget from "./ExchangeWidget";
import ClimateSection from "./ClimateSection";

interface Props {
  country: Country;
  economic: EconomicInfo | null;
  code: string;
}

export default function BasicInfoSection({ country, economic, code }: Props) {
  return (
    <>
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
        <div className="section-icon">
          <Info className="h-4 w-4 text-accent" />
        </div>
        基本情報
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* 言語 */}
        <div className="rounded-xl glass-card p-4">
          <p className="text-xs text-muted mb-1">言語</p>
          <p className="text-sm font-medium text-foreground">
            {country.languages.join("、") || "情報なし"}
          </p>
        </div>

        {/* 通貨 */}
        <div className="rounded-xl glass-card p-4">
          <p className="text-xs text-muted mb-1">通貨</p>
          {country.currencies.length > 0 ? (
            <div className="space-y-1">
              {country.currencies.map((c) => (
                <p key={c.code} className="text-sm font-medium text-foreground">
                  {c.name} ({c.code}){c.symbol ? ` - ${c.symbol}` : ""}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-sm text-foreground">情報なし</p>
          )}
        </div>

        {/* タイムゾーン */}
        <div className="rounded-xl glass-card p-4">
          <p className="text-xs text-muted mb-1">タイムゾーン</p>
          <p className="text-sm text-foreground">
            {country.timezones && country.timezones.length > 0
              ? country.timezones.slice(0, 3).join("、")
              : "情報なし"}
          </p>
        </div>

        {/* 一人当たりGDP */}
        {economic && economic.available && economic.gdp_per_capita != null && (
          <div className="rounded-xl glass-card p-4 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-accent/20 to-accent-light/10 shrink-0">
              <DollarSign className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted mb-0.5">一人当たりGDP</p>
              <p className="text-sm font-bold text-foreground">
                ${economic.gdp_per_capita.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                {economic.gdp_year && (
                  <span className="text-xs text-muted font-normal ml-2">&middot; {economic.gdp_year}年</span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* 為替レートウィジェット */}
        <div className="sm:col-span-2">
          <ExchangeWidget code={code} />
        </div>

        {/* 気候チャート */}
        <div className="sm:col-span-2">
          <ClimateSection code={code} />
        </div>

        {/* 隣国リンク */}
        {country.borders && country.borders.length > 0 && (
          <div className="sm:col-span-2 rounded-xl glass-card p-4">
            <p className="text-xs text-muted mb-2">隣接国</p>
            <div className="flex flex-wrap gap-2">
              {country.borders.map((border) => (
                <Link
                  key={border}
                  href={`/countries/${border}`}
                  className="rounded-full px-3 py-1 text-xs font-medium border border-accent/40 text-accent hover:bg-accent/10 transition-colors"
                >
                  {border}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
