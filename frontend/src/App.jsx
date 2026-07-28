import { useEffect, useRef, useState } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function scoreColor(score) {
  if (score >= 80) return "#4ade80";
  if (score >= 50) return "#fbbf24";
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

const Icon = ({ path, size = 16 }) => (
  <svg
    className="icon"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {path}
  </svg>
);

const icons = {
  star: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />,
  fork: (
    <>
      <circle cx="6" cy="5" r="2.2" />
      <circle cx="18" cy="5" r="2.2" />
      <circle cx="12" cy="19" r="2.2" />
      <path d="M6 7.2v1.3a3 3 0 003 3h6a3 3 0 003-3V7.2M12 11.5v5.3" />
    </>
  ),
  code: <path d="M8 6l-6 6 6 6M16 6l6 6-6 6" />,
  issue: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </>
  ),
  license: (
    <>
      <path d="M12 3v18M5 7l7-4 7 4M4 21h16" />
      <path d="M5 7l-3 7a3.5 3.5 0 006 0L5 7zM19 7l-3 7a3.5 3.5 0 006 0l-3-7z" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  spark: <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4L12 2z" />,
};

function ScoreRing({ score }) {
  const r = 52;
  const circumference = 2 * Math.PI * r;
  const [progress, setProgress] = useState(0);
  const [display, setDisplay] = useState(0);
  const color = scoreColor(score);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setProgress(score));
    const start = performance.now();
    const duration = 900;
    let frame;
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      setDisplay(Math.round(score * (1 - Math.pow(1 - t, 3))));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(frame);
    };
  }, [score]);

  return (
    <div className="score-ring" style={{ "--score-color": color }}>
      <svg viewBox="0 0 120 120" width="120" height="120">
        <circle className="ring-track" cx="60" cy="60" r={r} />
        <circle
          className="ring-fill"
          cx="60"
          cy="60"
          r={r}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (progress / 100) * circumference}
        />
      </svg>
      <div className="score-text">
        <span className="score-value">{display}</span>
        <span className="score-label">score</span>
      </div>
    </div>
  );
}

function App() {
  const [repoUrl, setRepoUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [slow, setSlow] = useState(false);
  const [error, setError] = useState("");
  const slowTimer = useRef(null);

  const analyzeRepo = async (e) => {
    e.preventDefault();
    if (!repoUrl.trim() || loading) return;
    setLoading(true);
    setError("");
    setResult(null);
    slowTimer.current = setTimeout(() => setSlow(true), 4000);
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
    } finally {
      clearTimeout(slowTimer.current);
      setSlow(false);
      setLoading(false);
    }
  };

  const stats = result && [
    { icon: icons.star, value: result.stars.toLocaleString(), label: "Stars" },
    { icon: icons.fork, value: result.forks.toLocaleString(), label: "Forks" },
    { icon: icons.code, value: result.language || "—", label: "Language" },
    { icon: icons.issue, value: result.open_issues.toLocaleString(), label: "Issues" },
    { icon: icons.license, value: result.license || "None", label: "License" },
    { icon: icons.clock, value: formatDate(result.last_push), label: "Last push" },
  ];

  return (
    <div className="app">
      <div className="bg-glow" aria-hidden="true" />

      <header className="header">
        <h1 className="logo">GitRep</h1>
        <p className="tagline">
          Instant, honest feedback on any public GitHub repository.
        </p>
      </header>

      <form className="input-section" onSubmit={analyzeRepo}>
        <input
          type="text"
          placeholder="https://github.com/user/repo"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          aria-label="GitHub repository URL"
          spellCheck="false"
        />
        <button type="submit" disabled={loading}>
          {loading ? <span className="spinner" aria-hidden="true" /> : "Analyze"}
        </button>
      </form>

      {loading && slow && (
        <p className="slow-note">
          Waking up the server — free hosting naps when idle. Up to a minute on
          the first visit.
        </p>
      )}

      {error && <p className="error">{error}</p>}

      {result && (
        <main className="result-section" key={result.name}>
          <div className="result-header">
            <div className="result-title">
              <a href={result.url} target="_blank" rel="noreferrer">
                <h2>{result.name}</h2>
              </a>
              {result.description && (
                <p className="description">{result.description}</p>
              )}
            </div>
            <ScoreRing score={result.score} />
          </div>

          <div className="stats-grid">
            {stats.map((s) => (
              <div className="stat" key={s.label}>
                <Icon path={s.icon} />
                <span className="stat-value">{s.value}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>

          <div className="suggestions">
            <h3>Suggestions</h3>
            {result.suggestions.length === 0 ? (
              <p className="all-good">
                Nothing to fix — this repo is in great shape.
              </p>
            ) : (
              <ul>
                {result.suggestions.map((s, i) => (
                  <li key={i} style={{ animationDelay: `${0.15 + i * 0.07}s` }}>
                    <Icon path={icons.spark} size={14} />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </main>
      )}

      <footer className="footer">
        <a
          href="https://github.com/SamGabriel-Here/GitRep"
          target="_blank"
          rel="noreferrer"
        >
          Open source on GitHub
        </a>
      </footer>
    </div>
  );
}

export default App;
