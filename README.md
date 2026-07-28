# GitHub Repo Analyzer 🚀

A full-stack web app that analyzes any public GitHub repository and gives instant, actionable feedback on its README and overall presentation — with a quality score out of 100.

## 🔍 Features

- 🔗 Paste any public GitHub repo URL
- 📄 Fetches repo metadata and the README via the GitHub API (works with any default branch)
- 📊 Scores README quality and repo presentation out of 100
- 💡 Concrete suggestions: missing installation steps, license, screenshots, topics, staleness, and more

## 🧱 Tech Stack

- **Frontend:** React 19 + Vite
- **Backend:** FastAPI (Python 3.10+)

## 📌 Running Locally

### 1. Clone the repo

```bash
git clone https://github.com/SamGabriel-Here/Github-Repo-Analyzer.git
cd Github-Repo-Analyzer
```

### 2. Start the backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

The API runs at `http://localhost:8000` (interactive docs at `/docs`).

### 3. Start the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` and paste a repo URL.

## ⚙️ Configuration

All optional, via environment variables:

| Variable | Where | Default | Purpose |
|---|---|---|---|
| `GITHUB_TOKEN` | backend | – | GitHub personal access token; raises the API rate limit from 60 to 5,000 requests/hour |
| `ALLOWED_ORIGINS` | backend | `http://localhost:5173` | Comma-separated list of allowed frontend origins (CORS) |
| `VITE_API_URL` | frontend | `http://localhost:8000` | Backend URL the frontend calls |

## 🧪 Use Cases

- Developers polishing their GitHub portfolios
- Mentors and career coaches giving structured feedback
- Hackathons or classes doing quick project reviews

## 🗺️ Roadmap

- [ ] Deeper README analysis (structure, tone, completeness)
- [ ] Analyze all repos on a profile at once
- [ ] Public deployment

## 📄 License

MIT
