import LedgerRow from "./LedgerRow";

export default function Rubric({ checks, total }) {
  const groups = [];
  for (const check of checks) {
    const existing = groups.find((g) => g.id === check.category);
    if (existing) existing.checks.push(check);
    else groups.push({ id: check.category, label: check.category_label, checks: [check] });
  }

  return (
    <aside className="rubric">
      <div className="rubric-head">
        <h2 className="rubric-title">What it grades</h2>
        <span className="rubric-total">{total} points</span>
      </div>

      {groups.map((group) => (
        <div className="rubric-group" key={group.id}>
          <p className="rubric-group-name">{group.label}</p>
          {group.checks.map((check) => (
            <LedgerRow key={check.id} label={check.label} points={check.possible} tone="is-pass" />
          ))}
        </div>
      ))}
    </aside>
  );
}
