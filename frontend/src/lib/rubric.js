// Everything the interface knows about the rubric that the API does not send:
// how the four categories read as sectors, what full marks means for each
// check, and the starter fix for each deduction.

export const SECTORS = [
  { id: "documentation", code: "S1", label: "Documentation", short: "Docs" },
  { id: "discovery", code: "S2", label: "Discoverability", short: "Discovery" },
  { id: "trust", code: "S3", label: "Trust signals", short: "Trust" },
  { id: "upkeep", code: "S4", label: "Upkeep", short: "Upkeep" },
];

export const sectorOf = (category) => SECTORS.find((s) => s.id === category) ?? SECTORS[0];

// A check's status as a sector colour: full marks, points lost, nothing earned.
export const TONE = { pass: "full", partial: "part", fail: "none" };

// Mirrors the "Full marks when" column of the README's rubric table.
export const CRITERIA = {
  readme_depth: "600 or more words of prose, with badges and code set aside.",
  readme_structure: "Six or more headings organise the page.",
  install: "A setup section with a command you can copy.",
  usage: "A usage section with a worked example.",
  media: "Two screenshots, or a GIF or video of it running.",
  description: "The repository description is a full sentence.",
  topics: "Three or more topics set.",
  homepage: "The repository's website field points somewhere.",
  license: "A license GitHub recognises.",
  signals: "Two of: CI, a contributing guide, visible tests.",
  recency: "Pushed within the last 90 days.",
};

export const SECTOR_WHY = {
  documentation: "The part you control entirely, and the only part most visitors read.",
  discovery: "What shows up before anyone opens the repository.",
  trust: "The signs that someone could safely depend on it.",
  upkeep: "Whether anyone is still home.",
};

// GitHub's own language colours, for the team stripe beside a repository.
const LANGUAGE_COLOURS = {
  Python: "#3572A5", JavaScript: "#f1e05a", TypeScript: "#3178c6", Go: "#00ADD8", Rust: "#dea584",
  Java: "#b07219", Kotlin: "#A97BFF", Swift: "#F05138", "C++": "#f34b7d", C: "#555555", "C#": "#178600",
  Ruby: "#701516", PHP: "#4F5D95", Dart: "#00B4AB", HTML: "#e34c26", CSS: "#563d7c", Shell: "#89e051",
  "Jupyter Notebook": "#DA5B0B", Vue: "#41b883", Svelte: "#ff3e00", Lua: "#000080", Scala: "#c22d40",
  Elixir: "#6e4a7e", Haskell: "#5e5086", Zig: "#ec915c", R: "#198CE7", Julia: "#a270ba",
};
export const teamColour = (language) => LANGUAGE_COLOURS[language] ?? "#80848e";

// Each README line as a mark on the track map: heading, prose, code, image or blank.
export function readmeShape(text) {
  if (!text) return [];
  let fenced = false;
  return text.split("\n").map((line) => {
    const t = line.trim();
    if (/^(```|~~~)/.test(t)) {
      fenced = !fenced;
      return { kind: "c", size: 1 };
    }
    if (fenced) return { kind: "c", size: Math.min(1, line.length / 90) };
    if (!t) return { kind: "b", size: 0 };
    if (t.startsWith("#")) return { kind: "h", size: 1 };
    if (/^!\[|<img\b/i.test(t)) return { kind: "i", size: 1 };
    return { kind: "p", size: Math.min(1, line.length / 110) };
  });
}

const INSTALL = {
  Python: "pip install -r requirements.txt",
  JavaScript: "npm install",
  TypeScript: "npm install",
  Go: "go build ./...",
  Rust: "cargo build --release",
  Ruby: "bundle install",
  Dart: "flutter pub get",
  Java: "./gradlew build",
  Kotlin: "./gradlew build",
};

const CI_STEPS = {
  Python: ["      - uses: actions/setup-python@v5", "        with:", "          python-version: \"3.12\"", "      - run: pip install -r requirements.txt pytest", "      - run: pytest"],
  JavaScript: ["      - uses: actions/setup-node@v4", "        with:", "          node-version: 20", "      - run: npm ci", "      - run: npm test"],
  TypeScript: ["      - uses: actions/setup-node@v4", "        with:", "          node-version: 20", "      - run: npm ci", "      - run: npm test"],
  Go: ["      - uses: actions/setup-go@v5", "      - run: go test ./..."],
  Rust: ["      - run: cargo test"],
};

const gh = (repo, path) => `${repo.url}/${path}`;

// A starter for a deduction: something to copy, or a link that does the job
// on GitHub. Templates, clearly labelled as such, never claims about the repo.
export function starter(check, report) {
  if (!check.lost || !report?.repo) return null;
  const repo = report.repo;
  const name = repo.name.split("/")[1];
  const branch = repo.default_branch || "main";
  const editReadme = { href: gh(repo, `edit/${branch}/README.md`), action: "Edit the README on GitHub" };

  switch (check.id) {
    case "install":
      return {
        file: "README.md",
        lines: ["## Installation", "", "```bash", `git clone ${repo.url}.git`, `cd ${name}`, INSTALL[repo.language] ?? "# the commands that get it running", "```"],
        ...editReadme,
      };
    case "usage":
      return {
        file: "README.md",
        lines: ["## Usage", "", "```bash", "# the one command that shows it working", "```", "", "What it prints, or a screenshot of the result."],
        ...editReadme,
      };
    case "media":
      return { file: "README.md", lines: [`![${name} running](docs/screenshot.png)`], ...editReadme };
    case "readme_structure":
      return {
        file: "README.md",
        lines: ["## What it does", "## Installation", "## Usage", "## How it works", "## Contributing", "## License"],
        ...editReadme,
      };
    case "readme_depth":
      return { file: "README.md", lines: ["What it does, who it is for, and why it exists,", "in plain sentences before any code."], ...editReadme };
    case "signals": {
      const steps = CI_STEPS[repo.language] ?? ["      - run: echo \"add your build and test commands\""];
      const lines = ["name: CI", "on: [push, pull_request]", "jobs:", "  test:", "    runs-on: ubuntu-latest", "    steps:", "      - uses: actions/checkout@v4", ...steps];
      const value = encodeURIComponent(lines.join("\n") + "\n");
      return {
        file: ".github/workflows/ci.yml",
        lines,
        href: gh(repo, `new/${branch}?filename=.github/workflows/ci.yml&value=${value}`),
        action: "Create this file on GitHub",
      };
    }
    case "license":
      return {
        file: "LICENSE",
        lines: [],
        note: "Name the new file LICENSE and GitHub offers its license templates.",
        href: gh(repo, `new/${branch}?filename=LICENSE`),
        action: "Add a license on GitHub",
      };
    case "homepage": {
      const found = check.evidence?.find((mark) => mark.url);
      return {
        file: "About › Website",
        lines: found ? [found.url] : [],
        note: found ? "Already linked from your README. Put it in the sidebar too." : "Deploy it on Vercel, Netlify or GitHub Pages, then set the website field.",
        href: repo.url,
        action: "Open the repository",
      };
    }
    case "description":
    case "topics":
      return {
        file: check.id === "topics" ? "About › Topics" : "About › Description",
        lines: [],
        note: "Set it from the gear beside About on the repository page.",
        href: repo.url,
        action: "Open the repository",
      };
    default:
      return null;
  }
}

// README lines around each piece of evidence, merged into hunks, so the
// evidence view shows a few lines of context instead of the whole file.
export function evidenceHunks(text, checks, context = 2) {
  const lines = (text ?? "").split("\n");
  const marks = new Map();
  for (const check of checks) {
    for (const mark of check.evidence ?? []) {
      // The README arrives capped; a line past the cap has nothing to show.
      if (mark.line > lines.length) continue;
      if (!marks.has(mark.line)) marks.set(mark.line, []);
      const list = marks.get(mark.line);
      if (!list.some((c) => c.id === check.id)) list.push(check);
    }
  }
  const wanted = [...marks.keys()].sort((a, b) => a - b);
  const hunks = [];
  for (const line of wanted) {
    const from = Math.max(1, line - context);
    const to = Math.min(lines.length, line + context);
    const last = hunks.at(-1);
    if (last && from <= last.to + 1) last.to = Math.max(last.to, to);
    else hunks.push({ from, to });
  }
  return hunks.map((h) => ({
    ...h,
    lines: Array.from({ length: h.to - h.from + 1 }, (_, k) => {
      const n = h.from + k;
      return { n, text: lines[n - 1] ?? "", checks: marks.get(n) ?? [] };
    }),
  }));
}
