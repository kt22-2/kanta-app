from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    anthropic_api_key: str = ""
    restcountries_base_url: str = "https://restcountries.com/v3.1"
    cache_ttl_hours: int = 24
    news_api_key: str = ""
    opentripmap_api_key: str = ""
    news_cache_ttl_minutes: int = 30
    cors_origins: str = "http://localhost:3000"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]


settings = Settings()
