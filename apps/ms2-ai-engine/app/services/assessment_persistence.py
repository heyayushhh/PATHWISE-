"""Simple persistence helpers for adaptive assessment state."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any


_STORAGE_DIR = Path(__file__).resolve().parent.parent / "data" / "assessments"
_STORAGE_DIR.mkdir(parents=True, exist_ok=True)


def save_state(session_id: str, state: dict[str, Any]) -> None:
    """Persist the adaptive assessment state to disk for later resume."""

    path = _storage_path(session_id)
    path.write_text(json.dumps(state, indent=2), encoding="utf-8")


def load_state(session_id: str) -> dict[str, Any] | None:
    """Load a persisted assessment state by session id."""

    path = _storage_path(session_id)
    if not path.exists():
        return None

    return json.loads(path.read_text(encoding="utf-8"))


def delete_state(session_id: str) -> None:
    """Remove persisted state for a session."""

    path = _storage_path(session_id)
    if path.exists():
        path.unlink(missing_ok=True)


def _storage_path(session_id: str) -> Path:
    return _STORAGE_DIR / f"{session_id}.json"
