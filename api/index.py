"""Vercel entrypoint.

Vercel runs any module in `api/` as a serverless function and speaks ASGI to a
module-level `app`. The FastAPI application lives in `backend/app`, which is
not on the path by default, so put it there first. `vercel.json` ships the
`backend` tree alongside this file.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from app.main import app  # noqa: E402

__all__ = ["app"]
