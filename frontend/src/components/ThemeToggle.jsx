export default function ThemeToggle({ theme, onToggle }) {
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button className="theme-toggle" onClick={onToggle} aria-label={`Switch to ${next} theme`}>
      {next === "dark" ? "Dark" : "Light"}
    </button>
  );
}
