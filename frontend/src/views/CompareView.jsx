import { useRef, useState } from "react";
import Stage from "../components/Stage";
import { scrollToScreen } from "../lib/scroll";
import { BadgePanel, Bug, GradeStrap, NameStrap, Third, Tower } from "../components/broadcast";
import { useCountUp } from "../hooks/useCountUp";
import { shortName } from "../lib/format";
import { teamColour } from "../lib/rubric";

const PER = 0.55;

function DiffThird({ x, y, a, b }) {
  const [behind, report] = x.earned < y.earned ? [x, a] : [y, b];
  return (
    <Third
      title={x.label}
      points={`${x.earned} – ${y.earned}`}
      pointsTone="neutral"
      detail={
        <dl className="duel">
          <div>
            <dt>{shortName(a.repo.name)}</dt>
            <dd>{x.detail}</dd>
          </div>
          <div>
            <dt>{shortName(b.repo.name)}</dt>
            <dd>{y.detail}</dd>
          </div>
        </dl>
      }
      meta={`Worth ${x.possible} points`}
      fix={behind.fix ? `${shortName(report.repo.name)}: ${behind.fix}` : null}
    />
  );
}

export default function CompareView({ a, b, wide, calm, onGo }) {
  const runRef = useRef(null);
  const nameA = shortName(a.repo.name);
  const nameB = shortName(b.repo.name);
  const diffs = a.checks.map((x, k) => [x, b.checks[k], k]).filter(([x, y]) => x.earned !== y.earned);
  const beats = Math.max(1, diffs.length);
  const DUEL = [1, 1 + beats * PER];
  const CLOSE = [DUEL[1], DUEL[1] + 1];
  const SCREENS = CLOSE[1] + 1;
  const cues = [
    { id: "gap", label: "Gap", at: 0 },
    { id: "duel", label: "Check by check", at: DUEL[0] + 0.05 },
    { id: "badges", label: "Badges", at: CLOSE[0] + 0.5 },
  ];
  const [pos, setPos] = useState({ card: 0, now: -1, cue: "gap" });
  const gap = a.score - b.score;
  const shown = useCountUp(Math.abs(gap), calm);

  const onScroll = (s) => {
    const card = Math.min(beats - 1, Math.max(0, Math.floor((s - DUEL[0]) / PER)));
    const now = s >= DUEL[0] && s < DUEL[1] ? card : -1;
    const cue = s < DUEL[0] - 0.25 ? "gap" : s < CLOSE[0] - 0.1 ? "duel" : "badges";
    setPos((prev) => (prev.card === card && prev.now === now && prev.cue === cue ? prev : { card, now, cue }));
  };

  const ahead = diffs.filter(([x, y]) => x.earned > y.earned).length;
  const behind = diffs.filter(([x, y]) => x.earned < y.earned).length;
  const level = a.checks.length - diffs.length;
  const leader = gap === 0 ? null : gap > 0 ? nameA : nameB;
  const current = pos.now >= 0 ? diffs[pos.now]?.[2] : -1;
  const jump = (k) => {
    const beat = diffs.findIndex(([, , idx]) => idx === k);
    if (beat >= 0 && wide) scrollToScreen(runRef.current, DUEL[0] + (beat + 0.5) * PER, SCREENS);
  };

  const rows = a.checks.map((x, k) => {
    const d = x.earned - b.checks[k].earned;
    return {
      key: x.id,
      pos: k + 1,
      tone: d > 0 ? "ahead" : d < 0 ? "behind" : "level",
      label: x.label,
      pair: [x.earned, b.checks[k].earned],
      value: d > 0 ? `+${d}` : d < 0 ? `−${-d}` : "=",
      valueTone: d > 0 ? "ahead" : d < 0 ? "behind" : undefined,
      now: k === current,
      onClick: d !== 0 && wide ? () => jump(k) : undefined,
      aria: `${x.label}: ${nameA} ${x.earned}, ${nameB} ${b.checks[k].earned}`,
    };
  });

  // The second repository always runs with a dashed stripe, and a check it
  // leads on gets the same dashed chip, so who is ahead reads without colour.
  const straps = (
    <>
      <NameStrap name={`${nameA} · ${a.score}`} meta={a.repo.owner} colour={teamColour(a.repo.language)} />
      <NameStrap name={`${nameB} · ${b.score}`} meta={b.repo.owner} colour={teamColour(b.repo.language)} rival />
    </>
  );
  const summary = (
    <div className="classification">
      <p className="big" aria-label={leader ? `${leader} leads by ${Math.abs(gap)}` : "Level on points"}>
        <span aria-hidden="true">{gap === 0 ? "=" : `+${shown}`}</span>
        <small aria-hidden="true">{leader ?? "level"}</small>
      </p>
      <div className="verdict">
        <b className="band">{leader ? `${leader} ahead` : "dead heat"}</b>
        <p>
          {nameA} is ahead on {ahead} {ahead === 1 ? "check" : "checks"}, behind on {behind}, and level on {level}.
        </p>
      </div>
    </div>
  );
  const closer = (
    <>
      <h2 className="closer">Both badges, side by side.</h2>
      <BadgePanel name={a.repo.name} />
      <BadgePanel name={b.repo.name} />
      <p className="lede">
        Grade{" "}
        <button type="button" className="inline" onClick={() => onGo(a.repo.name)}>
          {nameA}
        </button>{" "}
        or{" "}
        <button type="button" className="inline" onClick={() => onGo(b.repo.name)}>
          {nameB}
        </button>{" "}
        on its own, or start another comparison.
      </p>
      <GradeStrap id="again" onGo={onGo} placeholder="owner/one vs owner/two" hint="Put vs between two repositories to compare them." />
    </>
  );
  const tower = (
    <Tower
      title={`${nameA} vs ${nameB}`}
      figure="Gap"
      rows={rows}
      mode={`${a.repo.name}|${b.repo.name}`}
      className="is-replay is-duel"
      label={`${nameA} against ${nameB}, check by check`}
    />
  );

  if (!wide) {
    return (
      <div className="flow">
        <Bug />
        {straps}
        {summary}
        {tower}
        <section className="flow-section" aria-label="Where they differ">
          {diffs.map(([x, y]) => (
            <DiffThird key={x.id} x={x} y={y} a={a} b={b} />
          ))}
        </section>
        <section className="flow-section">{closer}</section>
      </div>
    );
  }

  const diff = diffs[pos.card];
  return (
    <Stage screens={SCREENS} onScroll={onScroll} runRef={runRef}>
      <Bug cues={cues} current={pos.cue} onCue={(id) => scrollToScreen(runRef.current, cues.find((c) => c.id === id).at, SCREENS)} />
      {tower}
      <div className="ident">{straps}</div>
      <section className="layer result wipe" data-span={`0 ${DUEL[0] + 0.2}`}>
        {summary}
        <p className="hint">Scroll through every check where they differ.</p>
      </section>
      <div className="layer third-slot" data-span={`${DUEL[0]} ${DUEL[1]}`}>
        {diff ? (
          <div key={diff[0].id} className="third-swap">
            <DiffThird x={diff[0]} y={diff[1]} a={a} b={b} />
          </div>
        ) : (
          <Third title="Dead heat" detail={<p>Every check scored the same for both.</p>} />
        )}
      </div>
      <section className="layer badge-layer wipe" data-span={`${CLOSE[0]} ${CLOSE[1]}`}>
        {closer}
      </section>
      <section className="sr-only" aria-label="Check by check">
        <ol>
          {rows.map((row) => (
            <li key={row.key}>{row.aria}</li>
          ))}
        </ol>
      </section>
    </Stage>
  );
}
