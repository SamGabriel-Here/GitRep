# GitRep Design System

Extracted from the shipped implementation in `frontend/src/`. Tokens live in
`styles/tokens.css`, everything else in `styles/app.css`. This records what exists, not
what might be nice later. Section 0 (Research Log) is greenfield-only and does not apply:
this system was built against an existing product with fixed content and an incumbent UI
treated as anti-reference.

## 1. Atmosphere & identity

GitRep feels like a marked-up assessment handed back to you. It is sober rather than
cheerful, because the product's job is to tell you what is missing from your work and a
design that congratulates you while doing it would be lying.

The signature is the ledger line: a label on the left, a dotted leader running across the
gap, a figure on the right. Everything on the page is built from that one device. The rubric
panel, the graded report, and the running total are the same row at three different
densities. Passing checks sit quiet in plain ink; only deductions take colour. The score is
never presented as a badge or a ring, it arrives last, under a rule, as the total of an
itemised account you have already read.

## 2. Color

Two grounds, one system. Light is the default because a graded document is read on paper.
Values are declared once in `src/styles/tokens.css` under `:root[data-theme="..."]`.

| Role | Token | Light | Dark | Usage |
|---|---|---|---|---|
| Surface/primary | `--paper` | `#e9eae6` | `#14181a` | Page ground |
| Surface/secondary | `--sheet` | `#f4f5f1` | `#1b2023` | Rubric panel, input field |
| Text/primary | `--ink` | `#1c2119` | `#e6e8e3` | Headlines, labels, body |
| Text/secondary | `--ink-soft` | `#4f564c` | `#9aa29b` | Details, figures, group names |
| Text/tertiary | `--ink-faint` | `#646b61` | `#7d857f` | Placeholder, owner prefix, footer |
| Border/default | `--rule` | `#c4c8bf` | `#313839` | Section rules, leaders, panel edge |
| Border/subtle | `--rule-faint` | `#d6d9d1` | `#252b2d` | Row separators, masthead rule |
| Accent/deduction | `--deduct` | `#8c2f23` | `#e2705a` | Points lost, fix blocks, errors |
| Accent/wash | `--deduct-wash` | `rgba(140,47,35,.07)` | `rgba(226,112,90,.11)` | Fix-block and error ground |
| Focus | `--focus` | `#1c2119` | `#e6e8e3` | Focus ring |

### Rules

- There is exactly one accent, and it means "points were taken off". It is never decorative
  and never used for emphasis, branding, or a call to action.
- There is no success green and no warning amber. A passing check is not an achievement to
  celebrate, it is the absence of a problem, so it renders in `--ink-soft` like any other
  data. Traffic-light scoring was rejected deliberately.
- No raw hex outside `styles/tokens.css`. Verified: `app.css` contains none.
- The grounds carry depth on their own (Section 7). No gradient is used anywhere.

## 3. Typography

Two families, sharply divided by job. Loaded from Google Fonts in `frontend/index.html`.

- **Display:** `Fraunces` variable serif, axes `opsz`, `wght`, `SOFT`, `WONK`. Wordmark,
  headline, section heads, and the verdict word.
- **Everything else:** `JetBrains Mono`. Labels, figures, details, input, and body.

Mono for body is a deliberate choice, not a default. The content is short labels, one-line
fixes, and columns of numbers that must align, so tabular figures are load-bearing. Nothing
on this page is long-form prose.

### Scale

| Level | Token | Min → Max | Weight | Usage |
|---|---|---|---|---|
| Display | `--step-3` | 30.4px → 54.4px | 600 | Headline |
| Total | inline `clamp` | 56px → 104px | 700 | The score figure only |
| H2 | `--step-2` | 20.8px → 28px | 600 | Repo name, verdict word |
| H3 | `--step-1` | 15.2px → 17px | 600 | Panel and ledger heads |
| Body | `--step-0` | 14.1px → 15.2px | 400 | Ledger rows, input, labels |
| Caption | `--step--1` | 12.5px → 13.3px | 400 | Details, fixes, facts, footer |

### Rules

- Two families, no third.
- Body never below 14px and captions never below 12px at 375px. Mono reads smaller than a
  sans at the same nominal size, so the floors are enforced at the bottom of each `clamp()`.
- Headings use `text-wrap: balance`.
- The score figure is the only place a size is set outside the scale, because it is a single
  typographic monument rather than a reusable level.

## 4. Spacing & layout

Spacing intent is expressed in `rem` steps at call sites; fluid values stay raw as browser
mechanics, per the tokenize-intent rule.

| Token | Value | Usage |
|---|---|---|
| `--gutter` | `clamp(1.15rem, 4vw, 3rem)` | Page side padding |
| `--measure` | `34rem` | Max line length for prose |
| Shell max width | `68rem` | Content column |

### Grid

- Opening: two columns, `minmax(0, 1.08fr) minmax(0, 0.92fr)`, gap `clamp(2.25rem, 6vw, 4.5rem)`.
  The pitch is wider than the rubric on purpose, so the headline sets the reading order.
- Report and ledger: single column. The ledger row is a flex cluster whose leader absorbs all
  slack, which is what keeps figures flush right at every width.
- Breakpoints: **860px** (opening collapses to one column) and **520px** (input stacks above
  its button). These are content breakpoints, chosen where the layout actually fails, not a
  device ladder.

### Rules

- Everything is left-aligned. Centred text was rejected: documents are read from a left edge,
  and the incumbent design's centred header was one of its generic tells.
- Vertical rhythm between ledger categories is deliberately larger than within them, so the
  four categories read as separate accounts rather than one long list.

## 5. Components

### LedgerRow (`components/LedgerRow.jsx`)

The primitive the whole system is built from. Used by both the rubric panel and the report.

- **Structure:** `.row > .row-label + .leader + .row-points`
- **Props:** `label`, `points`, `tone`, `index`
- **Variants:** `is-pass` (figure in `--ink-soft`), `is-loss` (figure in `--deduct`, bold)
- **Spacing:** leader margin `0 0.5rem`, min width `1.25rem`
- **States:** static; it is data, not a control. No hover or focus.
- **Accessibility:** the leader is `aria-hidden`; label and figure read as plain text in order.
- **Motion:** `draw` on the leader, `land` on the figure, staggered by `--i` (Section 6).
- **Layout:** cluster. Owns no scroll.

### Rubric (`components/Rubric.jsx`)

- **Structure:** `aside.rubric > .rubric-head + .rubric-group*` , each group a label plus Rows
- **Spacing:** panel padding `clamp(1.25rem, 3vw, 1.9rem)`
- **States:** renders only when `GET /rubric/` resolves; absent on failure rather than broken.
- **Accessibility:** `aside` landmark, `h2` head.
- **Layout:** stack inside the opening grid's second column.

### Report (`components/Report.jsx`)

- **Structure:** `main.report > .identity + dl.facts + section.ledger > .category* + .total`
- **States:** `pass` / `partial` / `fail` per entry; `partial` and `fail` render `.entry-fix`.
  Fork and archived repos render `.flag` chips.
- **Accessibility:** `aria-live="polite"` so a screen reader announces a finished grade;
  facts are a real `dl`; the total is text, not an image.
- **Motion:** one orchestrated reveal, keyed on repo name so it replays per grade.
- **Layout:** stack. Owns no scroll; the page scrolls.

### Field (`.field` in `styles/app.css`)

- **Structure:** bordered unit containing `input` + submit `button`, sharing one 3px radius
- **States:** default, `:focus-within` (border to `--ink` plus a 3px `--deduct-wash` ring),
  `:disabled` (55% opacity, `cursor: progress`, spinner replaces the label), error (`.error`
  block below, `role="alert"`)
- **Accessibility:** visually hidden `<label>`; `autoCapitalize`/`autoCorrect`/`spellCheck` off
- **Layout:** row above 520px, stack below.

## 6. Motion & interaction

One orchestrated moment per grade. Nothing else on the page animates on its own.

| Type | Duration | Easing | Usage |
|---|---|---|---|
| Micro | 150ms | default | Colour and border transitions on hover and focus |
| Emphasis | 550ms | `cubic-bezier(0.2, 0.75, 0.2, 1)` | `draw`, the leader scaling from the left |
| Emphasis | 450ms | `ease-out` | `land`, figures and detail lines settling |
| Loop | 700ms | `linear` | `spin`, the submit spinner |

Stagger is `calc(var(--i) * 40ms)` for leaders and `+ 180ms` for figures, with the total at
640ms. `--i` counts continuously across all four categories, so the reveal reads as one pass
down the page rather than four separate ones.

### Rules

- `draw`, `land`, and `spin` animate `transform` and `opacity` only. Transitions touch
  `color`, `border-color`, `box-shadow`, and `opacity`, which are paint-only. No layout
  property is ever animated.
- No entrance animation on scroll, no hover lift on panels, no transition on non-interactive
  elements. Section-by-section fade-ups were rejected as the generic default.
- `prefers-reduced-motion: reduce` collapses every animation and transition to 0.001ms.

## 7. Depth & surface

**Strategy: tonal shift plus hairline borders. No elevation shadows anywhere.**

| Type | Value | Usage |
|---|---|---|
| Panel | `1px solid var(--rule)` on `--sheet` | Rubric panel, input field |
| Section rule | `1px solid var(--rule)` | Category heads, report top |
| Separator | `1px solid var(--rule-faint)` | Row dividers, masthead, footer |
| Total rule | `2px solid var(--ink)` | The single heaviest line on the page |
| Leader | `1px dotted var(--rule)` | The ledger connector |
| Fix marker | `2px solid var(--deduct)` left border on `--deduct-wash` | Actionable fixes |

The only `box-shadow` in the system is the focus ring on `.field`. Radius is 3px on inputs and
panels, 2px on chips and the theme toggle, and 0 everywhere else. Weight, not elevation,
carries hierarchy: the total rule is 2px against every other rule's 1px, which is what makes
the score read as final.

## 8. Accessibility constraints & accepted debt

### Constraints

WCAG 2.2 AA. Measured in-browser against each theme's own ground:

| Token | Light | Dark |
|---|---|---|
| `--ink` | 13.57:1 | 14.48:1 |
| `--ink-soft` | 6.28:1 | 6.82:1 |
| `--ink-faint` | 4.55:1 | 4.71:1 |
| `--deduct` | 6.83:1 | 5.70:1 |

Every token that carries data clears 4.5:1. An earlier `--ink-faint` measured 2.62:1 while
carrying pass figures and fact labels, and was darkened rather than demoted.

Also enforced: 2px `--focus` outline with 3px offset on every focusable element, full keyboard
reachability, `aria-live="polite"` on the report, `role="alert"` on errors, a visually hidden
label on the input, `aria-hidden` on decorative leaders and spinners, `aria-label` on the
theme toggle stating the destination theme, and `prefers-reduced-motion` honoured.

Theme is stamped on `<html>` by an inline script in `index.html` before first paint, so a dark
reader never sees a light flash. It falls back to `prefers-color-scheme` when storage is empty
and to light when storage throws.

### Accepted debt

| Item | Location | Why accepted | Exit |
|---|---|---|---|
| Mono set for all body copy | `styles/tokens.css` | Content is labels, figures, and one-line fixes; tabular alignment matters more than prose comfort. Reviewed at 375px. | Revisit if a long-form surface is ever added |
| Screenshots are captured by hand | `docs/` | A one-off puppeteer-core script drove them; it is not committed | Commit the script if the shots need regular refreshing |
| No visual regression tests | repo | Verified by hand at 375px and desktop in both themes this session | Add Playwright snapshots if the surface grows |
| `.is-revealing` is never removed after play | `components/Report.jsx` | Replay is driven by the React `key`, so the class is inert once animation ends | Only matters if reports start updating in place |
