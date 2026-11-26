"""Konfigurasi aplikasi dari variabel lingkungan (lihat .env.example)."""

from functools import lru_cache
from pathlib import Path

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parents[2]
DEV_SECRET = "dev-only-secret-change-me-please-0123456789"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=BASE_DIR / ".env", extra="ignore")

    env: str = "development"
    database_url: str = f"sqlite:///{(BASE_DIR / 'data' / 'app.db').as_posix()}"
    jwt_secret: str = DEV_SECRET
    jwt_expire_minutes: int = 480
    cors_origins: str = ""
    log_level: str = "INFO"
    # Bila diisi (mis. ../frontend/dist), backend juga menyajikan frontend: satu layanan, satu domain.
    static_dir: str = ""
    # AI (ADR-016): hanya untuk peneliti. Kunci TIDAK PERNAH dikirim ke frontend.
    gemini_api_key: str = ""
    gemini_model: str = "gemini-3.8-flash"
    # Dicoba berurutan bila model utama sibuk (503/429) atau habis waktu.
    gemini_fallback_models: str = "gemini-3.6-flash,gemini-3.5-flash-lite"
    ai_student_calls_per_hour: int = 20
    gemini_timeout_seconds: float = 25.0
    ai_calls_per_hour: int = 60

    @model_validator(mode="after")
    def _production_guard(self):
        if self.env == "production" and (self.jwt_secret == DEV_SECRET or len(self.jwt_secret) < 32):
            raise ValueError("JWT_SECRET produksi wajib acak, ≥ 32 karakter (DEPLOYMENT_GUIDE §2).")
        return self

    @property
    def is_production(self) -> bool:
        return self.env == "production"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def ai_enabled(self) -> bool:
        return bool(self.gemini_api_key.strip())

    @property
    def static_path(self) -> Path | None:
        if not self.static_dir:
            return None
        p = Path(self.static_dir)
        p = p if p.is_absolute() else (BASE_DIR / p)
        return p.resolve() if (p / "index.html").exists() else None


@lru_cache
def get_settings() -> Settings:
    return Settings()
