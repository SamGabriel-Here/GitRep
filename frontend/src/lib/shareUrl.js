// A graded result is worth linking to, so the target lives in the query
// string: /?target=owner/name for a repository, /?target=owner for a profile.
// `repo` is still read so links shared before profiles existed keep working.

export function targetFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("target") || params.get("repo") || "";
}

export function putTargetInUrl(value) {
  const url = new URL(window.location.href);
  url.searchParams.delete("repo");
  if (value) url.searchParams.set("target", value);
  else url.searchParams.delete("target");
  window.history.replaceState(null, "", url);
}
