import { MapPin, ExternalLink } from "lucide-react";
import type { HeritageSite } from "@/lib/types";

interface Props {
  site: HeritageSite;
}

export default function HeritageSiteCard({ site }: Props) {
  const mapsUrl =
    site.latitude != null && site.longitude != null
      ? `https://www.google.com/maps?q=${site.latitude},${site.longitude}`
      : null;

  return (
    <div className="rounded-xl glass-card gradient-border-hover overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(200,169,110,0.12)]">
      {/* サムネイル画像 */}
      {site.image_url && (
        <div className="relative h-36 w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={site.image_url}
            alt={site.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#1C2D3E]/80" />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <span className="text-lg shrink-0 mt-0.5">🏛️</span>
            <h3 className="font-semibold text-sm text-[#F5F5F0] leading-snug">{site.name}</h3>
          </div>
          {site.registered_year && (
            <span className="shrink-0 text-xs border border-[#C8A96E]/30 text-[#C8A96E] rounded-full px-2 py-0.5 whitespace-nowrap">
              {site.registered_year}年登録
            </span>
          )}
        </div>

        {site.description && (
          <p className="mt-2 text-sm text-[#8899AA] leading-relaxed line-clamp-2 pl-7">
            {site.description}
          </p>
        )}

        <div className="mt-3 flex items-center gap-3 pl-7">
        {mapsUrl && (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-[#8899AA] hover:text-[#C8A96E] transition-colors"
          >
            <MapPin className="h-3.5 w-3.5" />
            地図で見る
          </a>
        )}
        {site.wikipedia_url && (
          <a
            href={site.wikipedia_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-[#8899AA] hover:text-[#C8A96E] transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Wikipedia
          </a>
        )}
        </div>
      </div>
    </div>
  );
}
