import pytest
from fastapi.testclient import TestClient

from remote.main import create_app


@pytest.fixture
def app():
    return create_app()


@pytest.fixture
def client(app):
    return TestClient(app)


def _register(client, email, name):
    return client.post(
        "/auth/register",
        json={"email": email, "password": "password123", "name": name},
    ).json()


def _auth(token):
    return {"Authorization": f"Bearer {token}"}


PROTECTED_ROUTES = [
    ("POST", "/projects"),
    ("GET", "/projects/00000000-0000-0000-0000-000000000000/deck"),
    ("PUT", "/projects/00000000-0000-0000-0000-000000000000/deck"),
    ("POST", "/projects/00000000-0000-0000-0000-000000000000/comments"),
    ("POST", "/projects/00000000-0000-0000-0000-000000000000/compile"),
    ("POST", "/projects/00000000-0000-0000-0000-000000000000/export"),
    ("POST", "/projects/00000000-0000-0000-0000-000000000000/run"),
]


@pytest.mark.parametrize("method,path", PROTECTED_ROUTES)
def test_protected_routes_require_token(client, method, path):
    res = client.request(method, path, json={})
    assert res.status_code == 401


@pytest.mark.parametrize("method,path", PROTECTED_ROUTES)
def test_protected_routes_reject_garbage_token(client, method, path):
    res = client.request(method, path, json={}, headers=_auth("garbage"))
    assert res.status_code == 401


def test_shared_assets_are_public(client):
    assert client.get("/presets").status_code == 200
    assert client.get("/skills/SKILL").status_code == 200
    assert client.get("/spec/workflow/review").status_code == 200


def test_create_project_and_owner_reads_deck(client):
    token = _register(client, "owner@example.com", "Owner")["access_token"]

    created = client.post("/projects", headers=_auth(token))
    assert created.status_code == 201
    project_id = created.json()["projectId"]

    deck = client.get(f"/projects/{project_id}/deck", headers=_auth(token))
    assert deck.status_code == 200
    assert deck.json() == {"slides": []}


def test_owner_can_update_deck(client):
    token = _register(client, "owner@example.com", "Owner")["access_token"]
    project_id = client.post("/projects", headers=_auth(token)).json()["projectId"]
    presentation = {"slides": [{"id": "s1", "title": "Hi"}]}

    res = client.put(
        f"/projects/{project_id}/deck",
        headers=_auth(token),
        json=presentation,
    )
    assert res.status_code == 200
    assert client.get(f"/projects/{project_id}/deck", headers=_auth(token)).json() == presentation


def test_owner_can_comment(client):
    token = _register(client, "owner@example.com", "Owner")["access_token"]
    project_id = client.post("/projects", headers=_auth(token)).json()["projectId"]

    res = client.post(
        f"/projects/{project_id}/comments",
        headers=_auth(token),
        json={"comment": "make it bolder"},
    )
    assert res.status_code == 201
    body = res.json()
    assert body["comment"] == "make it bolder"
    assert body["projectId"] == project_id


def test_other_user_cannot_read_foreign_project(client):
    owner = _register(client, "owner@example.com", "Owner")["access_token"]
    intruder = _register(client, "intruder@example.com", "Intruder")["access_token"]
    project_id = client.post("/projects", headers=_auth(owner)).json()["projectId"]

    res = client.get(f"/projects/{project_id}/deck", headers=_auth(intruder))
    assert res.status_code == 403


def test_other_user_cannot_update_foreign_project(client):
    owner = _register(client, "owner@example.com", "Owner")["access_token"]
    intruder = _register(client, "intruder@example.com", "Intruder")["access_token"]
    project_id = client.post("/projects", headers=_auth(owner)).json()["projectId"]

    res = client.put(
        f"/projects/{project_id}/deck",
        headers=_auth(intruder),
        json={"slides": []},
    )
    assert res.status_code == 403


def test_other_user_cannot_comment_on_foreign_project(client):
    owner = _register(client, "owner@example.com", "Owner")["access_token"]
    intruder = _register(client, "intruder@example.com", "Intruder")["access_token"]
    project_id = client.post("/projects", headers=_auth(owner)).json()["projectId"]

    res = client.post(
        f"/projects/{project_id}/comments",
        headers=_auth(intruder),
        json={"comment": "sneaky"},
    )
    assert res.status_code == 403


def test_unknown_project_returns_404(client):
    token = _register(client, "owner@example.com", "Owner")["access_token"]
    res = client.get(
        f"/projects/00000000-0000-0000-0000-000000000000/deck",
        headers=_auth(token),
    )
    assert res.status_code == 404


def test_unimplemented_actions_require_token_before_501(client):
    token = _register(client, "owner@example.com", "Owner")["access_token"]
    project_id = client.post("/projects", headers=_auth(token)).json()["projectId"]

    for path in ("compile", "export", "run"):
        res = client.post(f"/projects/{project_id}/{path}", headers=_auth(token), json={})
        assert res.status_code == 501
