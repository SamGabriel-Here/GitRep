"""The API.

Every route sits under /api so the whole thing can be served from one origin
as a Vercel function, next to the built front end. Same-origin means there is
no CORS to configure and no second URL to keep in sync.

Paths carry no trailing slash: FastAPI would answer a mismatch with a 307, and
a redirect behind a serverless proxy is a round trip nobody needs.
"""

from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException

from app.github.client import GitHubError, fetch, fetch_profile
from app.github.repo_url import parse_target
from app.rubric import engine
from app.schemas import AnalyseRequest

app = FastAPI(
    title="GitRep",
    description="Grades a public GitHub repository against a 100-point rubric.",
    version="2.2.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
    redoc_url="/api/redoc",
    redirect_slashes=False,
)


@app.get("/api/health")
async def health():
    return {"status": "ok", "version": app.version}


@app.get("/api/rubric")
async def get_rubric():
    """What we grade and what each check is worth, before any repo is named."""
    checks = engine.rubric()
    return {"total": sum(c["possible"] for c in checks), "checks": checks}


@app.post("/api/analyze")
async def analyze(request: AnalyseRequest):
    """Grade one repository, or a whole profile.

    The same input box takes both, so the server decides which was pasted and
    says so in `kind`. A client switches on that rather than parsing URLs of
    its own.
    """
    try:
        target = parse_target(request.github_url)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    try:
        if target.kind == "profile":
            return await _profile_report(target.owner)
        return await _repo_report(target.owner, target.repo)
    except GitHubError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail)


async def _repo_report(owner: str, repo: str) -> dict:
    fetched = await fetch(owner, repo)
    return {
        "kind": "repo",
        **engine.analyse(fetched.readme, fetched.repo),
        "repo": fetched.repo,
        "analysed_at": _now(),
        "rate_remaining": fetched.rate_remaining,
    }


async def _profile_report(login: str) -> dict:
    profile = await fetch_profile(login)
    graded = [(f.repo, engine.analyse(f.readme, f.repo)) for f in profile.repos]
    return {
        **engine.analyse_profile(
            profile.owner,
            graded,
            total_public=profile.total_public,
            skipped_forks=profile.skipped_forks,
            eligible=profile.eligible,
            degraded=profile.degraded,
        ),
        "analysed_at": _now(),
        "rate_remaining": profile.rate_remaining,
    }


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()
