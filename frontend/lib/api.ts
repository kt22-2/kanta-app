import type {
  Country,
  SafetyInfo,
  EntryRequirement,
  AttractionsResponse,
  NewsResponse,
  EnrichedAttractionsResponse,
} from "./types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function fetchApi<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function getCountries(
  query?: string,
  region?: string
): Promise<Country[]> {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (region) params.set("region", region);
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
