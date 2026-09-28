// Positions on a pinned stage are in screens scrolled. A span [from, to] is
// split into equal beats, one per check, habit or sector.

// Scroll so the stage shows position `s` (in screens).
export function scrollToScreen(el, s, screens) {
  if (!el) return;
  const range = el.offsetHeight - window.innerHeight;
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: el.offsetTop + (s / (screens - 1)) * range, behavior: calm ? "auto" : "smooth" });
}

// The beat at `s`. `card` holds the nearest one even outside the span, so a
// layer fading out keeps its content; `now` is -1 outside the span.
export function beatAt(s, [from, to], count) {
  const card = Math.min(count - 1, Math.max(0, Math.floor((s - from) / ((to - from) / count))));
  return { card, now: s >= from && s < to ? card : -1 };
}

// The middle of beat `k`, where a jump to it lands.
export const beatMiddle = ([from, to], count, k) => from + (k + 0.5) * ((to - from) / count);

// Each cue lights from its `from` onward; clicking it scrolls to its `at`.
export const cueAt = (cues, s) => cues.findLast((cue) => s >= cue.from).id;

// The previous position when nothing in it changed, so scrolling within a
// beat does not re-render the view.
export const keepSame = (prev, next) => (Object.keys(next).every((k) => prev[k] === next[k]) ? prev : next);
