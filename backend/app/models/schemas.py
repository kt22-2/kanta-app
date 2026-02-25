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
