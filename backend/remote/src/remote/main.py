import logging
import re
from pathlib import Path

from fastapi import APIRouter, Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse

from .auth import AuthError, AuthService, User, get_current_user
from .config import Settings
from .schema import (
    CommentRequest,
    ForgotPasswordRequest,
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    RequestVerificationRequest,
    ResetPasswordRequest,
    VerifyRequest,
)
from .store import MemoryProjectStore, Project

logger = logging.getLogger("remote")

SHARED_DIR = Path(__file__).resolve().parents[3] / "shared"
SKILLS_DIR = SHARED_DIR / "skills"
SPEC_DIR = SHARED_DIR / "spec"
WORKFLOW_DIR = SPEC_DIR / "workflow"
LOOK_DIR = SPEC_DIR / "look"

_LOOK_FIELD_RE = re.compile(r"^\|\s*\*\*(.+?)\*\*\s*\|\s*(.+?)\s*\|\s*$")
_LOOK_NAME_RE = re.compile(r"^#\s*Look spec:\s*(.+?)\s*$", re.MULTILINE)
_LOOK_ROW_RE = re.compile(r"^\|\s*`([^`]+)`\s*\|", re.MULTILINE)


def _look_fields(text: str) -> dict[str, str]:
    fields: dict[str, str] = {}
    for line in text.splitlines():
        match = _LOOK_FIELD_RE.match(line)
        if match:
            fields[match.group(1).strip().lower()] = match.group(2).replace("`", "").strip()
    return fields


def _parse_look(path: Path) -> dict | None:
    """Parse a look spec header into a preset, or None when incomplete."""
    text = path.read_text()
    fields = _look_fields(text)
    name = _LOOK_NAME_RE.search(text)
    required = ("id", "background", "foreground", "accent", "muted", "font")
    if name is None or any(not fields.get(key) for key in required):
        return None
    look_id = fields["id"]
    display = name.group(1).strip()
    return {
        "id": look_id,
        "name": display,
        "theme": {
            "id": look_id,
            "name": display,
            "background": fields["background"],
            "foreground": fields["foreground"],
            "accent": fields["accent"],
            "muted": fields["muted"],
            "font": fields["font"],
        },
    }


def _look_order() -> dict[str, int]:
    """Catalog order from the look README table."""
    readme = LOOK_DIR / "README.md"
    if not readme.exists():
        return {}
    return {match.group(1): index for index, match in enumerate(_LOOK_ROW_RE.finditer(readme.read_text()))}


def _load_presets() -> list[dict]:
    """Read every look spec in spec/look into a preset list."""
    if not LOOK_DIR.exists():
        return []
    presets = [
        parsed
        for path in sorted(LOOK_DIR.glob("*.md"))
        if path.name.lower() != "readme.md" and (parsed := _parse_look(path)) is not None
    ]
    order = _look_order()
    presets.sort(key=lambda preset: (order.get(preset["id"], 10**9), preset["id"]))
    return presets


def _markdown_files(directory: Path) -> list[str]:
    if not directory.exists():
        return []
    return sorted(path.stem for path in directory.glob("*.md") if path.name.lower() != "readme.md")


def _markdown_path(directory: Path, name: str) -> Path | None:
    if not name or "/" in name or "\\" in name:
        return None
    return next((path for path in directory.glob("*.md") if path.stem.lower() == name.lower()), None)


def create_app(settings: Settings | None = None, *, auth_service: AuthService | None = None) -> FastAPI:
    settings = settings or Settings()
    auth = auth_service or AuthService(settings)
    projects = MemoryProjectStore()

    app = FastAPI(title=settings.app_name)
    app.state.auth = auth
    app.state.projects = projects

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.exception_handler(AuthError)
    async def on_auth_error(_request, exc: AuthError):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.message},
            headers={"WWW-Authenticate": "Bearer"},
        )

    async def _owned(project_id: str, owner_id: str) -> Project:
        project = await projects.get_project(project_id)
        if project is None:
            raise HTTPException(status_code=404, detail="project not found")
        if project.owner_id != owner_id:
            raise HTTPException(status_code=403, detail="not your project")
        return project

    # --- auth surface ---

    auth_router = APIRouter(prefix="/auth", tags=["auth"])

    @auth_router.post("/register", status_code=201)
    async def register(body: RegisterRequest):
        return await auth.register(body.email, body.password, body.name)

    @auth_router.post("/login")
    async def login(body: LoginRequest):
        return await auth.login(body.email, body.password)

    @auth_router.post("/refresh")
    async def refresh(body: RefreshRequest):
        return await auth.refresh(body.refresh_token)

    @auth_router.post("/logout", status_code=204)
    async def logout(body: RefreshRequest, user: User = Depends(get_current_user)):
        await auth.logout(body.refresh_token)

    @auth_router.get("/me")
    async def me(user: User = Depends(get_current_user)):
        return user.to_dict()

    @auth_router.get("/oauth/{provider}/authorize")
    async def oauth_authorize(provider: str):
        url = await auth.oauth_authorize(provider)
        return RedirectResponse(url, status_code=307)

    @auth_router.get("/oauth/{provider}/callback")
    async def oauth_callback(provider: str, code: str, state: str | None = None):
        return await auth.oauth_callback(provider, code, state)

    @auth_router.post("/forgot-password", status_code=204)
    async def forgot_password(body: ForgotPasswordRequest):
        await auth.request_password_reset(body.email)

    @auth_router.post("/reset-password", status_code=204)
    async def reset_password(body: ResetPasswordRequest):
        await auth.reset_password(body.token, body.new_password)

    @auth_router.post("/request-verification", status_code=204)
    async def request_verification(body: RequestVerificationRequest):
        await auth.request_verification(body.email)

    @auth_router.post("/verify", status_code=204)
    async def verify_email(body: VerifyRequest):
        await auth.verify_email(body.token)

    app.include_router(auth_router)

    # --- shared assets (public) ---

    @app.get("/presets")
    async def presets():
        return {"presets": _load_presets()}

    @app.get("/skills/{name}")
    async def skill(name: str):
        path = _markdown_path(SKILLS_DIR, name)
        if path is None:
            raise HTTPException(status_code=404, detail="skill not found")
        return path.read_text()

    @app.get("/spec")
    async def specs():
        return {
            "specDir": str(SPEC_DIR),
            "workflows": _markdown_files(WORKFLOW_DIR),
            "looks": _markdown_files(LOOK_DIR),
        }

    @app.get("/spec/{kind}/{name}")
    async def spec(kind: str, name: str):
        directory = {"workflow": WORKFLOW_DIR, "look": LOOK_DIR}.get(kind)
        path = _markdown_path(directory, name) if directory else None
        if path is None:
            raise HTTPException(status_code=404, detail="spec not found")
        return path.read_text()

    # --- protected deck features ---

    @app.post("/projects", status_code=201)
    async def create_project(user: User = Depends(get_current_user)):
        project = await projects.create_project(user.id)
        return {"projectId": project.id}

    @app.get("/projects/{project_id}/deck")
    async def get_deck(project_id: str, user: User = Depends(get_current_user)):
        project = await _owned(project_id, user.id)
        return project.deck

    @app.put("/projects/{project_id}/deck")
    async def put_deck(project_id: str, presentation: dict, user: User = Depends(get_current_user)):
        project = await _owned(project_id, user.id)
        updated = await projects.put_deck(project.id, presentation)
        return updated.deck

    @app.post("/projects/{project_id}/comments", status_code=201)
    async def add_comment(project_id: str, body: CommentRequest, user: User = Depends(get_current_user)):
        project = await _owned(project_id, user.id)
        record = await projects.add_comment(project.id, body.comment, body.screenshot)
        return {"projectId": project.id, **record}

    def _unimplemented(action: str):
        async def handler(project_id: str, user: User = Depends(get_current_user)):
            await _owned(project_id, user.id)
            raise HTTPException(
                status_code=501,
                detail=f"/projects/{project_id}/{action} not implemented yet",
            )

        return handler

    app.add_api_route("/projects/{project_id}/compile", _unimplemented("compile"), methods=["POST"], status_code=501)
    app.add_api_route("/projects/{project_id}/export", _unimplemented("export"), methods=["POST"], status_code=501)
    app.add_api_route("/projects/{project_id}/run", _unimplemented("run"), methods=["POST"], status_code=501)

    return app


app = create_app()
