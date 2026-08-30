# Deckworks Remote Backend — Development Plan

Remote execution path: **FastAPI service (Python) + Vercel Sandbox** for isolated code execution, with **Postgres + object store + sandbox snapshots** for persistence. Exposes the same deck operations as the local MCP backend, over HTTP, plus a sandboxed code runner for analysis and slide construction.

> Status: **planned** — `pyproject.toml` + a broken `isolation.py` stub already exist under `backend/remote`.

## Shared assets

Templates and skills live in `../shared/` (see `backend/shared/plan.md`). The remote backend should read theme presets from `backend/shared/templates/presets.json` and serve/expose agent skills from `backend/shared/skills/*.md`, rather than duplicating them.

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
    config.py                 # env: DATABASE_URL, S3_ENDPOINT/BUCKET/keys, Vercel creds
    schema.py                 # Pydantic mirrors of deck.json (Presentation/Slide/Element/Theme/Comment/Preset)
    store.py                  # Postgres (deck.json) + S3-compatible object store (assets) + snapshot helpers
    isolation.py              # FIX stub → sandbox code runner (run_code)
    export.py                 # render_deck_html(presentation) + export_pdf (pandoc)
    main.py                   # FastAPI app (routes)
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

## Steps

1. **Fix `isolation.py`** — implement `run_code` (may need to keep it behind a try/import so the app runs without Vercel credentials).
2. **`schema.py`** — Pydantic models validating against the deck.json reference.
3. **`store.py`** — asyncpg pool + S3 client; `get_deck/put_deck`, asset put/get, snapshot helpers.
4. **`export.py`** — Python HTML renderer + pandoc PDF.
5. **`main.py`** — FastAPI app wiring store + isolation + export.
6. **`pyproject.toml`** — add `asyncpg`, `boto3` (or `aioboto3`), `weasyprint`, `pydantic-settings`.
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
