from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False)

    port: int = 8000
    mongo_uri: str = "mongodb://localhost:27017/temple_bookings"
    jwt_secret: str = "change-this-to-a-long-random-secret"
    cors_origin: str = "*"


settings = Settings()
