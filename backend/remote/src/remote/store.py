import asyncio
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Protocol
from uuid import uuid4


def _now() -> datetime:
    return datetime.now(timezone.utc)


@dataclass
class Project:
    id: str
    owner_id: str
    deck: dict = field(default_factory=lambda: {"slides": []})
    comments: list[dict] = field(default_factory=list)
    created_at: datetime = field(default_factory=_now)
    updated_at: datetime = field(default_factory=_now)


class ProjectStore(Protocol):
    async def create_project(self, owner_id: str) -> Project: ...

    async def get_project(self, project_id: str) -> Project | None: ...

    async def put_deck(self, project_id: str, deck: dict) -> Project: ...

    async def add_comment(self, project_id: str, comment: str, screenshot: str | None) -> dict: ...


class MemoryProjectStore:
    def __init__(self) -> None:
        self.projects: dict[str, Project] = {}
        self._lock = asyncio.Lock()

    async def create_project(self, owner_id: str) -> Project:
        async with self._lock:
            project = Project(id=str(uuid4()), owner_id=owner_id)
            self.projects[project.id] = project
            return project

    async def get_project(self, project_id: str) -> Project | None:
        return self.projects.get(project_id)

    async def put_deck(self, project_id: str, deck: dict) -> Project:
        project = self.projects[project_id]
        project.deck = deck
        project.updated_at = _now()
        return project

    async def add_comment(self, project_id: str, comment: str, screenshot: str | None) -> dict:
        project = self.projects[project_id]
        record: dict[str, Any] = {
            "id": str(uuid4()),
            "comment": comment,
            "screenshot": screenshot,
            "createdAt": _now().isoformat(),
        }
        project.comments.append(record)
        return record
