import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parents[2]
ENV_FILE = BASE_DIR / ".env"

load_dotenv(ENV_FILE)

class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./constructflow.db")
    AUTH_PROVIDER: str = os.getenv("AUTH_PROVIDER", "demo")
    STORAGE_PROVIDER: str = os.getenv("STORAGE_PROVIDER", "local")
    NOTIFICATION_PROVIDER: str = os.getenv("NOTIFICATION_PROVIDER", "local")
    GOOGLE_INTEGRATIONS_ENABLED: bool = os.getenv("GOOGLE_INTEGRATIONS_ENABLED", "false").lower() == "true"
    RBAC_ENABLED: bool = os.getenv("RBAC_ENABLED", "false").lower() == "true"

settings = Settings()
