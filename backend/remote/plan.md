# Deckworks Remote Backend — Development Plan

Remote execution path: **FastAPI service (Python) + Vercel Sandbox** for isolated code execution, with **Postgres + object store + sandbox snapshots** for persistence. Exposes the same deck operations as the local MCP backend, over HTTP, plus a sandboxed code runner for analysis and slide construction.

> Status: **planned** — `pyproject.toml` + a broken `isolation.py` stub already exist under `backend/remote`.

## Shared assets

Looks and skills live in `../shared/`. The remote backend should parse theme presets from the look spec headers in `backend/shared/spec/look/*.md` and serve/expose agent skills from `backend/shared/skills/*.md`, rather than duplicating them.

## Goals

1. Full deck operations over HTTP: projects, deck state, comments, compile, export.
2. A **sandboxed code runner**: submit code + input files → run in a Vercel Sandbox → return stdout/stderr + produced files.
3. Persist deck state in **Postgres (JSONB)**, binary attachments in an **object store**, and project working files in **sandbox snapshots**.
4. HTML export rendered in Python; **PDF via pandoc** (`--pdf-engine=weasyprint`); PPTX **501** this phase (use local TS `exportPptx`).

## Target layout

```
backend/remote/
  pyproject.toml              # fastapi, vercel-sandbox, asyncpg, boto3, weasyprint
  .python-version             # 3.13
  src/remote/
    config.py                 # env: DATABASE_URL, S3_ENDPOINT/BUCKET/keys, Vercel creds, AUTH_* secrets
    schema.py                 # Pydantic mirrors of deck.json (Presentation/Slide/Element/Theme/Comment/Preset) + auth request models
    store.py                  # Postgres (deck.json) + S3-compatible object store (assets) + snapshot helpers + project store
    auth.py                   # JWT access/refresh tokens, Argon2 hashing, OAuth (github/google), user/refresh/oauth-state stores
    isolation.py              # FIX stub → sandbox code runner (run_code)
    export.py                 # render_deck_html(presentation) + export_pdf (pandoc)
    main.py                   # FastAPI app (auth + deck routes)
```

## Persistence model (decided)

| Data | Store |
| --- | --- |
| `deck.json` + metadata | **Postgres** — `projects(id uuid pk, deck jsonb, updated_at)` |
| Comment screenshots / slide screenshots / materials | **S3-compatible object store** (LocalStack/MinIO in dev, Vercel Blob in prod) |
| Project working files during a run | **Vercel Sandbox snapshots** |

## Vercel Sandbox code runner (`isolation.py`)

Replace the broken stub with:

```
run_code(code, files: dict[str, bytes]) -> { stdout, stderr, files: dict[str, bytes] }
```

Mechanics (verified against `vercel-sandbox 0.4.0` SDK):
- `async with create_sandbox(resources=SandboxResources(vcpus=…, memory=…), execution_time_limit=…) as box:` — context-managed, **destroyed on exit**.
- Upload inputs: `box.fs.write_bytes(path, data)` / `write_text(path, text)` (lazily acquires a session).
- Run: `box.run_process("python", ["main.py"], capture_output=True, cwd=…)`.
- Download outputs: `box.fs.read_bytes(path)`.
- Return stdout/stderr + produced files to the caller.

## Export (`export.py`)

- **html**: render slide DOM to a self-contained HTML string in Python (mirror of TS `elementHtml`: title/subtitle/body/chart → absolute-positioned divs).
- **pdf**: write the HTML + `slide.css`, then `pandoc -t html --pdf-engine=weasyprint --css=slide.css deck.html -o deck.pdf` — runs **on the FastAPI host** (pandoc is a system binary; weasyprint is pip).
- **pptx**: `HTTP 501` with a pointer to the local TS `exportPptx`.

## API surface (`main.py`)

| Method | Route | Body | Returns |
| --- | --- | --- | --- |
| `POST` | `/projects` | — | `{ projectId }` (creates empty deck) |
| `GET` | `/projects/{id}/deck` | — | `Presentation` |
| `PUT` | `/projects/{id}/deck` | `Presentation` | persisted deck |
| `POST` | `/projects/{id}/comments` | `{ comment, screenshot? }` | stored comment |
| `POST` | `/projects/{id}/compile` | `{ slides: [{ slide, screenshot }] }` | resolves open comments |
| `POST` | `/projects/{id}/export` | `{ format, presentation }` | file bytes (html/pdf, 501 pptx) |
| `POST` | `/projects/{id}/run` | `{ code, files? }` | `{ stdout, stderr, files }` |

All deck routes above require a bearer access token, and every project is scoped to its owner
(accessing another user's project → 403).

## Auth (`auth.py` — implemented)

Email/password + OAuth (GitHub, Google), JWT bearer tokens with rotating refresh.

| Method | Route | Body | Returns |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | `{ email, password, name }` | `{ access_token, refresh_token, expires_in, user }` |
| `POST` | `/auth/login` | `{ email, password }` | token pair |
| `POST` | `/auth/refresh` | `{ refresh_token }` | rotated token pair (old refresh revoked) |
| `POST` | `/auth/logout` | `{ refresh_token }` (auth) | revokes the refresh token |
| `GET` | `/auth/me` | — (auth) | current user |
| `GET` | `/auth/oauth/{provider}/authorize` | — | 307 → provider (state stored) |
| `GET` | `/auth/oauth/{provider}/callback` | `?code&state` | token pair |
| `POST` | `/auth/forgot-password` / `reset-password` | `{ email }` / `{ token, new_password }` | email link is a dev-stub (token logged) |
| `POST` | `/auth/request-verification` / `verify` | `{ email }` / `{ token }` | email verify, same dev-stub pattern |

Design:
- **Tokens**: HS256 JWTs — `access` (15 min) + `refresh` (30 d). Refresh tokens are rotation-rotated and tracked in a `RefreshTokenStore` (revocation on refresh/logout). `TokenService` issues `reset`/`verify` JWTs for password/email flows.
- **Passwords**: Argon2 via `pwdlib[argon2]`.
- **Stores**: `UserStore`, `RefreshTokenStore`, `OAuthStateStore` are protocols. **In-memory impls now** (app runs without a DB); a `PostgresUserStore` slots in behind the same interface when `store.py`'s asyncpg pool lands.
- **OAuth**: state param (stored + consumed, 10 min TTL) protects the callback; provider HTTP calls are `_provider_authorize_url` / `_exchange_code` / `_fetch_userinfo` so tests can stub them. Providers 503 if unconfigured.
- **Shared assets** (`/presets`, `/skills/{name}`) stay public reads; everything else requires a token.

## Steps

1. **Fix `isolation.py`** — implement `run_code` (may need to keep it behind a try/import so the app runs without Vercel credentials).
2. **`schema.py`** — Pydantic models validating against the deck.json reference.
3. **`store.py`** — asyncpg pool + S3 client; `get_deck/put_deck`, asset put/get, snapshot helpers.
4. **`export.py`** — Python HTML renderer + pandoc PDF.
5. **`main.py`** — FastAPI app wiring store + isolation + export.
6. **`pyproject.toml`** — add `asyncpg`, `boto3` (or `aioboto3`), `weasyprint`, `pydantic-settings`. Auth deps already added: `pwdlib[argon2]`, `pyjwt`, `httpx`, `email-validator`.
7. **Deploy/dev infra** — compose for Postgres + LocalStack; `.env.example`.

## Verification

- `uv run` FastAPI; `GET /` and `GET /projects/{id}/deck` respond.
- LocalStack + Postgres up → full `/projects` → `/comments` → `/compile` → `/export` (html + pdf) flow on a sample deck.
- `POST /run` with a trivial script returns stdout + files (needs Vercel credentials — flag when absent).
- `pandoc --version` available on the host (system binary).

## Open items / risks

- **pandoc is a system binary** — remote image/Dockerfile must `apt install pandoc`; weasyprint via pip.
- **Vercel creds required** for sandbox creation — local dev should degrade gracefully (clear 501/503 + message).
- PPTX export deferred to local TS path this phase.
- PDF styling parity with TS `exportPdf.tsx` is approximate (CSS-driven, not pixel-identical).

## Out of scope (this plan)

- Local backend (see `backend/local/plan.md`).
- PPTX in Python.
- Frontend changes (web app continues to talk to the local bridge; remote HTTP is a separate integration).
