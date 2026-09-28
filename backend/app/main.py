"""The API.

Every route sits under /api so the whole thing can be served from one origin
as a Vercel function, next to the built front end. Same-origin means there is
no CORS to configure and no second URL to keep in sync.

Paths carry no trailing slash: FastAPI would answer a mismatch with a 307, and
a redirect behind a serverless proxy is a round trip nobody needs.
"""

from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException, Response

from app import badge as badge_svg
from app.github.client import GitHubError, fetch, fetch_profile
from app.github.repo_url import parse_target
from app.rubric import engine
from app.schemas import AnalyseRequest

app = FastAPI(
    title="GitRep",
    description="Grades a public GitHub repository against a 100-point rubric.",
    version="3.0.0",
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


# A badge is fetched every time someone views a README it sits in, so the CDN
# holds a grade for an hour; a failure is held briefly so a fix shows up soon.
BADGE_CACHE = "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400"
BADGE_ERROR_CACHE = "public, max-age=300, s-maxage=300"


@app.get("/api/badge/{owner}/{repo}.svg")
async def badge(owner: str, repo: str):
    """The score as an SVG for a README, linking back to the full report.

    It always answers with an image, even when grading fails: a broken image
    icon in someone's README says less than a badge that names the problem.
    """
    try:
        target = parse_target(f"{owner}/{repo}")
        if target.kind != "repo":
            raise ValueError("not a repository")
        fetched = await fetch(target.owner, target.repo)
    except ValueError:
        return _svg(badge_svg.unavailable("not a repository"), BADGE_ERROR_CACHE)
    except GitHubError as exc:
        reason = "repo not found" if exc.status_code == 404 else "try again later"
        return _svg(badge_svg.unavailable(reason), BADGE_ERROR_CACHE)

    report = engine.analyse(fetched.readme, fetched.repo)
    statuses = [check["status"] for check in report["checks"]]
    return _svg(badge_svg.render(report["score"], statuses), BADGE_CACHE)


def _svg(body: str, cache: str) -> Response:
    return Response(body, media_type="image/svg+xml", headers={"Cache-Control": cache})


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
