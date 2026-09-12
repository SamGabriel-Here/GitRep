import { useCallback, useEffect, useState } from "react";

const KEY = "gitrep-theme";

// The initial value is already on <html>, set by the inline script in index.html
// so the first paint is never the wrong colour.
export function useTheme() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || "light");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      // Private browsing. The theme still applies for this visit.
    }
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }, []);

  return [theme, toggle];
}
