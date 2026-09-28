// Run with `npm test` (Node's built-in runner, no dependencies).
import assert from "node:assert/strict";
import { test } from "node:test";
import { routeFor } from "./api.js";
import { evidenceHunks, readmeShape, sectorRows, starter } from "./rubric.js";
import { beatAt, beatMiddle, cueAt } from "./scroll.js";

test("a vs b compares, anything else is one target", () => {
  assert.deepEqual(routeFor("karpathy/nanoGPT vs karpathy/minGPT"), { kind: "compare", a: "karpathy/nanoGPT", b: "karpathy/minGPT" });
  assert.deepEqual(routeFor("a/b VS. c/d"), { kind: "compare", a: "a/b", b: "c/d" });
  assert.deepEqual(routeFor("  facebook/react "), { kind: "target", target: "facebook/react" });
  assert.equal(routeFor("   "), null);
});

test("evidence merges nearby lines into one hunk and tags each line once", () => {
  const text = Array.from({ length: 30 }, (_, i) => `line ${i + 1}`).join("\n");
  const checks = [
    { id: "install", evidence: [{ line: 5 }, { line: 7 }] },
    { id: "usage", evidence: [{ line: 7 }, { line: 25 }] },
  ];
  const hunks = evidenceHunks(text, checks);
  assert.deepEqual(hunks.map((h) => [h.from, h.to]), [[3, 9], [23, 27]]);
  const seven = hunks[0].lines.find((l) => l.n === 7);
  assert.deepEqual(seven.checks.map((c) => c.id), ["install", "usage"]);
  assert.equal(seven.text, "line 7");
});

test("the track map knows code from prose, even inside a fence", () => {
  const kinds = readmeShape("# Title\n\nSome words\n```\n# not a heading\n```\n![shot](a.png)").map((l) => l.kind);
  assert.deepEqual(kinds, ["h", "b", "p", "c", "c", "c", "i"]);
});

test("a starter only exists for a deduction, and CI opens GitHub's editor prefilled", () => {
  const report = { repo: { name: "o/r", url: "https://github.com/o/r", language: "Python", default_branch: "main" } };
  assert.equal(starter({ id: "signals", lost: 0 }, report), null);
  const ci = starter({ id: "signals", lost: 7 }, report);
  assert.equal(ci.file, ".github/workflows/ci.yml");
  assert.ok(ci.lines.includes("      - run: pytest"));
  assert.ok(ci.href.startsWith("https://github.com/o/r/new/main?filename=.github/workflows/ci.yml&value="));
});

test("evidence past the README's 1,500-line cap is skipped, not shown blank", () => {
  const text = "a\nb\nc";
  const hunks = evidenceHunks(text, [{ id: "install", evidence: [{ line: 2 }, { line: 1800 }] }]);
  assert.deepEqual(hunks.map((h) => [h.from, h.to]), [[1, 3]]);
});

test("the license starter opens GitHub's new-file page, which offers the templates", () => {
  const report = { repo: { name: "o/r", url: "https://github.com/o/r", language: "Go", default_branch: "trunk" } };
  const start = starter({ id: "license", lost: 8 }, report);
  assert.equal(start.href, "https://github.com/o/r/new/trunk?filename=LICENSE");
});

test("a span splits into beats; outside it the card holds but nothing is now", () => {
  assert.deepEqual(beatAt(0.2, [1, 6.5], 11), { card: 0, now: -1 });
  assert.deepEqual(beatAt(1.74, [1, 6.5], 11), { card: 1, now: 1 });
  assert.deepEqual(beatAt(7, [1, 6.5], 11), { card: 10, now: -1 });
  assert.equal(beatMiddle([1, 6.5], 11, 1), 1.75);
});

test("a cue lights from its own point onward", () => {
  const cues = [{ id: "a", from: 0 }, { id: "b", from: 0.75 }, { id: "c", from: 6.4 }];
  assert.deepEqual([0, 0.74, 0.75, 6.5].map((s) => cueAt(cues, s)), ["a", "a", "b", "c"]);
});

test("the tower heads each sector with its points and keeps each check's place", () => {
  const checks = [{ id: "a", category: "trust", possible: 5 }, { id: "b", category: "documentation", possible: 8 }, { id: "c", category: "trust", possible: 2 }];
  const rows = sectorRows(checks, (c, k) => ({ key: c.id, pos: k + 1 }));
  assert.deepEqual(rows.map((r) => [r.key, r.head ? r.value : r.pos]), [["documentation", 8], ["b", 2], ["trust", 7], ["a", 1], ["c", 3]]);
});
