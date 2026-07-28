import { useState } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function scoreColor(score) {
  if (score >= 80) return "#4ade80";
  if (score >= 50) return "#facc15";
  return "#f87171";
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function App() {
  const [repoUrl, setRepoUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyzeRepo = async (e) => {
    e.preventDefault();
    if (!repoUrl.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch(`${API_URL}/analyze_repo/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ github_url: repoUrl.trim() }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Error analyzing repo");

      setResult(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>GitHub Repo Analyzer</h1>
        <p>Get instant feedback on any public GitHub repository.</p>
      </header>

      <form className="input-section" onSubmit={analyzeRepo}>
        <input
          type="text"
          placeholder="https://github.com/user/repo"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          aria-label="GitHub repository URL"
        />
        <button type="submit" disabled={loading}>
          {loading ? "Analyzing…" : "Analyze"}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {result && (
        <div className="result-section">
          <div className="result-header">
            <div>
              <a href={result.url} target="_blank" rel="noreferrer">
                <h2>{result.name}</h2>
              </a>
              {result.description && <p className="description">{result.description}</p>}
            </div>
            <div
              className="score-ring"
              style={{ borderColor: scoreColor(result.score) }}
              title="README quality score"
            >
              <span className="score-value">{result.score}</span>
              <span className="score-label">score</span>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat">
              <span className="stat-value">⭐ {result.stars.toLocaleString()}</span>
              <span className="stat-label">Stars</span>
            </div>
            <div className="stat">
              <span className="stat-value">🍴 {result.forks.toLocaleString()}</span>
              <span className="stat-label">Forks</span>
            </div>
            <div className="stat">
              <span className="stat-value">{result.language || "—"}</span>
              <span className="stat-label">Language</span>
            </div>
            <div className="stat">
              <span className="stat-value">{result.open_issues.toLocaleString()}</span>
              <span className="stat-label">Open issues</span>
            </div>
            <div className="stat">
              <span className="stat-value">{result.license || "None"}</span>
              <span className="stat-label">License</span>
            </div>
            <div className="stat">
              <span className="stat-value">{formatDate(result.last_push)}</span>
              <span className="stat-label">Last push</span>
            </div>
          </div>

          <div className="suggestions">
            <h3>Suggestions</h3>
            {result.suggestions.length === 0 ? (
              <p className="all-good">Looking great — no suggestions! 🎉</p>
            ) : (
              <ul>
                {result.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
