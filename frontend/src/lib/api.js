// Same origin in every environment: production serves the API as a function
// next to the built site, and the Vite dev server proxies /api to uvicorn.

async function call(path, options) {
  let response;
  try {
    response = await fetch(`/api${path}`, options);
  } catch {
    throw new Error("Could not reach the GitRep server. Check your connection and try again.");
  }

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.detail || `The server returned HTTP ${response.status}.`);
  }
  return body;
}

export function grade(target) {
  return call("/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ github_url: target }),
  });
}

export function loadRubric() {
  return call("/rubric");
}
