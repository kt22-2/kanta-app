from __future__ import annotations
from datetime import datetime
from pydantic import BaseModel


class Currency(BaseModel):
    code: str
    name: str
    symbol: str | None = None


class Country(BaseModel):
    code: str
    name: str
    name_ja: str | None = None
    capital: str | None = None
    region: str
    subregion: str | None = None
    population: int
    languages: list[str]
    currencies: list[Currency]
    flag_url: str
    flag_emoji: str
    latitude: float | None = None
    longitude: float | None = None
    safety_level: int | None = None
    borders: list[str] = []
    timezones: list[str] = []


class SafetyDetail(BaseModel):
    category: str
    description: str
    severity: str  # "low" | "medium" | "high"


class SafetyInfo(BaseModel):
    country_code: str
    level: int  # 0=安全 1=注意 2=危険 3=渡航中止 4=退避勧告
    level_label: str
    summary: str
    details: list[SafetyDetail]
    last_updated: datetime | None = None
    mofa_url: str | None = None
    infection_level: int = 0
    safety_measure_url: str | None = None


class EntryRequirement(BaseModel):
    country_code: str
    visa_required: bool
    visa_on_arrival: bool
    visa_free_days: int | None = None
    passport_validity_months: int | None = None
    notes: str | None = None


class Attraction(BaseModel):
    name: str
    description: str
    category: str
    highlights: list[str]


class AttractionsResponse(BaseModel):
    country_code: str
    country_name: str
    attractions: list[Attraction]
    best_season: str | None = None
    travel_tips: list[str]


class NewsArticle(BaseModel):
    title: str
    description: str | None = None
    url: str
    source: str
    published_at: str | None = None


class NewsResponse(BaseModel):
    country_code: str
    articles: list[NewsArticle]
    total: int


class OTMAttraction(BaseModel):
    name: str
    description: str | None = None
    category: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    rating: float | None = None
    wikipedia_url: str | None = None


class HeritageSite(BaseModel):
    name: str
    description: str | None = None
    registered_year: int | None = None
    latitude: float | None = None
    longitude: float | None = None
    image_url: str | None = None
    wikipedia_url: str | None = None


class EnrichedAttractionsResponse(BaseModel):
    country_code: str
    country_name: str
    heritage_sites: list[HeritageSite] = []
    otm_attractions: list[OTMAttraction]
    ai_summary: list[Attraction]
    best_season: str | None = None
    travel_tips: list[str] = []


class ExchangeRate(BaseModel):
    currency_code: str
    rate: float  # 1 JPY = rate 外貨


class ExchangeInfo(BaseModel):
    country_code: str
    base: str = "JPY"
    rates: list[ExchangeRate]
    date: str | None = None
    available: bool = True


class WikiSummary(BaseModel):
    country_code: str
    title: str
    summary: str
    url: str | None = None
    available: bool = True


class MonthlyClimate(BaseModel):
    month: int
    temp_max: float | None = None
    temp_min: float | None = None
    precipitation: float | None = None


class ClimateInfo(BaseModel):
    country_code: str
    monthly: list[MonthlyClimate]
    available: bool = True


class EconomicInfo(BaseModel):
    country_code: str
    gdp_per_capita: float | None = None
    gdp_year: int | None = None
    available: bool = True
