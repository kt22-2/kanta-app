export interface Currency {
  code: string;
  name: string;
  symbol?: string;
}

export interface Country {
  code: string;
  name: string;
  name_ja?: string;
  capital?: string;
  region: string;
  subregion?: string;
  population: number;
  languages: string[];
  currencies: Currency[];
  flag_url: string;
  flag_emoji: string;
  latitude?: number;
  longitude?: number;
  timezones?: string[];
  safety_level?: number | null;
  borders?: string[];
}

export type SafetyLevel = 0 | 1 | 2 | 3 | 4;

export interface SafetyDetail {
  category: string;
  description: string;
  severity: "low" | "medium" | "high";
}

export interface SafetyInfo {
  country_code: string;
  level: SafetyLevel;
  level_label: string;
  summary: string;
  details: SafetyDetail[];
  last_updated?: string;
  mofa_url?: string;
  infection_level?: number;
  safety_measure_url?: string;
}

export interface EntryRequirement {
  country_code: string;
  visa_required: boolean;
  visa_on_arrival: boolean;
  visa_free_days?: number;
  passport_validity_months?: number;
  notes?: string;
}

export interface Attraction {
  name: string;
  description: string;
  category: string;
  highlights: string[];
}

export interface AttractionsResponse {
  country_code: string;
  country_name: string;
  attractions: Attraction[];
  best_season?: string;
  travel_tips: string[];
}

export interface NewsArticle {
  title: string;
  description: string | null;
  url: string;
  source: string;
  published_at: string | null;
}

export interface NewsResponse {
  country_code: string;
  articles: NewsArticle[];
  total: number;
}

export interface OTMAttraction {
  name: string;
  description: string | null;
  category: string | null;
  latitude: number | null;
  longitude: number | null;
  rating: number | null;
  wikipedia_url: string | null;
}

export interface HeritageSite {
  name: string;
  description: string | null;
  registered_year: number | null;
  latitude: number | null;
  longitude: number | null;
  image_url: string | null;
  wikipedia_url: string | null;
}

export interface EnrichedAttractionsResponse {
  country_code: string;
  country_name: string;
  heritage_sites: HeritageSite[];
  otm_attractions: OTMAttraction[];
  ai_summary: Attraction[];
  best_season: string | null;
  travel_tips: string[];
}

export interface ExchangeRate {
  currency_code: string;
  rate: number;
}

export interface ExchangeInfo {
  country_code: string;
  base: string;
  rates: ExchangeRate[];
  date: string | null;
  available: boolean;
}

export interface WikiSummary {
  country_code: string;
  title: string;
  summary: string;
  url: string | null;
  available: boolean;
}

export interface MonthlyClimate {
  month: number;
  temp_max: number | null;
  temp_min: number | null;
  precipitation: number | null;
}

export interface ClimateInfo {
  country_code: string;
  monthly: MonthlyClimate[];
  available: boolean;
}

export interface EconomicInfo {
  country_code: string;
  gdp_per_capita: number | null;
  gdp_year: number | null;
  available: boolean;
}

export interface XPost {
  id: string;
  text: string;
  created_at: string;
  url: string;
  media_url: string | null;
  like_count: number;
  retweet_count: number;
}
