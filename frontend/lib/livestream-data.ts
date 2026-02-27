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

export const KANTA_SOCIAL = {
  youtube: "https://www.youtube.com/@KANTA_worldwide",
  instagram: "https://www.instagram.com/kanta_worldwide/",
  x: "https://x.com/anta_kaoi",
};

export function parseLivestreamCsv(csv: string): LivestreamPoint[] {
  const lines = csv.trim().split("\n");
  // Skip header
  return lines.slice(1).map((line) => {
    const [id, city, country, lat, lng, date, youtubeUrl, title] =
      line.split(",");
    return {
      id: Number(id),
      city,
      country,
      lat: Number(lat),
      lng: Number(lng),
      date,
      youtubeUrl,
      title,
    };
  });
}

export interface LocationGroup {
  city: string;
  country: string;
  lat: number;
  lng: number;
  videos: LivestreamPoint[];
  dateRange: string;
}

export function getYouTubeVideoId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  return match ? match[1] : null;
}

export function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}

export function groupPointsByLocation(
  points: LivestreamPoint[]
): LocationGroup[] {
  if (points.length === 0) return [];

  const map = new Map<string, LivestreamPoint[]>();
  for (const point of points) {
    const key = `${point.city}::${point.country}`;
    const existing = map.get(key);
    if (existing) {
      existing.push(point);
    } else {
      map.set(key, [point]);
    }
  }

  const groups: LocationGroup[] = [];
  for (const videos of map.values()) {
    videos.sort((a, b) => a.date.localeCompare(b.date));
    const first = videos[0];
    const last = videos[videos.length - 1];
    const dateRange =
      first.date === last.date
        ? first.date
        : `${first.date} ~ ${last.date}`;

    groups.push({
      city: first.city,
      country: first.country,
      lat: first.lat,
      lng: first.lng,
      videos,
      dateRange,
    });
  }

  return groups;
}

export function buildPopupHtml(group: LocationGroup): string {
  const videoCount = group.videos.length;
  const videoItems = group.videos
    .map((video) => {
      const videoId = getYouTubeVideoId(video.youtubeUrl);
      const thumbnail = videoId
        ? getYouTubeThumbnail(videoId)
        : "";
      return `
      <a href="${video.youtubeUrl}" target="_blank" rel="noopener noreferrer" class="yt-popup-item">
        <div class="yt-popup-thumb-wrap">
          <img src="${thumbnail}" alt="${video.title}" class="yt-popup-thumb" />
          <div class="yt-popup-play">▶</div>
        </div>
        <div class="yt-popup-info">
          <div class="yt-popup-title">${video.title}</div>
          <div class="yt-popup-date">${video.date}</div>
        </div>
      </a>`;
    })
    .join("");

  return `
    <div class="yt-popup">
      <div class="yt-popup-header">
        <div class="yt-popup-location">📍 ${group.city}, ${group.country}</div>
        <div class="yt-popup-meta">${group.dateRange} ・ ${videoCount}本</div>
      </div>
      <div class="yt-popup-list">
        ${videoItems}
      </div>
    </div>`;
}

