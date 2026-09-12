import LedgerRow from "./LedgerRow";
import { timeAgo } from "../lib/format";

export default function ProfileReport({ report, onPickRepo }) {
  const { owner } = report;

  const facts = [
    { label: "Public repos", value: report.total_public },
    { label: "Graded", value: report.analysed },
    { label: "Forks skipped", value: report.skipped_forks },
    { label: "Best", value: report.best },
    { label: "Worst", value: report.worst },
    { label: "Median", value: report.median },
  ];

  return (
    <main className="report is-revealing" aria-live="polite">
      <div className="identity">
        <div>
          <h2 className="repo-name">{owner.login}</h2>
          {(owner.name || owner.bio) && (
            <p className="repo-description">{owner.bio || owner.name}</p>
          )}
        </div>
        <a className="repo-link" href={owner.url} target="_blank" rel="noreferrer">
          View on GitHub
        </a>
      </div>

      <dl className="facts">
        {facts.map((fact) => (
          <div className="fact" key={fact.label}>
            <dt>{fact.label}</dt>
            <dd>{fact.value}</dd>
          </div>
        ))}
      </dl>

      {report.degraded > 0 && (
        <p className="note">
          {report.degraded} {report.degraded === 1 ? "repository" : "repositories"} could not be
          read in full, so {report.degraded === 1 ? "its score is" : "their scores are"} lower
          than the truth. Try again in a moment.
        </p>
      )}

      {report.analysed === 0 ? (
        <p className="note">
          Nothing to grade. {owner.login} has no public repositories of their own, only forks.
        </p>
      ) : (
        <>
          <section className="ledger">
            <h3 className="ledger-head">Where the points go</h3>
            <p className="ledger-intro">
              Every check, totalled across all {report.analysed} repositories. The habit at the
              top is the one costing you most, so it is the one worth fixing first.
            </p>

            {report.habits.map((habit, index) => (
              <div className="entry" key={habit.id}>
                <LedgerRow
                  label={habit.label}
                  points={habit.lost ? `−${habit.lost}` : `${habit.possible}`}
                  tone={habit.lost ? "is-loss" : "is-pass"}
                  index={index}
                />
                <p className="entry-detail" style={{ "--i": index }}>
                  {habit.detail}
                </p>
                {habit.fix && (
                  <p className="entry-fix" style={{ "--i": index }}>
                    {habit.fix}
                  </p>
                )}
              </div>
            ))}

            <div className="total">
              <p className="total-verdict">{report.band}</p>
              <p className="total-figure">
                <span className="total-value">{report.average}</span>
                <span className="total-of">/100 average</span>
              </p>
            </div>
          </section>

          <section className="ledger">
            <h3 className="ledger-head">Every repository</h3>
            <p className="ledger-intro">Best first. Pick one to see its own assessment.</p>

            {report.repos.map((repo, index) => (
              <button
                className="repo-row"
                key={repo.name}
                onClick={() => onPickRepo(repo.name)}
                title={`Grade ${repo.name} on its own`}
              >
                <LedgerRow
                  label={repo.name.split("/")[1] || repo.name}
                  points={`${repo.score}`}
                  tone="is-pass"
                  index={index}
                />
                <span className="repo-row-meta">
                  {[repo.language, repo.stars ? `${repo.stars}★` : null, timeAgo(repo.pushed_at)]
                    .filter(Boolean)
                    .join("  ·  ")}
                </span>
              </button>
            ))}
          </section>
        </>
      )}
    </main>
  );
}
