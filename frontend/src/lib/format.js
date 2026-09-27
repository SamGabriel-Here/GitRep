export function compact(n) {
  if (n == null) return "0";
  if (n < 1000) return String(n);
  return `${(n / 1000).toFixed(n < 10000 ? 1 : 0)}k`;
}

export function ago(iso) {
  if (!iso) return "never";
  const days = Math.floor((Date.now() - new Date(iso)) / 86400000);
  if (days < 1) return "today";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export function licence(repo) {
  if (!repo.license) return "none";
  return repo.license === "NOASSERTION" ? "unrecognised" : repo.license;
}

export const shortName = (full) => full.split("/")[1] ?? full;

// "Lost 23 points on 4 checks. Documentation is clean; discoverability gave the most away."
export function verdict(report) {
  const lost = report.checks.filter((c) => c.lost > 0);
  if (!lost.length) return "Full marks on all eleven checks. Nothing to fix.";
  const clean = report.categories.filter((c) => c.earned === c.possible).map((c) => c.label);
  const worst = [...report.categories]
    .filter((c) => c.earned < c.possible)
    .sort((a, b) => b.possible - b.earned - (a.possible - a.earned))[0];
  const total = lost.reduce((sum, c) => sum + c.lost, 0);
  const parts = [`Lost ${total} point${total === 1 ? "" : "s"} on ${lost.length} check${lost.length === 1 ? "" : "s"}.`];
  if (clean.length) parts.push(`${clean.join(" and ")} ${clean.length === 1 ? "is" : "are"} clean;`);
  parts.push(`${clean.length ? worst.label.toLowerCase() : worst.label} gave the most away.`);
  return parts.join(" ");
}
