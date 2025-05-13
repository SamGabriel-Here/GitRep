import requests

def fetch_github_data(github_url: str):
    # Parse the repo name and username from the URL
    repo_name = github_url.rstrip("/").split("/")[-1]
    username = github_url.rstrip("/").split("/")[-2]
    
    # Construct the GitHub API URL
    api_url = f"https://api.github.com/repos/{username}/{repo_name}"

    # Fetch repository data
    response = requests.get(api_url)
    if response.status_code != 200:
        return {"error": "Invalid GitHub URL"}

    repo_data = response.json()

    # Get README content
    readme_url = f"https://raw.githubusercontent.com/{username}/{repo_name}/main/README.md"
    readme_response = requests.get(readme_url)
    readme_text = readme_response.text if readme_response.status_code == 200 else ""

    suggestions = []

    # Analyze README
    if len(readme_text) < 100:
        suggestions.append("Your README is too short. Consider adding more details.")
    if "![badge" not in readme_text and "badge" not in readme_text:
        suggestions.append("Add badges (e.g. stars, build, license) to your README.")
    if "installation" not in readme_text.lower():
        suggestions.append("Include installation instructions in your README.")
    if "demo" not in readme_text.lower():
        suggestions.append("Add a demo section or screenshots.")

    # Check repo activity
    pushed_at = repo_data.get("pushed_at", "")
    if "2023" in pushed_at or "2022" in pushed_at:
        suggestions.append("Last activity was old. Consider updating or contributing more often.")

    return {
        "name": repo_data["name"],
        "stars": repo_data["stargazers_count"],
        "forks": repo_data["forks_count"],
        "language": repo_data["language"],
        "open_issues": repo_data["open_issues_count"],
        "last_push": pushed_at,
        "readme_length": len(readme_text),
        "suggestions": suggestions,
    }
