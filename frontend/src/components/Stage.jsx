import { useEffect, useRef } from "react";

const clamp01 = (x) => Math.min(1, Math.max(0, x));

// A pinned viewport that the page scrolls through. Anything inside it marked
// data-span="from to" (in screens scrolled) gets --in, --out and --t written
// onto it every frame, so every transition is plain CSS and React only
// re-renders when a view's onScroll callback changes something discrete.
export default function Stage({ screens, onScroll, runRef, className = "", children }) {
  const run = useRef(null);
  const callback = useRef(onScroll);
  const tickRef = useRef(null);

  useEffect(() => {
    callback.current = onScroll;
  });

  useEffect(() => {
    const el = run.current;
    if (runRef) runRef.current = el;
    let queued = false;

    const tick = () => {
      queued = false;
      const range = Math.max(1, el.offsetHeight - window.innerHeight);
      const s = clamp01(-el.getBoundingClientRect().top / range) * (screens - 1);
      el.style.setProperty("--s", s.toFixed(3));
      for (const layer of el.querySelectorAll("[data-span]")) {
        const [from, to] = layer.dataset.span.split(" ").map(Number);
        const ramp = Number(layer.dataset.ramp ?? 0.3);
        const enter = from <= 0 ? 1 : clamp01((s - from) / ramp);
        const leave = to >= screens - 1 ? 0 : clamp01((s - to + ramp) / ramp);
        layer.style.setProperty("--in", enter.toFixed(3));
        layer.style.setProperty("--out", leave.toFixed(3));
        layer.style.setProperty("--t", clamp01((s - from) / (to - from)).toFixed(4));
        layer.toggleAttribute("data-off", enter === 0 || leave === 1);
      }
      callback.current?.(s);
    };
    tickRef.current = tick;

    const schedule = () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(tick);
      }
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    tick();
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [screens, runRef]);

  // New layers can appear after a render; give them their values at once.
  useEffect(() => {
    tickRef.current?.();
  });

  return (
    <div ref={run} className={`run ${className}`} style={{ height: `${screens * 100}vh` }}>
      <div className="stage">{children}</div>
    </div>
  );
}

// Scroll so the stage shows position `s` (in screens).
export function scrollToScreen(el, s, screens) {
  if (!el) return;
  const range = el.offsetHeight - window.innerHeight;
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: el.offsetTop + (s / (screens - 1)) * range, behavior: calm ? "auto" : "smooth" });
}
