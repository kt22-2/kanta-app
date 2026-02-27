import type {
  Country,
  SafetyInfo,
  EntryRequirement,
  AttractionsResponse,
  NewsResponse,
  EnrichedAttractionsResponse,
  ExchangeInfo,
  WikiSummary,
  ClimateInfo,
  EconomicInfo,
} from "./types";

// サーバー側: バックエンドに直接接続、クライアント側: Next.js rewrites 経由（相対URL）
const API_BASE =
  typeof window === "undefined"
    ? (process.env.BACKEND_URL ?? "http://127.0.0.1:8000")
    : "";

async function fetchApi<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function getCountries(
  query?: string,
  region?: string,
  safetyLevel?: number
): Promise<Country[]> {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (region) params.set("region", region);
  if (safetyLevel !== undefined) params.set("safety_level", safetyLevel.toString());
  const qs = params.toString();
  return fetchApi<Country[]>(`/api/countries${qs ? `?${qs}` : ""}`);
}

export async function getCountry(code: string): Promise<Country> {
  return fetchApi<Country>(`/api/countries/${code}`);
}

export async function getSafetyInfo(code: string): Promise<SafetyInfo> {
  return fetchApi<SafetyInfo>(`/api/countries/${code}/safety`);
}

export async function getEntryRequirement(
  code: string
): Promise<EntryRequirement> {
  return fetchApi<EntryRequirement>(`/api/countries/${code}/entry`);
}

export async function getAttractions(
  code: string
): Promise<EnrichedAttractionsResponse> {
  return fetchApi<EnrichedAttractionsResponse>(`/api/countries/${code}/attractions`);
}

export async function getNews(code: string): Promise<NewsResponse> {
  return fetchApi<NewsResponse>(`/api/countries/${code}/news`);
}

export async function getExchangeInfo(code: string): Promise<ExchangeInfo> {
  return fetchApi<ExchangeInfo>(`/api/countries/${code}/exchange`);
}

export async function getWikiSummary(code: string): Promise<WikiSummary> {
  return fetchApi<WikiSummary>(`/api/countries/${code}/wiki`);
}

export async function getClimateInfo(code: string): Promise<ClimateInfo> {
  return fetchApi<ClimateInfo>(`/api/countries/${code}/climate`);
}

export async function getEconomicInfo(code: string): Promise<EconomicInfo> {
  return fetchApi<EconomicInfo>(`/api/countries/${code}/economic`);
}
