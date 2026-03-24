from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Literal, Optional
import json


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    ENV: Literal["development", "production", "test"] = "development"

    # Railway injects DATABASE_URL automatically; DB_URL is the legacy/local name.
    # database_url property resolves the effective URL with SQLite as last fallback.
    DATABASE_URL: Optional[str] = None
    DB_URL: str = "sqlite:///./mmotor.db"

    JWT_SECRET: str = "your-secret-key-change-in-production-min-32-chars"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRES_MIN: int = 30
    CORS_ORIGINS: str = '["http://localhost:3000","http://127.0.0.1:3000","http://localhost:5173","http://127.0.0.1:5173"]'
    APP_NAME: str = "M-Motor API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    PORT: int = 8000
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_MB: int = 5
    ALLOWED_UPLOAD_EXTENSIONS: list[str] = [".pdf", ".jpg", ".jpeg", ".png"]
    ALLOWED_MIME_TYPES: list[str] = [
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png"
    ]

    @property
    def database_url(self) -> str:
        """Effective database URL: DATABASE_URL > DB_URL > SQLite fallback."""
        return self.DATABASE_URL or self.DB_URL

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS_ORIGINS string as JSON list."""
        try:
            return json.loads(self.CORS_ORIGINS)
        except (json.JSONDecodeError, TypeError):
            return ["*"]

    @property
    def max_upload_bytes(self) -> int:
        return self.MAX_UPLOAD_MB * 1024 * 1024

    @property
    def is_production(self) -> bool:
        return self.ENV == "production"

    @property
    def is_development(self) -> bool:
        return self.ENV == "development"

    @property
    def is_test(self) -> bool:
        return self.ENV == "test"

    @property
    def is_sqlite(self) -> bool:
        return self.database_url.startswith("sqlite")


settings = Settings()
