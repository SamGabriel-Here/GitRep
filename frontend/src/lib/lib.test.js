// Run with `npm test` (Node's built-in runner, no dependencies).
import assert from "node:assert/strict";
import { test } from "node:test";
import { routeFor } from "./api.js";
import { evidenceHunks, readmeShape, starter } from "./rubric.js";

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
