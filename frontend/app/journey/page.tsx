import { Compass, MapPin, Globe } from "lucide-react";
import { loadLivestreamPoints, KANTA_SOCIAL } from "@/lib/livestream-data";
import LivestreamMap from "@/components/LivestreamMap";
import SocialLinks from "@/components/SocialLinks";

export const metadata = {
  title: "KANTAの軌跡 | KANTA TRAVEL",
  description: "YouTuber KANTAの世界一周ライブ配信の軌跡を地図で辿る",
};

export default function JourneyPage() {
  const points = loadLivestreamPoints();
  const uniqueCountries = new Set(points.map((p) => p.country)).size;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      {/* ヘッダー */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="section-icon">
            <Compass className="h-5 w-5 text-accent" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">KANTAの軌跡</h1>
        </div>
        <p className="text-muted text-sm">
          世界一周ライブ配信の全記録を地図で辿る
        </p>

        {/* 統計カード */}
        <div className="flex items-center justify-center gap-6 mt-6">
          <div className="glass-card rounded-xl px-6 py-3 text-center">
            <div className="flex items-center gap-2 text-muted text-xs mb-1">
              <MapPin className="h-3.5 w-3.5" />
              配信回数
            </div>
            <span className="text-2xl font-bold text-accent">
              {points.length}
            </span>
          </div>
          <div className="glass-card rounded-xl px-6 py-3 text-center">
            <div className="flex items-center gap-2 text-muted text-xs mb-1">
              <Globe className="h-3.5 w-3.5" />
              訪問国数
            </div>
            <span
              className="text-2xl font-bold text-accent"
              data-testid="country-count"
            >
              {uniqueCountries}
            </span>
          </div>
        </div>
      </div>

      {/* 地図 */}
      <div className="glass-card rounded-xl p-2 mb-8">
        <LivestreamMap points={points} />
      </div>

      {/* SNSリンク */}
      <SocialLinks />
    </main>
  );
}
