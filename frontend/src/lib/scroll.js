// Scroll so the stage shows position `s` (in screens).
export function scrollToScreen(el, s, screens) {
  if (!el) return;
  const range = el.offsetHeight - window.innerHeight;
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: el.offsetTop + (s / (screens - 1)) * range, behavior: calm ? "auto" : "smooth" });
}
