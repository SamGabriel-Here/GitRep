// Same origin in every environment: production serves the API as a function
// next to the built site, and the Vite dev server proxies /api to uvicorn.

async function call(path, options) {
  let response;
  try {
    response = await fetch(`/api${path}`, options);
  } catch {
    throw new Error("Could not reach GitRep. Check your connection and try again.");
  }

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.detail || `The server answered with HTTP ${response.status}.`);
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

// A result lives in the URL so any report is a link: ?target=owner/name for a
// repository, ?target=owner for a profile, ?compare=a,b for a head-to-head.
// ?repo= is still read so links from before profiles existed keep working.
export function readRoute() {
  const params = new URLSearchParams(window.location.search);
  const [a, b] = (params.get("compare") ?? "").split(",").map((s) => s.trim());
  if (a && b) return { kind: "compare", a, b };
  const target = (params.get("target") || params.get("repo") || "").trim();
  return target ? { kind: "target", target } : { kind: "home" };
}

// "a vs b" (or "a vs. b") compares; anything else is one repo or a profile.
export function routeFor(value) {
  const text = value.trim();
  if (!text) return null;
  const pair = text.split(/\s+vs\.?\s+/i);
  if (pair.length === 2 && pair[0] && pair[1]) return { kind: "compare", a: pair[0].trim(), b: pair[1].trim() };
  return { kind: "target", target: text };
}

// Slashes stay readable, so a shared link says /?target=owner/name.
const part = (value) => encodeURIComponent(value).replace(/%2F/gi, "/");

export function routeHref(route) {
  if (route.kind === "compare") return `/?compare=${part(route.a)},${part(route.b)}`;
  if (route.kind === "target") return `/?target=${part(route.target)}`;
  return "/";
}

export function navigate(route) {
  window.history.pushState(null, "", routeHref(route));
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo(0, 0);
}
