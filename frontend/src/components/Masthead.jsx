import ThemeToggle from "./ThemeToggle";

export default function Masthead({ theme, onToggleTheme, sourceUrl }) {
  return (
    <header className="masthead">
      <span className="wordmark">GitRep</span>
      <div className="masthead-right">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        <a href={sourceUrl} target="_blank" rel="noreferrer">
          Source
        </a>
      </div>
    </header>
  );
}
