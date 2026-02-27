import fs from "fs";
import path from "path";
import { parseLivestreamCsv, type LivestreamPoint } from "./livestream-data";

export function loadLivestreamPoints(): LivestreamPoint[] {
  // process.cwd() がプロジェクトルート（next dev frontend 形式）の場合と
  // frontendディレクトリ（npm run dev 形式）の場合の両方に対応
  const candidates = [
    path.join(process.cwd(), "public", "data", "livestreams.csv"),
    path.join(process.cwd(), "frontend", "public", "data", "livestreams.csv"),
  ];
  const csvPath = candidates.find((p) => fs.existsSync(p));
  if (!csvPath) {
    throw new Error(`livestreams.csv not found. Tried: ${candidates.join(", ")}`);
  }
  const csv = fs.readFileSync(csvPath, "utf-8");
  return parseLivestreamCsv(csv);
}
