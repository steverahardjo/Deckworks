# CLI (planned)

The CLI is a planned human-facing interface to the same core services used by
the MCP, so MCP, CLI, and frontend operate on one presentation state without
duplicating business logic.

## Create a presentation

```bash
deckworks new
```

The TUI lets the user choose a look:

```text
┌──────────────────────────────────────────┐
│          Choose Presentation             │
├──────────────────────────────────────────┤
│  > Consulting                            │
│    Minimal                               │
│    Corporate                             │
│    Editorial                             │
│    Academic                              │
│    Startup                               │
│    Dark                                  │
│                                          │
│  Preview:                                │
│  ┌────────────────────────────────────┐  │
│  │      Revenue Growth                │  │
│  │          █████████                 │  │
│  └────────────────────────────────────┘  │
│          Enter Select   Esc Cancel       │
└──────────────────────────────────────────┘
```

Looks are reusable definitions discovered at runtime from `spec/look/`:

```text
spec/look/
├── consulting.md
├── minimal.md
├── editorial.md
├── academic.md
├── startup.md
└── dark.md
```

A look defines theme and layout conventions, not an entire presentation.

## Commands

**Initialize**

```bash
deckworks init
```

**Create**

```bash
deckworks new
```

**Inspect**

```bash
deckworks status
deckworks open
```

**Load skills**

```bash
deckworks skill list
deckworks skill load create
deckworks skill load edit
```

**Change content**

```bash
deckworks change --slide 4 --target title --text "Revenue is accelerating"
deckworks change --slide 4 --target revenue-chart --width 600
```

The same underlying change service must be available to MCP.

**Save**

```bash
deckworks save
```

`save` means saving the canonical slide state; it does not automatically mean
exporting every format.

**Preview**

```bash
deckworks preview
```

Starts or connects to the local preview server and opens it in a browser:

```text
Deckworks preview
Local: http://localhost:4173
Slides: 12
Template: Consulting
```

**Review**

```bash
deckworks review
```

**Export**

```bash
deckworks export html
deckworks export pdf
deckworks export pptx
```

Modern PowerPoint output uses `.pptx`, not the legacy `.ppt` format.
