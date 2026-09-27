import { useEffect, useState } from "react";

export function useMedia(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const list = window.matchMedia(query);
    const update = () => setMatches(list.matches);
    update();
    list.addEventListener("change", update);
    return () => list.removeEventListener("change", update);
  }, [query]);

  return matches;
}

// The pinned, scroll-driven stage needs room for the tower beside the story.
export const WIDE = "(min-width: 1000px)";
export const CALM = "(prefers-reduced-motion: reduce)";
