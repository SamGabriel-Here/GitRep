"""Turning whatever the user pasted into (owner, repo)."""

from __future__ import annotations

import re

# Accepts a browser URL, an SSH remote, or just "owner/repo".
_REPO_RE = re.compile(
    r"^(?:(?:https?://)?(?:[A-Za-z0-9._~%-]+@)?(?:www\.)?github\.com[/:])?"
    r"(?P<owner>[A-Za-z0-9](?:[A-Za-z0-9-]{0,38}))/"
    r"(?P<repo>[A-Za-z0-9_.-]{1,100}?)"
    r"(?:\.git)?(?:[/?#].*)?$"
)


def parse_repo_url(value: str) -> tuple[str, str]:
    match = _REPO_RE.match((value or "").strip())
    if not match:
        raise ValueError(
            "That is not a GitHub repository. Paste a link like "
            "https://github.com/owner/repo, or just owner/repo."
        )
    return match.group("owner"), match.group("repo")
