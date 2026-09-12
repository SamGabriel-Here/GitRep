"""Request and response models for the public API."""

from __future__ import annotations

from pydantic import BaseModel, Field


class AnalyseRequest(BaseModel):
    github_url: str = Field(
        min_length=1,
        max_length=500,
        description="A GitHub URL, an SSH remote, or just owner/repo.",
        examples=["https://github.com/tiangolo/fastapi", "tiangolo/fastapi"],
    )
