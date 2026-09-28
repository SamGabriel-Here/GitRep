import { useLayoutEffect, useMemo, useRef, useState } from "react";
import Stage from "../components/Stage";
import { beatAt, beatMiddle, cueAt, keepSame, scrollToScreen } from "../lib/scroll";
import { BadgePanel, Bug, Evidence, GradeStrap, NameStrap, SectorBoxes, Starter, Third, Tower, TrackMap } from "../components/broadcast";
import { useCountUp } from "../hooks/useCountUp";
import { ago, compact, licence, shortName, verdict } from "../lib/format";
import { TONE, evidenceHunks, readmeShape, sectorOf, sectorRows, starter, teamColour } from "../lib/rubric";

// Screens scrolled at which each part of the report takes over.
const LAP = [1, 6.5];
const README = [6.5, 8.6];
const BADGE = [8.6, 10];
const SCREENS = BADGE[1] + 1;
const CUES = [
  { id: "result", label: "Result", at: 0, from: 0 },
  { id: "lap", label: "Lap", at: LAP[0] + 0.05, from: LAP[0] - 0.25 },
  { id: "readme", label: "README", at: README[0] + 0.4, from: README[0] - 0.1 },
  { id: "badge", label: "Badge", at: BADGE[0] + 0.5, from: BADGE[0] - 0.1 },
];

export function CheckThird({ check, index, report }) {
  const sector = sectorOf(check.category);
  const start = starter(check, report);
  return (
    <Third
      title={check.label}
      points={check.lost ? `−${check.lost} of ${check.possible}` : `${check.earned} of ${check.possible}`}
      pointsTone={check.lost ? "loss" : "full"}
      detail={<p>{check.detail}</p>}
      meta={`${sector.code} · ${sector.label} · check ${index + 1} of ${report.checks.length}`}
      fix={check.fix || null}
      clean={check.fix ? null : "Full marks. Nothing to change."}
    >
      {start && <Starter start={start} />}
    </Third>
  );
}

export function Classification({ figure, band, lines, label, unit = "pts" }) {
  return (
    <div className="classification">
      <p className="big" aria-label={label}>
        <span aria-hidden="true">{figure}</span>
        <small aria-hidden="true">{unit}</small>
      </p>
      <div className="verdict">
        <b className="band">{band}</b>
        {lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </div>
  );
}

export default function RepoView({ report, wide, calm, onGo }) {
  const { repo, checks } = report;
  const name = shortName(repo.name);
  const runRef = useRef(null);
  const [pos, setPos] = useState({ card: 0, now: -1, cue: "result" });
  const shape = useMemo(() => readmeShape(report.readme?.text), [report]);
  // On a phone only the credited lines themselves, so the badge stays within reach.
  const hunks = useMemo(() => evidenceHunks(report.readme?.text, checks, wide ? 2 : 0), [report, checks, wide]);
  const figure = useCountUp(report.score, calm);

  const onScroll = (s) => setPos((prev) => keepSame(prev, { ...beatAt(s, LAP, checks.length), cue: cueAt(CUES, s) }));

  const jumpCheck = (k) => {
    if (wide) scrollToScreen(runRef.current, beatMiddle(LAP, checks.length, k), SCREENS);
    else document.getElementById(`check-${checks[k].id}`)?.scrollIntoView({ behavior: calm ? "auto" : "smooth", block: "start" });
  };

  const rows = sectorRows(checks, (c, k) => ({
    key: c.id,
    pos: k + 1,
    tone: TONE[c.status],
    label: c.label,
    value: c.lost ? `−${c.lost}` : c.earned,
    valueTone: c.lost ? "loss" : undefined,
    now: k === pos.now,
    onClick: () => jumpCheck(k),
    aria: `${c.label}: ${c.earned} of ${c.possible}. Show this check.`,
  }));

  const marks = [];
  const seen = new Set();
  for (const c of checks) {
    for (const mark of c.evidence ?? []) {
      if (mark.line > shape.length) continue;
      const key = `${mark.line}-${c.status}`;
      if (!seen.has(key)) {
        seen.add(key);
        marks.push({ line: mark.line, tone: TONE[c.status] });
      }
    }
  }
  const lineOf = (k) => {
    for (let i = k; i >= 0; i -= 1) {
      const line = checks[i]?.evidence?.[0]?.line;
      if (line) return line;
    }
    return 1;
  };
  const currentLine = pos.now >= 0 ? checks[pos.now].evidence?.[0]?.line ?? null : null;

  const segments = checks.map((c) => ({ id: c.id, tone: TONE[c.status], label: `${c.label}: ${c.earned} of ${c.possible}` }));
  const flags = [repo.is_fork && "fork", repo.is_archived && "archived"].filter(Boolean);
  const facts = [
    ["Stars", compact(repo.stars)],
    ["Forks", compact(repo.forks)],
    ["License", licence(repo)],
    ["README", report.readme?.present ? `${compact(report.readme.words)} words` : "none"],
    ["Pushed", ago(repo.pushed_at)],
  ];
  const lines = [verdict(report), report.score === 100 ? "A perfect lap." : `${100 - report.score} to a perfect lap.`];
  const ledger = (
    <section className="sr-only" aria-label="Full assessment">
      <h2>
        {repo.name}: {report.score} out of 100, {report.band}
      </h2>
      <ol>
        {checks.map((c) => (
          <li key={c.id}>
            {c.label}: {c.earned} of {c.possible}. {c.detail} {c.fix}
          </li>
        ))}
      </ol>
    </section>
  );
  const strap = <NameStrap name={name} meta={`${repo.owner} · ${repo.language ?? "no language"}`} colour={teamColour(repo.language)} facts={facts} flags={flags} />;
  const badge = (
    <>
      <h2 className="closer">Put the result where people look.</h2>
      <BadgePanel name={repo.name} />
      <div className="versus-entry">
        <p>Compare {name} with another repository</p>
        <GradeStrap id="rival" label="Compare" placeholder="owner/repo" hint="Paste the repository to compare it with." onGo={(value) => onGo(`${repo.name} vs ${value}`)} />
      </div>
    </>
  );

  if (!wide) {
    return (
      <div className="flow">
        <Bug segments={segments} onSegment={jumpCheck} />
        {strap}
        <Classification figure={figure} band={report.band} lines={lines} label={`${report.score} points out of 100`} />
        <SectorBoxes categories={report.categories} />
        <TrackMap shape={shape} marks={marks} label={`The README of ${repo.name}, one mark per line`} />
        <Tower title={name} figure={`${report.score} pts`} rows={rows} mode={repo.name} className="is-replay" label={`Checks for ${repo.name}`} />
        <section className="flow-section" aria-label="Every check">
          {checks.map((c, k) => (
            <div id={`check-${c.id}`} key={c.id}>
              <CheckThird check={c} index={k} report={report} />
            </div>
          ))}
        </section>
        <section className="flow-section">
          <h2 className="closer">Where it found the evidence</h2>
          <Evidence hunks={hunks} />
          {report.readme?.truncated && <p className="note">This README runs past 1,500 lines; evidence after that is not shown.</p>}
        </section>
        <section className="flow-section">{badge}</section>
      </div>
    );
  }

  const card = checks[pos.card];
  return (
    <Stage screens={SCREENS} onScroll={onScroll} runRef={runRef}>
      <Footage text={report.readme?.text} line={lineOf(Math.max(0, pos.now))} span={`${LAP[0] - 0.3} ${README[0] + 0.1}`} />
      <Bug
        cues={CUES}
        current={pos.cue}
        onCue={(cue) => scrollToScreen(runRef.current, cue.at, SCREENS)}
        segments={segments}
        now={pos.now}
        onSegment={jumpCheck}
      />
      <Tower title={name} figure={`${report.score} pts`} rows={rows} mode={repo.name} className="is-replay" label={`Checks for ${repo.name}`} />
      <div className="ident">{strap}</div>
      <div className="layer boxes" data-span={`0 ${LAP[0] + 0.2}`}>
        <SectorBoxes categories={report.categories} />
      </div>
      <section className="layer result wipe" data-span={`0 ${LAP[0] + 0.2}`}>
        <Classification figure={figure} band={report.band} lines={lines} label={`${report.score} points out of 100`} />
        <p className="hint">Scroll to run the lap: every check, its evidence and its fix.</p>
      </section>
      <div className="layer third-slot" data-span={`${LAP[0]} ${LAP[1]}`}>
        <div key={card.id} className="third-swap">
          <CheckThird check={card} index={pos.card} report={report} />
        </div>
      </div>
      <ReadmeLayer hunks={hunks} truncated={report.readme?.truncated} span={`${README[0]} ${README[1]}`} />
      <section className="layer badge-layer wipe" data-span={`${BADGE[0]} ${BADGE[1]}`}>
        {badge}
      </section>
      <div className="trackbar">
        <TrackMap shape={shape} marks={marks} current={currentLine} label={`The README of ${repo.name}, one mark per line`} />
      </div>
      {ledger}
    </Stage>
  );
}

// The README behind the graphics, like track footage: dim, drifting to
// whichever line the current check found its evidence on.
function Footage({ text, line, span }) {
  const lines = useMemo(() => (text ?? "").split("\n"), [text]);
  if (!text) return null;
  return (
    <div className="layer footage" data-span={span} aria-hidden="true">
      <div className="footage-track" style={{ "--line": line - 1 }}>
        {lines.map((l, i) => (
          <span key={i} className="fl" data-n={i + 1}>
            {l || " "}
          </span>
        ))}
      </div>
    </div>
  );
}

// The evidence hunks, scrolled by the stage as the reader scrolls.
function ReadmeLayer({ hunks, truncated, span }) {
  const track = useRef(null);
  const [travel, setTravel] = useState(0);

  useLayoutEffect(() => {
    const measure = () => {
      const el = track.current;
      if (el) setTravel(Math.max(0, el.scrollHeight - el.parentElement.clientHeight));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [hunks]);

  return (
    <section className="layer readme-layer wipe" data-span={span}>
      <header>
        <h2 className="closer">Where it found the evidence</h2>
        <p>
          Every README line GitRep credited, tagged with the check it earned. Everything else is skipped.
          {truncated && " This README runs past 1,500 lines; evidence after that is not shown."}
        </p>
      </header>
      <div className="evidence-window">
        <div className="evidence-track" ref={track} style={{ "--travel": `${travel}px` }}>
          <Evidence hunks={hunks} />
        </div>
      </div>
    </section>
  );
}
