import base64
import os
import re
from datetime import datetime, timezone

import requests

GITHUB_API = "https://api.github.com"

# Matches github.com/owner/repo with optional protocol, www, .git suffix, or trailing path
_REPO_URL_RE = re.compile(
    r"^(?:https?://)?(?:www\.)?github\.com/"
    r"(?P<owner>[A-Za-z0-9_.-]+)/(?P<repo>[A-Za-z0-9_.-]+?)"
    r"(?:\.git)?(?:[/?#].*)?$"
)


class GitHubError(Exception):
    """Raised when the GitHub API request fails."""

    def __init__(self, status_code: int, detail: str):
        self.status_code = status_code
        self.detail = detail
        super().__init__(detail)


def parse_repo_url(github_url: str) -> tuple[str, str]:
    """Extract (owner, repo) from a GitHub URL, or raise ValueError."""
    match = _REPO_URL_RE.match(github_url.strip())
    if not match:
        raise ValueError(
            "That doesn't look like a GitHub repository URL. "
            "Expected something like https://github.com/owner/repo"
        )
    return match.group("owner"), match.group("repo")


def _headers() -> dict:
    headers = {"Accept": "application/vnd.github+json"}
    token = os.getenv("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return headers


def _get(url: str) -> requests.Response:
    try:
        return requests.get(url, headers=_headers(), timeout=10)
    except requests.RequestException:
        raise GitHubError(502, "Could not reach the GitHub API. Try again in a moment.")


def _fetch_readme(owner: str, repo: str) -> str:
    """Fetch the README via the API so it works regardless of default branch."""
    response = _get(f"{GITHUB_API}/repos/{owner}/{repo}/readme")
    if response.status_code != 200:
        return ""
    content = response.json().get("content", "")
    try:
        return base64.b64decode(content).decode("utf-8", errors="replace")
    except (ValueError, TypeError):
        return ""


def _analyze_readme(readme: str, repo_data: dict) -> tuple[list[str], int]:
    """Return (suggestions, score out of 100) for the repo's README and metadata."""
    suggestions = []
    score = 100
    lower = readme.lower()

    if not readme:
        return (
            [
                "This repository has no README. Add one — it's the first thing "
                "visitors (and recruiters) look at."
            ],
            10,
        )

    if len(readme) < 300:
        suggestions.append(
            "Your README is quite short. Explain what the project does, why it "
            "exists, and how to use it."
        )
        score -= 25

    if not repo_data.get("description"):
        suggestions.append(
            "Add a repository description — it shows up in search results and "
            "on your profile."
        )
        score -= 10

    if "install" not in lower and "setup" not in lower and "getting started" not in lower:
        suggestions.append("Include installation or setup instructions.")
        score -= 15

    if "usage" not in lower and "example" not in lower and "how to" not in lower:
        suggestions.append("Add a usage section with examples.")
        score -= 10

    if "![" not in readme and "<img" not in lower:
        suggestions.append("Add a screenshot, demo GIF, or badges to make the README more engaging.")
        score -= 10

    if not repo_data.get("license"):
        suggestions.append(
            "Add a license so others know how they can use your code."
        )
        score -= 10

    if not repo_data.get("topics"):
        suggestions.append("Add topics (tags) to the repo to make it discoverable.")
        score -= 5

    pushed_at = repo_data.get("pushed_at")
    if pushed_at:
        pushed = datetime.fromisoformat(pushed_at.replace("Z", "+00:00"))
        days_idle = (datetime.now(timezone.utc) - pushed).days
        if days_idle > 365:
            suggestions.append(
                f"Last push was over {days_idle // 365} year(s) ago. An update "
                "signals the project is still maintained."
            )
            score -= 10

    return suggestions, max(score, 0)


def fetch_github_data(github_url: str) -> dict:
    owner, repo = parse_repo_url(github_url)

    response = _get(f"{GITHUB_API}/repos/{owner}/{repo}")
    if response.status_code == 404:
        raise GitHubError(404, f"Repository {owner}/{repo} not found. Is it public?")
    if response.status_code in (403, 429):
        raise GitHubError(
            429,
            "GitHub API rate limit reached. Wait a few minutes, or set a "
            "GITHUB_TOKEN on the server for a higher limit.",
        )
    if response.status_code != 200:
        raise GitHubError(502, f"GitHub API returned an error (HTTP {response.status_code}).")

    repo_data = response.json()
    readme = _fetch_readme(owner, repo)
    suggestions, score = _analyze_readme(readme, repo_data)

    return {
        "name": repo_data["full_name"],
        "url": repo_data["html_url"],
        "description": repo_data.get("description"),
        "stars": repo_data["stargazers_count"],
        "forks": repo_data["forks_count"],
        "language": repo_data.get("language"),
        "open_issues": repo_data["open_issues_count"],
        "license": (repo_data.get("license") or {}).get("spdx_id"),
        "last_push": repo_data.get("pushed_at"),
        "readme_length": len(readme),
        "score": score,
        "suggestions": suggestions,
    }
