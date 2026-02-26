import fs from "fs";
import path from "path";

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
  x: "https://x.com/kanta_worldwide",
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

export function loadLivestreamPoints(): LivestreamPoint[] {
  const csvPath = path.join(process.cwd(), "public", "data", "livestreams.csv");
  const csv = fs.readFileSync(csvPath, "utf-8");
  return parseLivestreamCsv(csv);
}
