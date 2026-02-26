import { MapPin, ExternalLink } from "lucide-react";
import type { OTMAttraction } from "@/lib/types";

interface Props {
  attraction: OTMAttraction;
}

function renderStars(rating: number): string {
  const full = Math.round(rating);
  return "\u2605".repeat(Math.min(full, 5)) + "\u2606".repeat(Math.max(5 - full, 0));
}

export default function OTMAttractionCard({ attraction }: Props) {
  const hasCoords = attraction.latitude != null && attraction.longitude != null;
  const mapsUrl = hasCoords
    ? `https://www.google.com/maps?q=${attraction.latitude},${attraction.longitude}`
    : null;

  return (
    <div className="rounded-xl glass-card p-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-sm text-[#F5F5F0]">{attraction.name}</h3>
        {attraction.category && (
          <span className="shrink-0 text-xs border border-[#C8A96E]/30 text-[#C8A96E] rounded-full px-2 py-0.5">
            {attraction.category}
          </span>
        )}
      </div>

      {attraction.rating != null && (
        <p className="mt-1 text-sm text-yellow-400">{renderStars(attraction.rating)}</p>
      )}

      {attraction.description && (
        <p className="mt-2 text-sm text-[#8899AA] leading-relaxed line-clamp-3">
          {attraction.description}
        </p>
      )}

      <div className="mt-3 flex items-center gap-3">
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
        {attraction.wikipedia_url && (
          <a
            href={attraction.wikipedia_url}
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
  );
}
