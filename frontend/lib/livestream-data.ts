import fs from "fs";
import path from "path";

/** CSVの1行 = 1動画エントリ */
export interface LivestreamPoint {
  id: number;
  city: string;
  country: string;
  lat: number;
  lng: number;
  date: string;
  youtubeUrl: string;
  title: string;
}

/** 1ロケーション内の1動画 */
export interface VideoEntry {
  id: number;
  youtubeUrl: string;
  title: string;
  date: string;
}

/** 都市単位でグループ化したロケーション */
export interface LocationGroup {
  city: string;
  country: string;
  lat: number;
  lng: number;
  dateRange: { start: string; end: string };
  videos: VideoEntry[];
  isLatest: boolean;
}

export const KANTA_SOCIAL = {
  youtube: "https://www.youtube.com/@KANTA_worldwide",
  instagram: "https://www.instagram.com/kanta_worldwide/",
  x: "https://x.com/anta_kaoi",
};

export function parseLivestreamCsv(csv: string): LivestreamPoint[] {
  const lines = csv.trim().split("\n");
  return lines.slice(1).map((line) => {
    const [id, city, country, lat, lng, date, youtubeUrl, title] =
      line.split(",");
    return {
      id: Number(id),
      city,
      country,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      date,
      youtubeUrl,
      title,
    };
  });
}

/** YouTube URL からビデオIDを抽出 */
export function getYouTubeVideoId(url: string): string {
  const match = url.match(/[?&]v=([^&]+)/);
  return match ? match[1] : "";
}

/** YouTube サムネイル URL を生成 */
export function getYouTubeThumbnail(url: string): string {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) return "";
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}

/** LivestreamPoint[] を city+country でグループ化 */
export function groupPointsByLocation(
  points: LivestreamPoint[]
): LocationGroup[] {
  const map = new Map<string, LocationGroup>();

  for (const p of points) {
    const key = `${p.city}__${p.country}`;
    if (!map.has(key)) {
      map.set(key, {
        city: p.city,
        country: p.country,
        lat: p.lat,
        lng: p.lng,
        dateRange: { start: p.date, end: p.date },
        videos: [],
        isLatest: false,
      });
    }
    const group = map.get(key)!;
    group.videos.push({
      id: p.id,
      youtubeUrl: p.youtubeUrl,
      title: p.title,
      date: p.date,
    });
    if (p.date < group.dateRange.start) group.dateRange.start = p.date;
    if (p.date > group.dateRange.end) group.dateRange.end = p.date;
  }

  const groups = Array.from(map.values());

  if (groups.length > 0) {
    const latest = groups.reduce((a, b) =>
      a.dateRange.end >= b.dateRange.end ? a : b
    );
    latest.isLatest = true;
  }

  return groups;
}

/** LocationGroup からYouTube風ポップアップHTMLを生成 */
export function buildPopupHtml(group: LocationGroup): string {
  const dateLabel =
    group.dateRange.start === group.dateRange.end
      ? group.dateRange.start
      : `${group.dateRange.start} 〜 ${group.dateRange.end}`;

  const videoCards = group.videos
    .map((v) => {
      const thumbnail = getYouTubeThumbnail(v.youtubeUrl);
      return `
      <a href="${v.youtubeUrl}" target="_blank" rel="noopener noreferrer"
         style="display:flex;gap:10px;padding:8px;border-radius:8px;text-decoration:none;color:#E8E6E3;background:rgba(255,255,255,0.05);"
         onmouseover="this.style.background='rgba(255,255,255,0.1)'"
         onmouseout="this.style.background='rgba(255,255,255,0.05)'">
        <img src="${thumbnail}" alt="" loading="lazy"
             style="width:120px;height:68px;border-radius:6px;object-fit:cover;flex-shrink:0;" />
        <div style="flex:1;min-width:0;">
          <div style="font-size:13px;font-weight:600;line-height:1.3;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">
            ${v.title}
          </div>
          <div style="font-size:11px;color:#888;margin-top:4px;">${v.date}</div>
        </div>
      </a>`;
    })
    .join("");

  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;">
      <div style="padding:4px 0 8px;">
        <div style="font-size:15px;font-weight:700;color:#E8E6E3;">
          ${group.city}, ${group.country}
        </div>
        <div style="font-size:11px;color:#888;margin-top:2px;">
          ${dateLabel} ・ ${group.videos.length}本の動画
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px;max-height:280px;overflow-y:auto;scrollbar-width:thin;scrollbar-color:#444 transparent;">
        ${videoCards}
      </div>
      <div style="text-align:center;margin-top:10px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.1);">
        <a href="${KANTA_SOCIAL.youtube}" target="_blank" rel="noopener noreferrer"
           style="color:#FF0000;font-size:12px;font-weight:600;text-decoration:none;">
          ▶ チャンネルを見る
        </a>
      </div>
    </div>`;
}

export function loadLivestreamPoints(): LivestreamPoint[] {
  const candidates = [
    path.join(process.cwd(), "public", "data", "livestreams.csv"),
    path.join(process.cwd(), "frontend", "public", "data", "livestreams.csv"),
  ];
  const csvPath = candidates.find((p) => fs.existsSync(p));
  if (!csvPath) {
    throw new Error(
      `livestreams.csv not found. Tried: ${candidates.join(", ")}`
    );
  }
  const csv = fs.readFileSync(csvPath, "utf-8");
  return parseLivestreamCsv(csv);
}
