import { useCallback, useEffect, useRef, useState } from "react";
import "./styles/app.css";
import { grade, loadRubric } from "./lib/api";
import { repoFromUrl, putRepoInUrl } from "./lib/shareUrl";
import { useTheme } from "./hooks/useTheme";
import GradeForm from "./components/GradeForm";
import Masthead from "./components/Masthead";
import Report from "./components/Report";
import Rubric from "./components/Rubric";

const SOURCE_URL = "https://github.com/SamGabriel-Here/GitRep";
const EXAMPLES = ["facebook/react", "tiangolo/fastapi", "SamGabriel-Here/GitRep"];

export default function App() {
  const [theme, toggleTheme] = useTheme();
  const [target, setTarget] = useState(repoFromUrl);
  const [report, setReport] = useState(null);
  const [rubric, setRubric] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const reportRef = useRef(null);

  const run = useCallback(async (value) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    setBusy(true);
    setError("");
    setReport(null);

    try {
      const result = await grade(trimmed);
      setReport(result);
      putRepoInUrl(result.repo.name);
    } catch (err) {
      setError(err.message);
      putRepoInUrl("");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    loadRubric().then(setRubric).catch(() => setRubric(null));
  }, []);

  // Opening a shared link grades that repo straight away.
  useEffect(() => {
    const shared = repoFromUrl();
    if (shared) run(shared);
  }, [run]);

  useEffect(() => {
    if (report && reportRef.current) {
      reportRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [report]);

  const pickExample = (value) => {
    setTarget(value);
    run(value);
  };

  return (
    <div className="shell">
      <Masthead theme={theme} onToggleTheme={toggleTheme} sourceUrl={SOURCE_URL} />

      <section className="opening">
        <div className="pitch">
          <h1 className="headline">Every repo starts at 100.</h1>
          <p className="standfirst">
            Paste a public repository. GitRep reads its README the way a stranger would, then shows
            you exactly where the points went.
          </p>

          <GradeForm
            value={target}
            onChange={setTarget}
            onSubmit={() => run(target)}
            onPickExample={pickExample}
            examples={EXAMPLES}
            busy={busy}
          />


          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
        </div>

        {rubric && <Rubric checks={rubric.checks} total={rubric.total} />}
      </section>

      <div ref={reportRef}>{report && <Report report={report} key={report.repo.name} />}</div>

      <footer className="footer">
        <span>Reads public repositories through the GitHub API. Nothing is stored.</span>
        <a href={SOURCE_URL} target="_blank" rel="noreferrer">
          SamGabriel-Here/GitRep
        </a>
      </footer>
    </div>
  );
}
