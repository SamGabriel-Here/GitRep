import { useState } from "react";
import "./App.css";

function App() {
  const [repoUrl, setRepoUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyzeRepo = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch("http://localhost:8000/analyze_repo/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ github_url: repoUrl }),
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
        <p>Analyze any public GitHub repository with one click.</p>
      </header>

      <div className="input-section">
        <input
          type="text"
          placeholder="https://github.com/user/repo"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
        />
        <button onClick={analyzeRepo} disabled={loading}>
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </div>

      <div className="result-section">
        <h2>Analysis Result</h2>
        {error && <p className="error">❌ {error}</p>}
        {result && (
          <pre className="result-box">{JSON.stringify(result, null, 2)}</pre>
        )}
      </div>
    </div>
  );
}

export default App;
