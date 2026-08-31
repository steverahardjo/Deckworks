from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "deckworks-remote"

    jwt_secret: str = "dev-only-secret-change-me-0123456789abcdef"
    jwt_algorithm: str = "HS256"
    access_token_ttl_seconds: int = 15 * 60
    refresh_token_ttl_seconds: int = 30 * 24 * 60 * 60
    password_reset_ttl_seconds: int = 60 * 60
    verification_ttl_seconds: int = 24 * 60 * 60
    oauth_state_ttl_seconds: int = 10 * 60

    base_url: str = "http://localhost:8000"
    oauth_github_client_id: str | None = None
    oauth_github_client_secret: str | None = None
    oauth_google_client_id: str | None = None
    oauth_google_client_secret: str | None = None

    model_config = SettingsConfigDict(
        env_prefix="AUTH_",
        env_file=".env",
        extra="ignore",
    )

    def oauth_redirect_uri(self, provider: str) -> str:
        return f"{self.base_url.rstrip('/')}/auth/oauth/{provider}/callback"
