import { useRef, useState } from "react";
import Stage from "../components/Stage";
import { scrollToScreen } from "../lib/scroll";
import { Bug, GradeStrap, NameStrap, Third, Tower } from "../components/broadcast";
import { useCountUp } from "../hooks/useCountUp";
import { shortName } from "../lib/format";
import { TONE } from "../lib/rubric";
import { Classification } from "./RepoView";

const PER = 0.55;

function where(repos, index) {
  const names = repos.filter((r) => r.checks[index]?.status !== "pass").map((r) => shortName(r.name));
  if (!names.length) return "Full marks in every repository.";
  const shown = names.slice(0, 6).join(", ");
  return `Short in ${shown}${names.length > 6 ? `, and ${names.length - 6} more` : ""}.`;
}

function HabitThird({ habit, report, index }) {
  const each = Math.round(habit.possible / report.analysed);
  return (
    <Third
      title={habit.label}
      points={`−${habit.lost}`}
      pointsTone="loss"
      detail={
        <>
          <p>{habit.detail}</p>
          <p className="where">{where(report.repos, index)}</p>
        </>
      }
      meta={`Worth ${each} in each repository · ${habit.passing} of ${report.analysed} have full marks`}
      fix={habit.fix || null}
    />
  );
}

export default function ProfileView({ report, wide, calm, onGo }) {
  const { owner } = report;
  const runRef = useRef(null);
  const habits = report.habits.filter((h) => h.lost > 0);
  const order = report.repos[0]?.checks.map((c) => c.id) ?? [];
  const beats = Math.max(1, habits.length);
  const HABITS = [1, 1 + beats * PER];
  const CLOSE = [HABITS[1], HABITS[1] + 1];
  const SCREENS = CLOSE[1] + 1;
  const cues = [
    { id: "standings", label: "Standings", at: 0 },
    { id: "habits", label: "Habits", at: HABITS[0] + 0.05 },
    { id: "next", label: "Next", at: CLOSE[0] + 0.5 },
  ];
  const [pos, setPos] = useState({ card: 0, now: -1, cue: "standings" });
  const average = useCountUp(report.average, calm);

  const onScroll = (s) => {
    const card = Math.min(beats - 1, Math.max(0, Math.floor((s - HABITS[0]) / PER)));
    const now = s >= HABITS[0] && s < HABITS[1] ? card : -1;
    const cue = s < HABITS[0] - 0.25 ? "standings" : s < CLOSE[0] - 0.1 ? "habits" : "next";
    setPos((prev) => (prev.card === card && prev.now === now && prev.cue === cue ? prev : { card, now, cue }));
  };

  // During a habit's beat, every repository shows that one check, and the
  // ones that already pass it step back.
  const focus = pos.now >= 0 && habits[pos.now] ? order.indexOf(habits[pos.now].id) : -1;
  const rows = report.repos.map((r, i) => ({
    key: r.name,
    pos: i + 1,
    micro: r.checks.map((c) => TONE[c.status]),
    focus,
    dim: focus >= 0 && r.checks[focus]?.status === "pass",
    label: shortName(r.name),
    value: r.score,
    onClick: () => onGo(r.name),
    aria: `${r.name}: ${r.score} out of 100. Grade it on its own.`,
  }));

  const facts = [
    ["Public", report.total_public],
    ["Graded", report.analysed],
    ["Forks skipped", report.skipped_forks],
    ["Best", report.best],
    ["Median", report.median],
    ["Worst", report.worst],
  ];
  const strap = <NameStrap name={owner.login} meta={owner.name && owner.name !== owner.login ? owner.name : null} facts={facts} />;
  const top = habits[0];
  const lines = [
    `Average across ${report.analysed} repositories, most recently pushed first, forks left out.`,
    top ? `${top.label} costs the most: ${top.lost} points across the profile.` : "No habit costs a single point.",
  ];
  const notes =
    report.degraded > 0 ? (
      <p className="note">
        {report.degraded} {report.degraded === 1 ? "repository" : "repositories"} could not be read in full, so{" "}
        {report.degraded === 1 ? "its score is" : "their scores are"} lower than the truth. Try again in a moment.
      </p>
    ) : null;
  const closer = (
    <>
      <h2 className="closer">Grade one on its own.</h2>
      <p className="lede">Pick any repository in the standings, or paste another profile or repository.</p>
      <GradeStrap id="next" onGo={onGo} />
    </>
  );

  if (report.analysed === 0) {
    return (
      <div className="flow">
        <Bug />
        {strap}
        <p className="note">Nothing to grade. {owner.login} has no public repositories of their own, only forks.</p>
        {closer}
      </div>
    );
  }

  const tower = (
    <Tower
      title={owner.login}
      figure={`avg ${report.average}`}
      rows={rows}
      mode={owner.login}
      className={`is-replay${rows.length > 14 ? " is-long" : ""}`}
      label={`Repositories of ${owner.login}, best first`}
    />
  );

  if (!wide) {
    return (
      <div className="flow">
        <Bug />
        {strap}
        <Classification figure={average} band={report.band} lines={lines} unit="avg" label={`Average ${report.average} out of 100`} />
        {notes}
        {tower}
        <section className="flow-section" aria-label="Where the points go">
          <h2 className="closer">Where the points go</h2>
          {habits.map((h) => (
            <HabitThird key={h.id} habit={h} report={report} index={order.indexOf(h.id)} />
          ))}
        </section>
        <section className="flow-section">{closer}</section>
      </div>
    );
  }

  const habit = habits[pos.card];
  return (
    <Stage screens={SCREENS} onScroll={onScroll} runRef={runRef}>
      <Bug cues={cues} current={pos.cue} onCue={(id) => scrollToScreen(runRef.current, cues.find((c) => c.id === id).at, SCREENS)} />
      {tower}
      <div className="ident">{strap}</div>
      <section className="layer result wipe" data-span={`0 ${HABITS[0] + 0.2}`}>
        <Classification figure={average} band={report.band} lines={lines} unit="avg" label={`Average ${report.average} out of 100`} />
        {notes}
        <p className="hint">Scroll through the habits costing the most points. Pick a repository to grade it alone.</p>
      </section>
      <div className="layer third-slot" data-span={`${HABITS[0]} ${HABITS[1]}`}>
        {habit ? (
          <div key={habit.id} className="third-swap">
            <HabitThird habit={habit} report={report} index={order.indexOf(habit.id)} />
          </div>
        ) : (
          <Third title="A clean sweep" detail={<p>Every repository earned every point. Nothing to fix.</p>} />
        )}
      </div>
      <section className="layer badge-layer wipe" data-span={`${CLOSE[0]} ${CLOSE[1]}`}>
        {closer}
      </section>
      <section className="sr-only" aria-label="Where the points go">
        <h2>
          {owner.login}: average {report.average}, {report.band}
        </h2>
        <ol>
          {habits.map((h) => (
            <li key={h.id}>
              {h.label}: {h.lost} points lost. {h.detail} {h.fix}
            </li>
          ))}
        </ol>
      </section>
    </Stage>
  );
}
