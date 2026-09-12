from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.config import allowed_origins
from app.github.client import GitHubError, fetch
from app.github.repo_url import parse_repo_url
from app.rubric import engine
from app.schemas import AnalyseRequest

app = FastAPI(
    title="GitRep",
    description="Grades a public GitHub repository against a 100-point rubric.",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins(),
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/")
async def health():
    return {"status": "ok", "version": app.version}


@app.get("/rubric/")
async def get_rubric():
    """What we grade and what each check is worth, before any repo is named."""
    return {"total": sum(c["possible"] for c in engine.rubric()), "checks": engine.rubric()}


@app.post("/analyze_repo/")
async def analyze_repo(request: AnalyseRequest):
    try:
        owner, repo = parse_repo_url(request.github_url)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    try:
        fetched = await fetch(owner, repo)
    except GitHubError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail)

    report = engine.analyse(fetched.readme, fetched.repo)

    # The old response had repo fields at the top level. Keep them there so an
    # existing client does not break on the new shape.
    return {
        **fetched.repo,
        **report,
        "repo": fetched.repo,
        "last_push": fetched.repo["pushed_at"],
        "analysed_at": datetime.now(timezone.utc).isoformat(),
        "rate_remaining": fetched.rate_remaining,
    }
