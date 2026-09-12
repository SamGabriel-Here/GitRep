import LedgerRow from "./LedgerRow";
import { fullDate, licenceName, timeAgo } from "../lib/format";

export default function Report({ report }) {
  const repo = report.repo;
  const [owner, name] = repo.name.split("/");

  const facts = [
    { label: "Stars", value: repo.stars.toLocaleString() },
    { label: "Forks", value: repo.forks.toLocaleString() },
    { label: "Language", value: repo.language || "none" },
    { label: "Open issues", value: repo.open_issues.toLocaleString() },
    { label: "License", value: licenceName(repo) },
    { label: "Last push", value: timeAgo(repo.pushed_at), title: fullDate(repo.pushed_at) },
  ];

  // One continuous stagger across the whole ledger, not per category.
  let position = 0;

  return (
    <main className="report is-revealing" aria-live="polite">
      <div className="identity">
        <div>
          <h2 className="repo-name">
            <span className="owner">{owner}/</span>
            {name}
          </h2>
          {repo.description && <p className="repo-description">{repo.description}</p>}
          {(repo.is_fork || repo.is_archived) && (
            <div className="flags">
              {repo.is_fork && <span className="flag">fork</span>}
              {repo.is_archived && <span className="flag">archived</span>}
            </div>
          )}
        </div>
        <a className="repo-link" href={repo.url} target="_blank" rel="noreferrer">
          View on GitHub
        </a>
      </div>

      <dl className="facts">
        {facts.map((fact) => (
          <div className="fact" key={fact.label} title={fact.title}>
            <dt>{fact.label}</dt>
            <dd>{fact.value}</dd>
          </div>
        ))}
      </dl>

      <section className="ledger">
        <h3 className="ledger-head">The assessment</h3>
        <p className="ledger-intro">
          Every check starts at full marks. What was taken off is listed with the reason and the fix.
        </p>

        {report.categories.map((category) => {
          const entries = report.checks.filter((check) => check.category === category.id);
          return (
            <div className="category" key={category.id}>
              <div className="category-head">
                <h4 className="category-name">{category.label}</h4>
                <span className="category-score">
                  {category.earned} of {category.possible}
                </span>
              </div>

              {entries.map((check) => {
                const index = position++;
                const passed = check.status === "pass";
                return (
                  <div className="entry" key={check.id}>
                    <LedgerRow
                      label={check.label}
                      points={passed ? `${check.earned}` : `−${check.lost}`}
                      tone={passed ? "is-pass" : "is-loss"}
                      index={index}
                    />
                    <p className="entry-detail" style={{ "--i": index }}>
                      {check.detail}
                    </p>
                    {check.fix && (
                      <p className="entry-fix" style={{ "--i": index }}>
                        {check.fix}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}

        <div className="total">
          <p className="total-verdict">{report.band}</p>
          <p className="total-figure">
            <span className="total-value">{report.score}</span>
            <span className="total-of">/100</span>
          </p>
        </div>
      </section>
    </main>
  );
}
