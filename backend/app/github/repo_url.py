"""Turning whatever the user pasted into something we can fetch.

One input box takes both a repository and a profile, so the parsing decides
which of the two it is rather than making the caller pick first.
"""

from __future__ import annotations

import re
from dataclasses import dataclass

# A browser URL, an SSH remote, or just "owner/repo".
_REPO_RE = re.compile(
    r"^(?:(?:https?://)?(?:[A-Za-z0-9._~%-]+@)?(?:www\.)?github\.com[/:])?"
    r"(?P<owner>[A-Za-z0-9](?:[A-Za-z0-9-]{0,38}))/"
    r"(?P<repo>[A-Za-z0-9_.-]{1,100}?)"
    r"(?:\.git)?(?:[/?#].*)?$"
)

# The same, one segment short: a profile.
_PROFILE_RE = re.compile(
    r"^(?:(?:https?://)?(?:www\.)?github\.com/)?"
    r"(?P<login>[A-Za-z0-9](?:[A-Za-z0-9-]{0,38}))"
    r"/?(?:[?#].*)?$"
)

_BAD_INPUT = (
    "That is not a GitHub repository or profile. Paste a link like "
    "https://github.com/owner/repo, or just owner/repo, or a username on its own."
)


@dataclass(frozen=True)
class Target:
    kind: str  # "repo" or "profile"
    owner: str
    repo: str | None = None

    @property
    def label(self) -> str:
        return f"{self.owner}/{self.repo}" if self.repo else self.owner


def parse_target(value: str) -> Target:
    text = (value or "").strip()

    # Two segments wins: "owner/repo" is never a profile.
    match = _REPO_RE.match(text)
    if match:
        return Target("repo", match.group("owner"), match.group("repo"))

    match = _PROFILE_RE.match(text)
    if match:
        return Target("profile", match.group("login"))

    raise ValueError(_BAD_INPUT)


def parse_repo_url(value: str) -> tuple[str, str]:
    """Kept for callers that only ever want a repository."""
    target = parse_target(value)
    if target.kind != "repo":
        raise ValueError(_BAD_INPUT)
    return target.owner, target.repo
