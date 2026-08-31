import json
import logging
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
PRESETS_PATH = SHARED_DIR / "templates" / "presets.json"
SKILLS_DIR = SHARED_DIR / "skills"


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
        if not PRESETS_PATH.exists():
            raise HTTPException(status_code=404, detail="presets not found")
        return json.loads(PRESETS_PATH.read_text())

    @app.get("/skills/{name}")
    async def skill(name: str):
        path = SKILLS_DIR / f"{name}.md"
        if not path.exists():
            raise HTTPException(status_code=404, detail="skill not found")
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
