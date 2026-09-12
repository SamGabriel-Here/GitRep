// A graded repo is worth linking to, so it lives in the query string:
// /?repo=owner/name loads that report directly.

export function repoFromUrl() {
  return new URLSearchParams(window.location.search).get("repo") || "";
}

export function putRepoInUrl(value) {
  const url = new URL(window.location.href);
  if (value) url.searchParams.set("repo", value);
  else url.searchParams.delete("repo");
  window.history.replaceState(null, "", url);
}
