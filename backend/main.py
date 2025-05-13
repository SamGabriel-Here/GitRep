from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from github_scraper import fetch_github_data

app = FastAPI()

# ✅ CORS middleware setup BEFORE any routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # or ["*"] for testing
    allow_credentials=True,
    allow_methods=["*"],  # allow POST, OPTIONS, etc.
    allow_headers=["*"],
)

class GitHubRepoRequest(BaseModel):
    github_url: str

@app.post("/analyze_repo/")
async def analyze_repo(request: GitHubRepoRequest):
    result = fetch_github_data(request.github_url)
    return result
