"""The API.

Every route sits under /api so the whole thing can be served from one origin
as a Vercel function, next to the built front end. Same-origin means there is
no CORS to configure and no second URL to keep in sync.

Paths carry no trailing slash: FastAPI would answer a mismatch with a 307, and
a redirect behind a serverless proxy is a round trip nobody needs.
"""

from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException

from app.github.client import GitHubError, fetch
from app.github.repo_url import parse_repo_url
from app.rubric import engine
from app.schemas import AnalyseRequest

app = FastAPI(
    title="GitRep",
    description="Grades a public GitHub repository against a 100-point rubric.",
    version="2.1.0",
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
    try:
        owner, repo = parse_repo_url(request.github_url)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    try:
        fetched = await fetch(owner, repo)
    except GitHubError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail)

    report = engine.analyse(fetched.readme, fetched.repo)

    return {
        **report,
        "repo": fetched.repo,
        "analysed_at": datetime.now(timezone.utc).isoformat(),
        "rate_remaining": fetched.rate_remaining,
    }
