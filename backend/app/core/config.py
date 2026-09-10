import os
from dataclasses import dataclass

@dataclass(frozen=True)
class Settings:
    ai_api_url: str = os.getenv("AI_API_URL", "")
    ai_api_key: str = os.getenv("AI_API_KEY", "")
    ai_model: str = os.getenv("AI_MODEL", "")

settings = Settings()
