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

from app.config import (
    CACHE_TTL,
    CONNECT_TIMEOUT,
    GITHUB_API,
    PROFILE_CONCURRENCY,
    PROFILE_REPO_LIMIT,
    REQUEST_TIMEOUT,
    github_token,
)

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


@dataclass
class FetchedProfile:
    owner: dict
    repos: list[Fetched]
    total_public: int
    skipped_forks: int
    eligible: int
    rate_remaining: int | None
    # Repositories whose side files could not be read (a timeout, a 5xx). Their
    # scores are understated, so the report says so rather than pretending.
    degraded: int = 0


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


def _is_rate_limited(response: object) -> bool:
    return (
        isinstance(response, httpx.Response)
        and response.status_code in (403, 429)
        and response.headers.get("X-RateLimit-Remaining") == "0"
    )


def _rate_limit_error(response: httpx.Response) -> GitHubError:
    reset = response.headers.get("X-RateLimit-Reset")
    when = ""
    if reset and reset.isdigit():
        minutes = max(int((int(reset) - time.time()) / 60), 1)
        when = f" Try again in about {minutes} minute{'s' if minutes != 1 else ''}."
    return GitHubError(429, f"GitHub's rate limit is used up.{when}")


def _raise_for(response: httpx.Response, owner: str, repo: str) -> None:
    if response.status_code == 404:
        raise GitHubError(404, f"{owner}/{repo} does not exist, or it is private.")
    if response.status_code == 401:
        raise GitHubError(500, "The server's GitHub token is invalid. Ask the maintainer to rotate it.")
    if response.status_code in (403, 429):
        if _is_rate_limited(response):
            raise _rate_limit_error(response)
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


def _repo_info(data: dict, root: set[str], workflows: bool) -> dict:
    """The shape the rubric expects, from one GitHub repo payload."""
    licence = data.get("license") or {}
    return {
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


async def _fetch_side_files(client: httpx.AsyncClient, owner: str, repo: str):
    """README, root tree and workflows, best-effort and concurrent.

    The repo already exists by the time this runs, so a missing README or an
    unreadable tree should degrade the report rather than fail the request.
    """
    readme_res, root_res, workflow_res = await asyncio.gather(
        _get(client, f"/repos/{owner}/{repo}/readme"),
        _get(client, f"/repos/{owner}/{repo}/contents"),
        _get(client, f"/repos/{owner}/{repo}/contents/.github/workflows"),
        return_exceptions=True,
    )

    # Running out of requests mid-fetch must not read as "no README". Left
    # unchecked it scores a perfectly documented repo as undocumented, which is
    # worse than failing: the report is wrong rather than absent.
    for response in (readme_res, root_res, workflow_res):
        if _is_rate_limited(response):
            raise _rate_limit_error(response)

    readme = None
    if isinstance(readme_res, httpx.Response) and readme_res.status_code == 200:
        readme = _decode_readme(readme_res.json())

    ok = isinstance(root_res, httpx.Response) and root_res.status_code == 200
    root = _names(root_res.json()) if ok else set()
    workflows = isinstance(workflow_res, httpx.Response) and workflow_res.status_code == 200
    return readme, root, workflows


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

        readme, root, workflows = await _fetch_side_files(client, owner, repo)

    repo_info = _repo_info(data, root, workflows)

    rate = main.headers.get("X-RateLimit-Remaining")
    rate = int(rate) if rate and rate.isdigit() else None

    _cache[key] = (time.time(), {"repo": repo_info, "readme": readme, "rate": rate})
    return Fetched(repo_info, readme, rate)


def _owner_info(data: dict) -> dict:
    return {
        "login": data["login"],
        "name": data.get("name"),
        "avatar": data.get("avatar_url"),
        "url": data.get("html_url"),
        "bio": data.get("bio"),
        "public_repos": data.get("public_repos", 0),
        "followers": data.get("followers", 0),
        "created_at": data.get("created_at"),
    }


async def fetch_profile(login: str, limit: int = PROFILE_REPO_LIMIT) -> FetchedProfile:
    """Grade a whole profile: the user, then their most recently pushed repos.

    Forks are left out. A fork's README is somebody else's work, and counting
    it would say nothing about how the person writes.
    """
    async with httpx.AsyncClient(headers=_headers(), timeout=TIMEOUT, follow_redirects=True) as client:
        user_res = await _get(client, f"/users/{login}")
        if user_res.status_code == 404:
            raise GitHubError(404, f"There is no GitHub user called {login}.")
        _raise_for(user_res, login, "")
        user = user_res.json()

        if user.get("type") not in (None, "User", "Organization"):
            raise GitHubError(400, f"{login} is not a user or organisation.")

        listing = await _get(client, f"/users/{login}/repos?per_page=100&sort=pushed&type=owner")
        _raise_for(listing, login, "")
        all_repos = listing.json()
        if not isinstance(all_repos, list):
            raise GitHubError(502, "GitHub returned an unexpected repository list.")

        owned = [r for r in all_repos if not r.get("fork")]
        skipped_forks = len(all_repos) - len(owned)
        chosen = owned[:limit]

        # Bounded so a profile with twenty repositories does not open sixty
        # sockets at once and time the function out.
        gate = asyncio.Semaphore(PROFILE_CONCURRENCY)

        degraded: list[str] = []

        async def one(data: dict) -> Fetched:
            owner_login = data["owner"]["login"]
            name = data["name"]
            try:
                async with gate:
                    readme, root, workflows = await _fetch_side_files(client, owner_login, name)
            except GitHubError as exc:
                if exc.status_code == 429:
                    raise
                # One unreadable repo should not lose the other nineteen, but
                # its score is now a guess, so it gets counted and reported.
                degraded.append(data["full_name"])
                readme, root, workflows = None, set(), False
            return Fetched(_repo_info(data, root, workflows), readme, None)

        results = await asyncio.gather(*(one(r) for r in chosen), return_exceptions=True)

        # A half-fetched profile is a wrong profile. Surface it instead.
        for result in results:
            if isinstance(result, GitHubError) and result.status_code == 429:
                raise result

    repos = [r for r in results if isinstance(r, Fetched)]
    rate = listing.headers.get("X-RateLimit-Remaining")
    rate = int(rate) if rate and rate.isdigit() else None

    return FetchedProfile(
        owner=_owner_info(user),
        repos=repos,
        total_public=user.get("public_repos", len(all_repos)),
        skipped_forks=skipped_forks,
        eligible=len(owned),
        rate_remaining=rate,
        degraded=len(degraded),
    )
