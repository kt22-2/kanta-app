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
