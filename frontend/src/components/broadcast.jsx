// The graphics package: every view is built from these pieces, the way a
// broadcast reuses one tower, one strap and one lower third all weekend.
import { useState } from "react";
import { sectorOf } from "../lib/rubric";

export function Mark() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className="mark-svg">
      <rect x=".75" y=".75" width="62.5" height="62.5" rx="14" fill="#1C2119" stroke="#E9EAE6" strokeOpacity=".18" strokeWidth="1.5" />
      <g fill="none" strokeLinecap="round">
        <path d="M16 23h11" stroke="#E9EAE6" strokeWidth="4" />
        <path d="M32 23h8" stroke="#E9EAE6" strokeWidth="2.4" strokeDasharray="0.1 3.6" opacity=".5" />
        <path d="M44.5 23h3.5" stroke="#E9EAE6" strokeWidth="4" />
        <path d="M16 34h7" stroke="#E9EAE6" strokeWidth="4" />
        <path d="M28 34h12" stroke="#E9EAE6" strokeWidth="2.4" strokeDasharray="0.1 3.6" opacity=".5" />
        <path d="M44.5 34h3.5" stroke="#E2705A" strokeWidth="4" />
        <path d="M16 46h32" stroke="#E9EAE6" strokeWidth="5" />
      </g>
    </svg>
  );
}

// Top strip: the mark, the cues for this view, and the eleven mini-sectors.
export function Bug({ cues = [], current, onCue, segments, onSegment, now = -1 }) {
  return (
    <nav className="bug" aria-label="GitRep">
      <a className="wordmark" href="/" aria-label="GitRep, grade another repository">
        <Mark />
        <span>GitRep</span>
      </a>
      {cues.length > 0 && (
        <div className="cues">
          {cues.map((cue) => (
            <button key={cue.id} type="button" className="cue" aria-current={cue.id === current || undefined} onClick={() => onCue(cue)}>
              {cue.label}
            </button>
          ))}
        </div>
      )}
      {segments && onSegment && (
        <div className="sectors" role="group" aria-label="The eleven checks">
          {segments.map((seg, i) => (
            <button
              key={seg.id}
              type="button"
              className={`seg${i === now ? " is-now" : ""}`}
              data-tone={seg.tone}
              style={{ "--k": i }}
              aria-label={seg.label}
              title={seg.label}
              onClick={() => onSegment(i)}
            />
          ))}
        </div>
      )}
      {segments && !onSegment && (
        // Without a jump to make, the strip is a picture, not a row of controls.
        <div className="sectors" aria-hidden="true">
          {segments.map((seg, i) => (
            <span key={seg.id} className="seg" data-tone={seg.tone} style={{ "--k": i }} />
          ))}
        </div>
      )}
    </nav>
  );
}

// The timing tower. `mode` remounts the rows so a new standings wipes in.
export function Tower({ title, figure, rows, mode, label, className = "" }) {
  return (
    <aside className={`tower ${className}`} aria-label={label ?? title}>
      <div className="tower-head">
        <span className="tower-title">{title}</span>
        {figure != null && <span className="tower-figure">{figure}</span>}
      </div>
      <ol className="rows" key={mode}>
        {rows.map((row, i) => (
          <TowerRow key={row.key} row={row} i={i} />
        ))}
      </ol>
    </aside>
  );
}

function TowerRow({ row, i }) {
  if (row.head) {
    return (
      <li className="row row-head" style={{ "--i": i }}>
        <span className="pos">{row.pos}</span>
        <span className="label">{row.label}</span>
        <span className="val">{row.value}</span>
      </li>
    );
  }
  const cls = ["row", row.now && "is-now", row.dim && "is-dim"].filter(Boolean).join(" ");
  const body = (
    <>
      <span className="pos">{row.pos}</span>
      {row.micro ? (
        <span className="micro" aria-hidden="true">
          {row.micro.map((tone, k) => (
            <i key={k} data-tone={tone} className={row.focus === k ? "is-focus" : undefined} />
          ))}
        </span>
      ) : (
        <span className="chip" data-tone={row.tone} style={row.colour ? { "--team": row.colour } : undefined} aria-hidden="true" />
      )}
      <span className="label">{row.label}</span>
      {row.pair && (
        <span className="pair" aria-hidden="true">
          <b>{row.pair[0]}</b>
          <b>{row.pair[1]}</b>
        </span>
      )}
      <span className={`val${row.valueTone ? ` is-${row.valueTone}` : ""}`}>{row.value}</span>
    </>
  );
  return (
    <li className={cls} style={{ "--i": i }}>
      {row.onClick ? (
        <button type="button" className="row-in" onClick={row.onClick} aria-label={row.aria} aria-current={row.now || undefined}>
          {body}
        </button>
      ) : (
        <div className="row-in">
          {body}
        </div>
      )}
    </li>
  );
}

// Name strap: the repository or person, their language colour, and facts.
export function NameStrap({ name, meta, colour, facts = [], rival = false, flags = [] }) {
  return (
    <div className="strap-group">
      <div className={`namebar${rival ? " is-rival" : ""}`} style={colour ? { "--team": colour } : undefined}>
        <i aria-hidden="true" />
        <b>{name}</b>
        {meta && <span>{meta}</span>}
      </div>
      {(facts.length > 0 || flags.length > 0) && (
        <dl className="facts">
          {flags.map((flag) => (
            <div key={flag} className="flag">
              <dt className="sr-only">Flag</dt>
              <dd>{flag}</dd>
            </div>
          ))}
          {facts.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

// Sector boxes: points per category, like sector times.
export function SectorBoxes({ categories }) {
  return (
    <div className="sectorboxes">
      {categories.map((cat) => {
        const sector = sectorOf(cat.id);
        const lost = cat.earned < cat.possible;
        return (
          <div className={`sb${lost ? " is-lost" : ""}`} key={cat.id}>
            <small>
              {sector.code} · {sector.short}
            </small>
            <b>
              {cat.earned}
              <span>/{cat.possible}</span>
            </b>
            <div className="sb-bar" aria-hidden="true">
              <i style={{ width: `${(cat.earned / cat.possible) * 100}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// The lower third: one check (or habit, or head-to-head) at a time.
export function Third({ title, points, pointsTone, detail, meta, fix, clean, children, className = "" }) {
  return (
    <section className={`third ${className}`}>
      <header className="third-head">
        <h2>{title}</h2>
        {points != null && <span className={`third-pts is-${pointsTone ?? "neutral"}`}>{points}</span>}
      </header>
      {detail && <div className="third-detail">{detail}</div>}
      {meta && <p className="third-meta">{meta}</p>}
      {fix && (
        <p className="third-fix">
          <b>Fix</b>
          <span>{fix}</span>
        </p>
      )}
      {clean && <p className="third-clean">{clean}</p>}
      {children}
    </section>
  );
}

// Drawn, not a glyph, at the mark's stroke weight.
export function Arrow() {
  return (
    <svg className="arrow" viewBox="0 0 12 12" width="11" height="11" aria-hidden="true">
      <path d="M3 9 9 3M4.5 3H9v4.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="square" />
    </svg>
  );
}

export function CopyButton({ text, label = "Copy" }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      setTimeout(() => setDone(false), 1600);
    } catch {
      window.prompt("Copy this:", text);
    }
  };
  return (
    <button type="button" className="copy" onClick={copy}>
      {done ? "Copied" : label}
    </button>
  );
}

// B's contribution: every deduction arrives with something to copy or a link
// that does the job on GitHub.
export function Starter({ start }) {
  return (
    <div className="starter">
      <div className="starter-head">
        <span>
          Starter · <code>{start.file}</code>
        </span>
        {start.lines.length > 0 && <CopyButton text={start.lines.join("\n")} />}
      </div>
      {start.lines.length > 0 && (
        <pre>
          <code>{start.lines.join("\n")}</code>
        </pre>
      )}
      {start.note && <p className="starter-note">{start.note}</p>}
      {start.href && (
        <a className="starter-link" href={start.href} target="_blank" rel="noreferrer">
          {start.action} <Arrow />
        </a>
      )}
    </div>
  );
}

// A README line's bar, as a share of the track's height.
function barHeight(line) {
  if (line.kind === "h") return 1;
  if (line.kind === "i") return 0.84;
  if (line.kind === "c") return 0.3 + line.size * 0.4;
  return 0.18 + line.size * 0.6;
}

// C's README barcode, carried over as asked: one mark per line, taller for
// headings, denser for code, a tick above every line that earned a point, and
// a marker at the line the current check found.
export function TrackMap({ shape, marks = [], current, label }) {
  if (!shape.length) {
    return (
      <figure className="track is-empty" aria-label={label}>
        <figcaption>No README, so no track to run</figcaption>
      </figure>
    );
  }
  const n = shape.length;
  return (
    <figure className="track" aria-label={label}>
      <svg viewBox={`0 0 ${n} 40`} preserveAspectRatio="none" aria-hidden="true">
        {shape.map((line, i) => {
          if (line.kind === "b") return null;
          const h = barHeight(line) * 32;
          return <rect key={i} x={i} y={40 - h} width={0.72} height={h} className={`k-${line.kind}`} />;
        })}
        {marks.map((mark) => (
          <rect key={`${mark.line}-${mark.tone}`} x={mark.line - 1} y={0} width={Math.max(0.9, n / 320)} height={5} className={`tick is-${mark.tone}`} />
        ))}
      </svg>
      {current != null && (
        <span className="track-now" style={{ "--x": (current - 0.5) / n }}>
          L{current}
        </span>
      )}
      <figcaption>README.md · {shape.length} lines</figcaption>
    </figure>
  );
}

// README lines around each piece of evidence, tagged with what they earned.
export function Evidence({ hunks }) {
  if (!hunks.length) return <p className="evidence-none">Nothing in the README earned a check on its own lines.</p>;
  return (
    <div className="evidence">
      {hunks.map((hunk, i) => (
        <div className="hunk" key={hunk.from}>
          {i > 0 && (
            <p className="hunk-gap">
              {hunk.from - hunks[i - 1].to === 2 ? `line ${hunk.from - 1}` : `lines ${hunks[i - 1].to + 1}–${hunk.from - 1}`} skipped
            </p>
          )}
          {hunk.lines.map((line) => (
            <p key={line.n} className={`ln${line.checks.length ? " is-hit" : ""}`}>
              <span className="n">{line.n}</span>
              <code>{line.text || " "}</code>
              {line.checks.length > 0 && (
                <span className="tags">
                  {line.checks.map((c) => (
                    <b key={c.id} data-tone={c.status}>
                      {sectorOf(c.category).code} · {c.label}
                    </b>
                  ))}
                </span>
              )}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}

export function BadgePanel({ name }) {
  const origin = window.location.origin;
  const markdown = `[![GitRep](${origin}/api/badge/${name}.svg)](${origin}/?target=${name})`;
  return (
    <div className="badge-panel">
      <img src={`/api/badge/${name}.svg`} alt={`GitRep badge for ${name}`} width="217" height="28" />
      <div className="snippet">
        <code>{markdown}</code>
        <CopyButton text={markdown} label="Copy markdown" />
      </div>
    </div>
  );
}

// The only white action on the page. "a vs b" compares two repositories.
// It stays white and pressable; an empty submit says what to paste instead.
export function GradeStrap({ initial = "", onGo, label = "Grade", id = "target", placeholder = "owner/repo or username", hint }) {
  const [value, setValue] = useState(initial);
  const [empty, setEmpty] = useState(false);
  const submit = (event) => {
    event.preventDefault();
    if (!value.trim()) {
      setEmpty(true);
      return;
    }
    setEmpty(false);
    onGo(value);
  };
  return (
    <div className="gradestrap-wrap">
      <form className="gradestrap" onSubmit={submit} noValidate>
        <label htmlFor={id}>Repo</label>
        <input
          id={id}
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            if (empty) setEmpty(false);
          }}
          placeholder={placeholder}
          aria-invalid={empty || undefined}
          aria-describedby={empty ? `${id}-error` : undefined}
          spellCheck="false"
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
        />
        <button type="submit">{label}</button>
      </form>
      {empty && (
        <p className="strap-error" id={`${id}-error`} role="alert">
          {hint ?? "Paste a repository or a username first. Put vs between two repositories to compare them."}
        </p>
      )}
    </div>
  );
}

export function Examples({ onGo, items }) {
  return (
    <p className="examples">
      <span>Try</span>
      {items.map((item) => (
        <button key={item} type="button" onClick={() => onGo(item)}>
          {item}
        </button>
      ))}
    </p>
  );
}
