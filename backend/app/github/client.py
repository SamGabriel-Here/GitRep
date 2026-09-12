"""Async GitHub client.

The previous version called `requests` from inside an `async def` handler,
which parks the whole event loop for the length of every network round trip.
Under one user that is invisible; under ten it queues them all. Everything here
is httpx, and the four calls we need run concurrently.
"""

from __future__ import annotations

import asyncio
import base64
import time
from dataclasses import dataclass

import httpx

from app.config import CACHE_TTL, CONNECT_TIMEOUT, GITHUB_API, REQUEST_TIMEOUT, github_token

TIMEOUT = httpx.Timeout(REQUEST_TIMEOUT, connect=CONNECT_TIMEOUT)

# owner/repo -> (fetched_at, payload). Small enough that eviction is not worth it.
_cache: dict[str, tuple[float, dict]] = {}


class GitHubError(Exception):
    """A GitHub failure already phrased for the person who pasted the URL."""

    def __init__(self, status_code: int, detail: str):
        self.status_code = status_code
        self.detail = detail
        super().__init__(detail)


@dataclass
class Fetched:
    repo: dict
    readme: str | None
    rate_remaining: int | None


def _headers() -> dict[str, str]:
    headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "GitRep",
    }
    token = github_token()
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return headers


def _raise_for(response: httpx.Response, owner: str, repo: str) -> None:
    if response.status_code == 404:
        raise GitHubError(404, f"{owner}/{repo} does not exist, or it is private.")
    if response.status_code == 401:
        raise GitHubError(500, "The server's GitHub token is invalid. Ask the maintainer to rotate it.")
    if response.status_code in (403, 429):
        if response.headers.get("X-RateLimit-Remaining") == "0":
            reset = response.headers.get("X-RateLimit-Reset")
            when = ""
            if reset and reset.isdigit():
                minutes = max(int((int(reset) - time.time()) / 60), 1)
                when = f" Try again in about {minutes} minute{'s' if minutes != 1 else ''}."
            raise GitHubError(429, f"GitHub's rate limit is used up.{when}")
        raise GitHubError(403, f"GitHub refused access to {owner}/{repo}.")
    if response.status_code == 451:
        raise GitHubError(451, f"{owner}/{repo} is blocked by a legal takedown.")
    if response.status_code >= 400:
        raise GitHubError(502, f"GitHub returned HTTP {response.status_code}.")


async def _get(client: httpx.AsyncClient, path: str) -> httpx.Response:
    try:
        return await client.get(f"{GITHUB_API}{path}")
    except httpx.TimeoutException:
        raise GitHubError(504, "GitHub took too long to answer. Try again in a moment.")
    except httpx.RequestError:
        raise GitHubError(502, "Could not reach GitHub. Check the connection and try again.")


def _decode_readme(payload: dict) -> str | None:
    content = payload.get("content")
    if not content:
        return None
    try:
        return base64.b64decode(content).decode("utf-8", errors="replace")
    except (ValueError, TypeError):
        return None


def _names(payload) -> set[str]:
    if not isinstance(payload, list):
        return set()
    return {str(entry.get("name", "")).lower() for entry in payload if isinstance(entry, dict)}


async def fetch(owner: str, repo: str) -> Fetched:
    key = f"{owner.lower()}/{repo.lower()}"
    cached = _cache.get(key)
    if cached and time.time() - cached[0] < CACHE_TTL:
        payload = cached[1]
        return Fetched(payload["repo"], payload["readme"], payload["rate"])

    async with httpx.AsyncClient(headers=_headers(), timeout=TIMEOUT, follow_redirects=True) as client:
        main = await _get(client, f"/repos/{owner}/{repo}")
        _raise_for(main, owner, repo)
        data = main.json()

        # The repo exists, so the rest is best-effort: a missing README or an
        # unreadable tree should degrade the report, not fail the request.
        readme_res, root_res, workflow_res = await asyncio.gather(
            _get(client, f"/repos/{owner}/{repo}/readme"),
            _get(client, f"/repos/{owner}/{repo}/contents"),
            _get(client, f"/repos/{owner}/{repo}/contents/.github/workflows"),
            return_exceptions=True,
        )

    readme = None
    if isinstance(readme_res, httpx.Response) and readme_res.status_code == 200:
        readme = _decode_readme(readme_res.json())

    root = _names(root_res.json()) if isinstance(root_res, httpx.Response) and root_res.status_code == 200 else set()
    workflows = isinstance(workflow_res, httpx.Response) and workflow_res.status_code == 200

    licence = data.get("license") or {}
    repo_info = {
        "name": data["full_name"],
        "owner": data["owner"]["login"],
        "avatar": data["owner"].get("avatar_url"),
        "url": data["html_url"],
        "description": data.get("description"),
        "homepage": data.get("homepage"),
        "stars": data.get("stargazers_count", 0),
        "forks": data.get("forks_count", 0),
        "watchers": data.get("subscribers_count", 0),
        "language": data.get("language"),
        "open_issues": data.get("open_issues_count", 0),
        "license": licence.get("spdx_id"),
        "license_name": licence.get("name"),
        "topics": data.get("topics") or [],
        "pushed_at": data.get("pushed_at"),
        "created_at": data.get("created_at"),
        "size_kb": data.get("size", 0),
        "is_fork": bool(data.get("fork")),
        "is_archived": bool(data.get("archived")),
        "default_branch": data.get("default_branch"),
        "has_workflows": workflows,
        "has_contributing": any(n.startswith("contributing") for n in root),
        "has_tests": any(n in {"tests", "test", "spec", "__tests__"} for n in root),
        "has_changelog": any(n.startswith("changelog") for n in root),
    }

    rate = main.headers.get("X-RateLimit-Remaining")
    rate = int(rate) if rate and rate.isdigit() else None

    _cache[key] = (time.time(), {"repo": repo_info, "readme": readme, "rate": rate})
    return Fetched(repo_info, readme, rate)
