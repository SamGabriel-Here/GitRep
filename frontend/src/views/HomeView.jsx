import { useRef, useState } from "react";
import Stage from "../components/Stage";
import { beatAt, beatMiddle, cueAt, keepSame, scrollToScreen } from "../lib/scroll";
import { Bug, Examples, GradeStrap, Third, Tower } from "../components/broadcast";
import { CRITERIA, SECTORS, SECTOR_WHY, sectorRows } from "../lib/rubric";

const EXAMPLES = ["karpathy/nanoGPT", "facebook/react", "SamGabriel-Here", "karpathy/nanoGPT vs karpathy/minGPT"];
const PER = 0.9;
const RUBRIC = [0.9, 0.9 + SECTORS.length * PER];
const CLOSE = [RUBRIC[1], RUBRIC[1] + 0.8];
const SCREENS = CLOSE[1] + 1;
const CUES = [
  { id: "grade", label: "Grade", at: 0, from: 0 },
  { id: "rubric", label: "How it's timed", at: RUBRIC[0] + 0.1, from: RUBRIC[0] - 0.3 },
];

// The rubric as an unlit tower: every check, every point on offer.
function rubricRows(checks, lit) {
  return sectorRows(checks, (c, k) => ({
    key: c.id,
    pos: k + 1,
    tone: lit === c.category ? "lit" : "unlit",
    dim: lit != null && lit !== c.category,
    label: c.label,
    value: c.possible,
  }));
}

function SectorThird({ sector, checks }) {
  const members = checks.filter((c) => c.category === sector.id);
  return (
    <Third title={`${sector.code} · ${sector.label}`} points={`${members.reduce((sum, c) => sum + c.possible, 0)} pts`} detail={<p>{SECTOR_WHY[sector.id]}</p>}>
      <ul className="criteria">
        {members.map((c) => (
          <li key={c.id}>
            <b>{c.label}</b>
            <span>{c.possible}</span>
            <p>Full marks: {CRITERIA[c.id]}</p>
          </li>
        ))}
      </ul>
    </Third>
  );
}

function Pitch({ onGo }) {
  return (
    <>
      <h1 className="headline">Every point, accounted for.</h1>
      <p className="standfirst">
        Paste a public repository, a username, or two repositories with “vs” between them. GitRep runs eleven checks worth 100 points and shows where every point went, with
        the fix for each one it took.
      </p>
      <GradeStrap onGo={onGo} />
      <Examples onGo={onGo} items={EXAMPLES} />
    </>
  );
}

export default function HomeView({ rubric, wide, onGo }) {
  const runRef = useRef(null);
  const [pos, setPos] = useState({ sector: -1, cue: "grade" });
  const checks = rubric?.checks ?? [];

  const onScroll = (s) => setPos((prev) => keepSame(prev, { sector: beatAt(s, RUBRIC, SECTORS.length).now, cue: cueAt(CUES, s) }));

  const lit = pos.sector >= 0 ? SECTORS[pos.sector].id : null;
  // The eleven sectors at rest in the top bar; a click jumps to that sector's beat.
  const segments = checks.map((c) => ({ id: c.id, tone: lit === c.category ? "lit" : "unlit", label: `${c.label}, worth ${c.possible}` }));
  const toSector = (i) => {
    const k = SECTORS.findIndex((s) => s.id === checks[i]?.category);
    if (k >= 0) scrollToScreen(runRef.current, beatMiddle(RUBRIC, SECTORS.length, k), SCREENS);
  };
  const tower = checks.length ? (
    <Tower title="The lap" figure={`${rubric.total} pts`} rows={rubricRows(checks, lit)} mode="rubric" className="is-rest" label="What GitRep grades" />
  ) : null;

  if (!wide) {
    return (
      <div className="flow">
        <Bug segments={segments} />
        <section className="flow-hero">
          <Pitch onGo={onGo} />
        </section>
        {tower}
        {checks.length > 0 && (
          <section className="flow-section" aria-label="How the lap is timed">
            {SECTORS.map((sector) => (
              <SectorThird key={sector.id} sector={sector} checks={checks} />
            ))}
          </section>
        )}
      </div>
    );
  }

  return (
    <Stage screens={SCREENS} onScroll={onScroll} runRef={runRef}>
      <Bug
        cues={CUES}
        current={pos.cue}
        onCue={(cue) => scrollToScreen(runRef.current, cue.at, SCREENS)}
        segments={segments}
        onSegment={toSector}
      />
      {tower}
      <section className="layer home wipe" data-span={`0 ${RUBRIC[0] + 0.1}`}>
        <Pitch onGo={onGo} />
        <p className="hint">Scroll to see how the lap is timed</p>
      </section>
      <div className="layer third-slot is-high" data-span={`${RUBRIC[0]} ${RUBRIC[1]}`}>
        {checks.length > 0 && (
          <div key={pos.sector} className="third-swap">
            <SectorThird sector={SECTORS[Math.max(0, pos.sector)]} checks={checks} />
          </div>
        )}
      </div>
      <section className="layer home is-close wipe" data-span={`${CLOSE[0]} ${CLOSE[1]}`}>
        <h2 className="closer">Paste one. Watch it run.</h2>
        <GradeStrap onGo={onGo} id="target-again" />
        <Examples onGo={onGo} items={EXAMPLES} />
      </section>
    </Stage>
  );
}

// While GitHub is being read: the tower at rest, a sweep running the sectors.
export function OnTrack({ route, rubric }) {
  const what = route.kind === "compare" ? `${route.a} and ${route.b}` : route.target;
  const profile = route.kind === "target" && !route.target.includes("/");
  return (
    <div className="waiting" aria-busy="true">
      <Bug still segments={(rubric?.checks ?? []).map((c) => ({ id: c.id, tone: "unlit", label: c.label }))} />
      <div className="waiting-body" role="status">
        <h1 className="headline is-small">Grading {what}</h1>
        <p className="waiting-tag">On track</p>
        <p className="standfirst">
          {profile
            ? "Reading up to twenty of their most recently pushed repositories. A big profile takes a few seconds."
            : "Reading the README, the repository root and its workflows."}
        </p>
      </div>
    </div>
  );
}

// When a grade fails: say what happened and hand the input straight back.
export function RaceControl({ message, route, onGo }) {
  const initial = route.kind === "compare" ? `${route.a} vs ${route.b}` : route.target;
  return (
    <div className="flow race-control">
      <Bug still />
      <section className="flow-hero" role="alert">
        <h1 className="headline is-small">{message}</h1>
        <p className="waiting-tag is-flag">Race control</p>
        <GradeStrap onGo={onGo} initial={initial} label="Try again" />
        <p className="lede">
          <a href="/">Back to the start</a>
        </p>
      </section>
    </div>
  );
}
