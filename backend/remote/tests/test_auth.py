import time
from urllib.parse import parse_qs, urlparse

import pytest
from fastapi.testclient import TestClient

from remote.main import create_app


@pytest.fixture
def app():
    return create_app()


@pytest.fixture
def client(app):
    return TestClient(app)


def _register(client, email="alice@example.com", password="password123", name="Alice"):
    return client.post(
        "/auth/register",
        json={"email": email, "password": password, "name": name},
    )


def _login(client, email, password):
    return client.post("/auth/login", json={"email": email, "password": password})


def _auth(token):
    return {"Authorization": f"Bearer {token}"}


def test_register_returns_tokens_and_user(client):
    res = _register(client)
    assert res.status_code == 201
    body = res.json()
    assert body["access_token"]
    assert body["refresh_token"]
    assert body["token_type"] == "bearer"
    assert body["expires_in"] > 0
    user = body["user"]
    assert user["email"] == "alice@example.com"
    assert user["name"] == "Alice"
    assert "password" not in user


def test_register_rejects_duplicate_email(client):
    assert _register(client).status_code == 201
    res = _register(client, name="Bob")
    assert res.status_code == 409


def test_register_rejects_weak_password(client):
    res = _register(client, password="short")
    assert res.status_code == 422


def test_register_rejects_invalid_email(client):
    res = _register(client, email="not-an-email")
    assert res.status_code == 422


def test_login_success(client):
    _register(client)
    res = _login(client, "alice@example.com", "password123")
    assert res.status_code == 200
    assert res.json()["access_token"]
    assert res.json()["user"]["email"] == "alice@example.com"


def test_login_wrong_password_unauthorized(client):
    _register(client)
    assert _login(client, "alice@example.com", "wrong-pass").status_code == 401


def test_login_unknown_email_unauthorized(client):
    assert _login(client, "nobody@example.com", "password123").status_code == 401


def test_me_with_valid_token(client):
    reg = _register(client).json()
    res = client.get("/auth/me", headers=_auth(reg["access_token"]))
    assert res.status_code == 200
    assert res.json()["email"] == "alice@example.com"


def test_me_without_token(client):
    assert client.get("/auth/me").status_code == 401


def test_me_rejects_garbage_token(client):
    res = client.get("/auth/me", headers=_auth("not.a.token"))
    assert res.status_code == 401


def test_me_rejects_expired_access_token(client, app):
    reg = _register(client).json()
    service = app.state.auth
    expired = service.create_access_token(service.user_store.by_email["alice@example.com"], ttl_seconds=-10)
    res = client.get("/auth/me", headers=_auth(expired))
    assert res.status_code == 401


def test_refresh_rotates_pair(client):
    reg = _register(client).json()
    old_refresh = reg["refresh_token"]
    res = client.post("/auth/refresh", json={"refresh_token": old_refresh})
    assert res.status_code == 200
    body = res.json()
    assert body["access_token"]
    assert body["refresh_token"] != old_refresh


def test_refresh_rejects_reused_token_after_rotation(client):
    reg = _register(client).json()
    old_refresh = reg["refresh_token"]
    assert client.post("/auth/refresh", json={"refresh_token": old_refresh}).status_code == 200
    assert client.post("/auth/refresh", json={"refresh_token": old_refresh}).status_code == 401


def test_refresh_rejects_garbage_token(client):
    assert client.post("/auth/refresh", json={"refresh_token": "garbage"}).status_code == 401


def test_logout_revokes_refresh_token(client):
    reg = _register(client).json()
    res = client.post("/auth/logout", headers=_auth(reg["access_token"]), json={"refresh_token": reg["refresh_token"]})
    assert res.status_code == 204
    assert client.post("/auth/refresh", json={"refresh_token": reg["refresh_token"]}).status_code == 401


def test_password_reset_flow(client, app):
    reg = _register(client).json()
    service = app.state.auth

    res = client.post("/auth/forgot-password", json={"email": "alice@example.com"})
    assert res.status_code == 204
    token = next(iter(service.password_reset_tokens))

    res = client.post("/auth/reset-password", json={"token": token, "new_password": "new-password-456"})
    assert res.status_code == 204
    assert token not in service.password_reset_tokens

    assert _login(client, "alice@example.com", "password123").status_code == 401
    assert _login(client, "alice@example.com", "new-password-456").status_code == 200


def test_password_reset_rejects_unknown_email(client):
    assert client.post("/auth/forgot-password", json={"email": "nobody@example.com"}).status_code == 204


def test_password_reset_rejects_bad_token(client):
    res = client.post("/auth/reset-password", json={"token": "garbage", "new_password": "new-password-456"})
    assert res.status_code == 401


def test_email_verification_flow(client, app):
    reg = _register(client).json()
    service = app.state.auth
    assert reg["user"]["emailVerified"] is False

    res = client.post("/auth/request-verification", json={"email": "alice@example.com"})
    assert res.status_code == 204
    token = next(iter(service.verification_tokens))

    res = client.post("/auth/verify", json={"token": token})
    assert res.status_code == 204

    me = client.get("/auth/me", headers=_auth(reg["access_token"])).json()
    assert me["emailVerified"] is True


def test_oauth_authorize_redirects_to_provider(client, app):
    service = app.state.auth
    service._provider_authorize_url = _fake_authorize_url

    res = client.get("/auth/oauth/github/authorize", follow_redirects=False)
    assert res.status_code == 307
    location = urlparse(res.headers["location"])
    assert location.hostname == "github.com"
    assert "state" in parse_qs(location.query)


def test_oauth_unknown_provider(client):
    res = client.get("/auth/oauth/notreal/authorize")
    assert res.status_code == 400


def test_oauth_github_callback_creates_user(app, client):
    service = app.state.auth
    service._provider_authorize_url = _fake_authorize_url
    service._exchange_code = _fake_exchange
    service._fetch_userinfo = _fake_userinfo

    authorize = client.get("/auth/oauth/github/authorize", follow_redirects=False)
    state = parse_qs(urlparse(authorize.headers["location"]).query)["state"][0]

    res = client.get(f"/auth/oauth/github/callback?code=abc&state={state}")
    assert res.status_code == 200
    body = res.json()
    assert body["access_token"]
    assert body["user"]["email"] == "github@example.com"
    assert body["user"]["name"] == "GitHub User"

    me = client.get("/auth/me", headers=_auth(body["access_token"])).json()
    assert me["email"] == "github@example.com"


def test_oauth_callback_rejects_unknown_state(client):
    res = client.get("/auth/oauth/github/callback?code=abc&state=forged-state")
    assert res.status_code == 400


def test_oauth_callback_rejects_missing_state(client):
    res = client.get("/auth/oauth/github/callback?code=abc")
    assert res.status_code == 400


def test_oauth_callback_rejects_state_provider_mismatch(app, client):
    service = app.state.auth
    service._provider_authorize_url = _fake_authorize_url

    authorize = client.get("/auth/oauth/github/authorize", follow_redirects=False)
    state = parse_qs(urlparse(authorize.headers["location"]).query)["state"][0]
    res = client.get(f"/auth/oauth/google/callback?code=abc&state={state}")
    assert res.status_code == 400


async def _fake_authorize_url(provider, state):
    return f"https://github.com/login/oauth/authorize?client_id=fake&state={state}"


async def _fake_exchange(provider, code):
    assert code == "abc"
    return "provider-oauth-token"


async def _fake_userinfo(provider, access_token):
    return {
        "id": "gh-12345",
        "email": "github@example.com",
        "name": "GitHub User",
    }
