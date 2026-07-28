import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from github_scraper import GitHubError, fetch_github_data

app = FastAPI(title="GitHub Repo Analyzer")

# Comma-separated list of allowed frontend origins, e.g.
# ALLOWED_ORIGINS="http://localhost:5173,https://myapp.example.com"
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in allowed_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class GitHubRepoRequest(BaseModel):
    github_url: str


@app.get("/")
async def health():
    return {"status": "ok"}


@app.post("/analyze_repo/")
async def analyze_repo(request: GitHubRepoRequest):
    try:
        return fetch_github_data(request.github_url)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except GitHubError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail)
