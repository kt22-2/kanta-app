import type { SafetyLevel } from "./types";

export function formatPopulation(population: number): string {
  if (population >= 1_000_000_000) {
    return `${(population / 1_000_000_000).toFixed(1)}B`;
  }
  if (population >= 1_000_000) {
    return `${(population / 1_000_000).toFixed(1)}M`;
  }
  if (population >= 1_000) {
    return `${(population / 1_000).toFixed(0)}K`;
  }
  return String(population);
}

export function getSafetyColor(level: SafetyLevel): string {
  const colors: Record<SafetyLevel, string> = {
    0: "text-green-400 bg-green-900/30 border-green-700",
    1: "text-yellow-400 bg-yellow-900/30 border-yellow-700",
    2: "text-orange-400 bg-orange-900/30 border-orange-700",
    3: "text-red-400 bg-red-900/30 border-red-700",
    4: "text-red-200 bg-red-950/60 border-red-900",
  };
  return colors[level] ?? colors[1];
}

export function getSafetyLabel(level: SafetyLevel): string {
  const labels: Record<SafetyLevel, string> = {
    0: "安全",
    1: "注意",
    2: "危険",
    3: "渡航中止",
    4: "退避勧告",
  };
  return labels[level] ?? "不明";
}

export function formatTimezoneFromJapan(utcOffset: string): string {
  const JAPAN_OFFSET = 9;
  const match = utcOffset.match(/^UTC([+-])(\d{2}):(\d{2})$/);
  let offsetHours: number;

  if (utcOffset === "UTC") {
    offsetHours = 0;
  } else if (match) {
    const sign = match[1] === "+" ? 1 : -1;
    offsetHours = sign * (parseInt(match[2], 10) + parseInt(match[3], 10) / 60);
  } else {
    return utcOffset;
  }

  const diff = offsetHours - JAPAN_OFFSET;
  if (diff === 0) {
    return "日本との時差: なし";
  }
  const formatted = Number.isInteger(diff) ? String(diff) : diff.toFixed(1);
  const sign = diff > 0 ? "+" : "";
  return `日本との時差: ${sign}${formatted}時間`;
}

export function getRegionLabel(region: string): string {
  const map: Record<string, string> = {
    Africa: "アフリカ",
    Americas: "アメリカ",
    Asia: "アジア",
    Europe: "ヨーロッパ",
    Oceania: "オセアニア",
    Antarctic: "南極",
  };
  return map[region] ?? region;
}
