export function timeAgo(iso) {
  if (!iso) return "unknown";
  const days = Math.floor((Date.now() - new Date(iso)) / 86400000);
  if (days < 1) return "today";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export function fullDate(iso) {
  if (!iso) return undefined;
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function licenceName(repo) {
  if (!repo.license) return "none";
  return repo.license === "NOASSERTION" ? "unrecognised" : repo.license;
}
