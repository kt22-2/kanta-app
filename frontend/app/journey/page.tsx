import { Compass, MapPin, Globe } from "lucide-react";
import { KANTA_SOCIAL } from "@/lib/livestream-data";
import { loadLivestreamPoints } from "@/lib/livestream-data.server";
import LivestreamMap from "@/components/LivestreamMap";
import SocialLinks from "@/components/SocialLinks";
import XFeed from "@/components/XFeed";

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

      {/* X（Twitter）フィード */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="section-icon">
            <svg className="h-5 w-5 text-accent" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-foreground">最新ポスト</h2>
        </div>
        <XFeed />
      </div>

      {/* SNSリンク */}
      <SocialLinks />
    </main>
  );
}
