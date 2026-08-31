import asyncio
import logging
from dataclasses import dataclass, field
from datetime import datetime, timezone, timedelta
from typing import Protocol
from uuid import uuid4

import httpx
import jwt as pyjwt
from fastapi import Depends, HTTPException, Request
from pwdlib import PasswordHash

from .config import Settings

logger = logging.getLogger("remote.auth")

_password_hasher = PasswordHash.recommended()


class AuthError(Exception):
    status_code = 401
    message = "unauthorized"


class InvalidCredentials(AuthError):
    message = "invalid email or password"


class EmailTaken(AuthError):
    status_code = 409
    message = "email already registered"


class OAuthEmailTaken(AuthError):
    status_code = 409
    message = "email already registered to another account"


class InvalidToken(AuthError):
    message = "invalid or expired token"


class UnknownOAuthProvider(AuthError):
    status_code = 400
    message = "unknown oauth provider"


class InvalidOAuthState(AuthError):
    status_code = 400
    message = "invalid oauth state"


class OAuthNotConfigured(AuthError):
    status_code = 503
    message = "oauth provider is not configured"


OAUTH_PROVIDERS = ("github", "google")


@dataclass
class User:
    id: str
    email: str
    name: str
    password_hash: str | None = None
    oauth_provider: str | None = None
    oauth_provider_user_id: str | None = None
    email_verified: bool = False
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "emailVerified": self.email_verified,
            "oauthProvider": self.oauth_provider,
            "createdAt": self.created_at.isoformat(),
        }


def _hash_password(password: str) -> str:
    return _password_hasher.hash(password)


def _verify_password(password: str, password_hash: str) -> bool:
    try:
        return _password_hasher.verify(password, password_hash)
    except Exception:
        return False


class TokenService:
    def __init__(self, settings: Settings):
        self.settings = settings

    def _encode(self, sub: str, token_type: str, ttl_seconds: int, *, jti: str | None = None) -> str:
        now = datetime.now(timezone.utc)
        payload = {
            "sub": sub,
            "type": token_type,
            "iat": now,
            "exp": now + timedelta(seconds=ttl_seconds),
            "jti": jti or uuid4().hex,
        }
        return pyjwt.encode(
            payload,
            self.settings.jwt_secret,
            algorithm=self.settings.jwt_algorithm,
        )

    def create_access_token(self, user: User, *, ttl_seconds: int | None = None) -> str:
        ttl = self.settings.access_token_ttl_seconds if ttl_seconds is None else ttl_seconds
        return self._encode(user.id, "access", ttl)

    def create_refresh_token(self, user: User) -> str:
        return self._encode(user.id, "refresh", self.settings.refresh_token_ttl_seconds)

    def create_reset_token(self, user: User) -> str:
        return self._encode(user.id, "reset", self.settings.password_reset_ttl_seconds)

    def create_verify_token(self, user: User) -> str:
        return self._encode(user.id, "verify", self.settings.verification_ttl_seconds)

    def decode(self, token: str, expected_type: str) -> dict:
        try:
            payload = pyjwt.decode(
                token,
                self.settings.jwt_secret,
                algorithms=[self.settings.jwt_algorithm],
            )
        except pyjwt.PyJWTError as exc:
            raise InvalidToken from exc
        if payload.get("type") != expected_type:
            raise InvalidToken
        return payload


class UserStore(Protocol):
    async def create_user(
        self,
        *,
        email: str,
        name: str,
        password_hash: str | None = None,
        oauth_provider: str | None = None,
        oauth_provider_user_id: str | None = None,
        email_verified: bool = False,
    ) -> User: ...

    async def get_user_by_id(self, user_id: str) -> User | None: ...

    async def get_user_by_email(self, email: str) -> User | None: ...

    async def get_user_by_oauth(self, provider: str, provider_user_id: str) -> User | None: ...

    async def set_password(self, user_id: str, password_hash: str) -> None: ...

    async def set_email_verified(self, user_id: str, verified: bool = True) -> None: ...


class MemoryUserStore:
    def __init__(self) -> None:
        self.by_id: dict[str, User] = {}
        self.by_email: dict[str, User] = {}
        self.by_oauth: dict[tuple[str, str], User] = {}
        self._lock = asyncio.Lock()

    async def create_user(
        self,
        *,
        email: str,
        name: str,
        password_hash: str | None = None,
        oauth_provider: str | None = None,
        oauth_provider_user_id: str | None = None,
        email_verified: bool = False,
    ) -> User:
        email = email.lower()
        async with self._lock:
            if email in self.by_email:
                raise EmailTaken
            user = User(
                id=uuid4().hex,
                email=email,
                name=name,
                password_hash=password_hash,
                oauth_provider=oauth_provider,
                oauth_provider_user_id=oauth_provider_user_id,
                email_verified=email_verified,
            )
            self.by_id[user.id] = user
            self.by_email[email] = user
            if oauth_provider and oauth_provider_user_id:
                self.by_oauth[(oauth_provider, oauth_provider_user_id)] = user
            return user

    async def get_user_by_id(self, user_id: str) -> User | None:
        return self.by_id.get(user_id)

    async def get_user_by_email(self, email: str) -> User | None:
        return self.by_email.get(email.lower())

    async def get_user_by_oauth(self, provider: str, provider_user_id: str) -> User | None:
        return self.by_oauth.get((provider, provider_user_id))

    async def set_password(self, user_id: str, password_hash: str) -> None:
        user = self.by_id.get(user_id)
        if user is not None:
            user.password_hash = password_hash

    async def set_email_verified(self, user_id: str, verified: bool = True) -> None:
        user = self.by_id.get(user_id)
        if user is not None:
            user.email_verified = verified


class RefreshTokenStore(Protocol):
    async def add(self, token_jti: str, user_id: str, expires_at: datetime) -> None: ...

    async def is_revoked(self, token_jti: str) -> bool: ...

    async def revoke(self, token_jti: str) -> None: ...


class MemoryRefreshTokenStore:
    def __init__(self) -> None:
        self._tokens: dict[str, dict] = {}

    async def add(self, token_jti: str, user_id: str, expires_at: datetime) -> None:
        self._tokens[token_jti] = {"user_id": user_id, "expires_at": expires_at, "revoked": False}

    async def is_revoked(self, token_jti: str) -> bool:
        record = self._tokens.get(token_jti)
        if record is None:
            return True
        return record["revoked"]

    async def revoke(self, token_jti: str) -> None:
        record = self._tokens.get(token_jti)
        if record is not None:
            record["revoked"] = True


class OAuthStateStore(Protocol):
    async def put(self, state: str, provider: str, expires_at: datetime) -> None: ...

    async def take(self, state: str) -> str | None: ...


class MemoryOAuthStateStore:
    def __init__(self) -> None:
        self._states: dict[str, tuple[str, datetime]] = {}

    async def put(self, state: str, provider: str, expires_at: datetime) -> None:
        self._states[state] = (provider, expires_at)

    async def take(self, state: str) -> str | None:
        record = self._states.pop(state, None)
        if record is None:
            return None
        provider, expires_at = record
        if datetime.now(timezone.utc) > expires_at:
            return None
        return provider


class AuthService:
    def __init__(
        self,
        settings: Settings,
        *,
        user_store: UserStore | None = None,
        refresh_store: RefreshTokenStore | None = None,
        oauth_state_store: OAuthStateStore | None = None,
        token_service: TokenService | None = None,
    ) -> None:
        self.settings = settings
        self.user_store = user_store or MemoryUserStore()
        self.refresh_store = refresh_store or MemoryRefreshTokenStore()
        self.oauth_state_store = oauth_state_store or MemoryOAuthStateStore()
        self.token_service = token_service or TokenService(settings)
        self.password_reset_tokens: dict[str, str] = {}
        self.verification_tokens: dict[str, str] = {}

    def create_access_token(self, user: User, *, ttl_seconds: int | None = None) -> str:
        return self.token_service.create_access_token(user, ttl_seconds=ttl_seconds)

    def create_refresh_token(self, user: User) -> str:
        return self.token_service.create_refresh_token(user)

    async def register(self, email: str, password: str, name: str) -> dict:
        user = await self.user_store.create_user(
            email=email,
            name=name,
            password_hash=_hash_password(password),
        )
        return await self._issue_pair(user)

    async def login(self, email: str, password: str) -> dict:
        user = await self.user_store.get_user_by_email(email)
        if user is None or user.password_hash is None or not _verify_password(password, user.password_hash):
            raise InvalidCredentials
        return await self._issue_pair(user)

    async def refresh(self, refresh_token: str) -> dict:
        payload = self.token_service.decode(refresh_token, "refresh")
        if await self.refresh_store.is_revoked(payload["jti"]):
            raise InvalidToken
        user = await self.user_store.get_user_by_id(payload["sub"])
        if user is None:
            raise InvalidToken
        await self.refresh_store.revoke(payload["jti"])
        return await self._issue_pair(user)

    async def logout(self, refresh_token: str) -> None:
        try:
            payload = self.token_service.decode(refresh_token, "refresh")
        except InvalidToken:
            return
        await self.refresh_store.revoke(payload["jti"])

    async def authenticate(self, access_token: str) -> User:
        payload = self.token_service.decode(access_token, "access")
        user = await self.user_store.get_user_by_id(payload["sub"])
        if user is None:
            raise InvalidToken
        return user

    async def _issue_pair(self, user: User) -> dict:
        access = self.create_access_token(user)
        refresh = self.create_refresh_token(user)
        payload = self.token_service.decode(refresh, "refresh")
        await self.refresh_store.add(
            payload["jti"],
            user.id,
            datetime.fromtimestamp(payload["exp"], tz=timezone.utc),
        )
        return {
            "access_token": access,
            "refresh_token": refresh,
            "token_type": "bearer",
            "expires_in": self.settings.access_token_ttl_seconds,
            "user": user.to_dict(),
        }

    # --- OAuth ---

    async def oauth_authorize(self, provider: str) -> str:
        self._require_provider(provider)
        state = uuid4().hex
        await self.oauth_state_store.put(
            state,
            provider,
            datetime.now(timezone.utc) + timedelta(seconds=self.settings.oauth_state_ttl_seconds),
        )
        return await self._provider_authorize_url(provider, state)

    async def oauth_callback(self, provider: str, code: str, state: str | None) -> dict:
        if not code or not state:
            raise InvalidOAuthState
        stored_provider = await self.oauth_state_store.take(state)
        if stored_provider != provider:
            raise InvalidOAuthState
        self._require_provider(provider)
        access_token = await self._exchange_code(provider, code)
        info = await self._fetch_userinfo(provider, access_token)
        user = await self._get_or_create_oauth_user(provider, info)
        return await self._issue_pair(user)

    def _require_provider(self, provider: str) -> None:
        if provider not in OAUTH_PROVIDERS:
            raise UnknownOAuthProvider

    async def _provider_authorize_url(self, provider: str, state: str) -> str:
        redirect_uri = self.settings.oauth_redirect_uri(provider)
        if provider == "github":
            client_id = self.settings.oauth_github_client_id
            if not client_id:
                raise OAuthNotConfigured
            return (
                "https://github.com/login/oauth/authorize"
                f"?client_id={client_id}&redirect_uri={redirect_uri}"
                f"&scope=read:user%20user:email&state={state}"
            )
        if provider == "google":
            client_id = self.settings.oauth_google_client_id
            if not client_id:
                raise OAuthNotConfigured
            return (
                "https://accounts.google.com/o/oauth2/v2/auth"
                f"?client_id={client_id}&redirect_uri={redirect_uri}"
                f"&response_type=code&scope=openid%20email%20profile&state={state}"
            )
        raise UnknownOAuthProvider

    async def _exchange_code(self, provider: str, code: str) -> str:
        redirect_uri = self.settings.oauth_redirect_uri(provider)
        async with httpx.AsyncClient() as client:
            if provider == "github":
                client_id = self.settings.oauth_github_client_id
                client_secret = self.settings.oauth_github_client_secret
                if not client_id or not client_secret:
                    raise OAuthNotConfigured
                res = await client.post(
                    "https://github.com/login/oauth/access_token",
                    data={
                        "client_id": client_id,
                        "client_secret": client_secret,
                        "code": code,
                        "redirect_uri": redirect_uri,
                    },
                    headers={"Accept": "application/json"},
                )
            elif provider == "google":
                client_id = self.settings.oauth_google_client_id
                client_secret = self.settings.oauth_google_client_secret
                if not client_id or not client_secret:
                    raise OAuthNotConfigured
                res = await client.post(
                    "https://oauth2.googleapis.com/token",
                    data={
                        "client_id": client_id,
                        "client_secret": client_secret,
                        "code": code,
                        "grant_type": "authorization_code",
                        "redirect_uri": redirect_uri,
                    },
                )
            else:
                raise UnknownOAuthProvider
        if res.status_code != 200:
            raise InvalidOAuthState
        token = res.json().get("access_token")
        if not token:
            raise InvalidOAuthState
        return token

    async def _fetch_userinfo(self, provider: str, access_token: str) -> dict:
        async with httpx.AsyncClient() as client:
            if provider == "github":
                res = await client.get(
                    "https://api.github.com/user",
                    headers={"Authorization": f"Bearer {access_token}", "User-Agent": "deckworks-remote"},
                )
                res.raise_for_status()
                data = res.json()
                email = data.get("email")
                if not email:
                    emails = await client.get(
                        "https://api.github.com/user/emails",
                        headers={"Authorization": f"Bearer {access_token}", "User-Agent": "deckworks-remote"},
                    )
                    emails.raise_for_status()
                    primary = next((e for e in emails.json() if e.get("primary")), None)
                    email = primary.get("email") if primary else None
                return {
                    "id": str(data.get("id")),
                    "email": email,
                    "name": data.get("name") or data.get("login") or "GitHub User",
                }
            if provider == "google":
                res = await client.get(
                    "https://openidconnect.googleapis.com/v1/userinfo",
                    headers={"Authorization": f"Bearer {access_token}"},
                )
                res.raise_for_status()
                data = res.json()
                return {
                    "id": str(data.get("sub")),
                    "email": data.get("email"),
                    "name": data.get("name") or "Google User",
                }
        raise UnknownOAuthProvider

    async def _get_or_create_oauth_user(self, provider: str, info: dict) -> User:
        provider_user_id = str(info.get("id"))
        existing = await self.user_store.get_user_by_oauth(provider, provider_user_id)
        if existing is not None:
            return existing
        email = (info.get("email") or "").lower()
        name = info.get("name") or "User"
        if email:
            by_email = await self.user_store.get_user_by_email(email)
            if by_email is not None:
                raise OAuthEmailTaken
        return await self.user_store.create_user(
            email=email or f"{provider_user_id}@{provider}.id",
            name=name,
            oauth_provider=provider,
            oauth_provider_user_id=provider_user_id,
            email_verified=bool(email),
        )

    # --- password reset / email verification ---

    async def request_password_reset(self, email: str) -> None:
        user = await self.user_store.get_user_by_email(email)
        if user is None:
            return
        token = self.token_service.create_reset_token(user)
        self.password_reset_tokens[token] = user.id
        logger.warning(
            "password reset link (dev stub): %s/auth/reset-password?token=%s",
            self.settings.base_url,
            token,
        )

    async def reset_password(self, token: str, new_password: str) -> None:
        self.token_service.decode(token, "reset")
        user_id = self.password_reset_tokens.pop(token, None)
        if user_id is None:
            raise InvalidToken
        await self.user_store.set_password(user_id, _hash_password(new_password))

    async def request_verification(self, email: str) -> None:
        user = await self.user_store.get_user_by_email(email)
        if user is None or user.email_verified:
            return
        token = self.token_service.create_verify_token(user)
        self.verification_tokens[token] = user.id
        logger.warning(
            "email verification link (dev stub): %s/auth/verify?token=%s",
            self.settings.base_url,
            token,
        )

    async def verify_email(self, token: str) -> None:
        self.token_service.decode(token, "verify")
        user_id = self.verification_tokens.pop(token, None)
        if user_id is None:
            raise InvalidToken
        await self.user_store.set_email_verified(user_id, True)


def get_auth_service(request: Request) -> AuthService:
    return request.app.state.auth


def _bearer_token(request: Request) -> str | None:
    header = request.headers.get("authorization", "")
    scheme, _, token = header.partition(" ")
    if scheme.lower() != "bearer" or not token:
        return None
    return token.strip()


async def get_current_user(
    request: Request,
    auth: AuthService = Depends(get_auth_service),
) -> User:
    token = _bearer_token(request)
    if not token:
        raise HTTPException(
            status_code=401,
            detail="missing bearer token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        return await auth.authenticate(token)
    except AuthError as exc:
        raise HTTPException(
            status_code=exc.status_code,
            detail=exc.message,
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc
