---
name: GitRep
description: A repository's grade as a lap under live timing; every point lost is a lower third with its evidence and its fix.
colors:
  broadcast-black: "#0b0c0f"
  panel-glass: "rgba(17, 18, 23, 0.92)"
  panel-solid: "#111217"
  hairline: "#262830"
  hairline-strong: "#3a3d46"
  ink: "#f2f2ee"
  ink-2: "#a9acb4"
  ink-3: "#868a94"
  slab: "#f2f2ee"
  slab-ink: "#0b0c0f"
  full-marks-purple: "#7a3cf0"
  points-lost-yellow: "#ffcf1a"
  points-lost-ink: "#6b4600"
  on-yellow-ink: "#161200"
  unlit: "#30333b"
  nothing-earned-edge: "#5a5e69"
  team-default: "#868a94"
typography:
  display:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "clamp(110px, 14vw, 210px)"
    fontWeight: 800
    lineHeight: 0.8
    letterSpacing: "-0.05em"
    fontVariation: "'wdth' 85"
    fontFeature: "'tnum'"
  headline:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "clamp(54px, 6.8vw, 112px)"
    fontWeight: 800
    lineHeight: 0.9
    letterSpacing: "-0.035em"
    fontVariation: "'wdth' 85"
  closer:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "clamp(40px, 4.6vw, 72px)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.03em"
    fontVariation: "'wdth' 85"
  title:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "34px"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "-0.025em"
    fontVariation: "'wdth' 85"
  strap:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 85"
  band:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 800
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 85"
  row:
    fontFamily: "Saira, Arial Narrow, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    letterSpacing: "0.03em"
    fontVariation: "'wdth' 84"
    fontFeature: "'tnum'"
  body:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Saira, Arial Narrow, system-ui, sans-serif"
    fontSize: "12.5px"
    fontWeight: 600
    letterSpacing: "0.08em"
    fontVariation: "'wdth' 84"
  mono:
    fontFamily: "Red Hat Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  none: "0px"
spacing:
  hairline-gap: "1px"
  seam: "2px"
  strap-gap: "6px"
  inset: "18px"
  edge: "28px"
  tower-width: "372px"
  tower-width-mid: "320px"
components:
  button-primary:
    backgroundColor: "{colors.slab}"
    textColor: "{colors.slab-ink}"
    rounded: "{rounded.none}"
    padding: "0 24px"
  button-primary-hover:
    backgroundColor: "#ffffff"
    textColor: "{colors.slab-ink}"
  button-copy:
    backgroundColor: "{colors.slab}"
    textColor: "{colors.slab-ink}"
    rounded: "{rounded.none}"
    padding: "6px 12px 5px"
  input-gradestrap:
    backgroundColor: "{colors.panel-glass}"
    textColor: "{colors.ink}"
    typography: "{typography.mono}"
    rounded: "{rounded.none}"
    padding: "16px"
  input-gradestrap-label:
    backgroundColor: "{colors.unlit}"
    textColor: "{colors.ink}"
    padding: "0 14px"
  cue:
    backgroundColor: "transparent"
    textColor: "{colors.ink-3}"
    padding: "8px 12px 7px"
  cue-current:
    backgroundColor: "{colors.slab}"
    textColor: "{colors.slab-ink}"
  tower-head:
    backgroundColor: "{colors.slab}"
    textColor: "{colors.slab-ink}"
    padding: "11px 14px 9px"
  tower-row:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.row}"
    height: "36px"
  tower-row-current:
    backgroundColor: "{colors.slab}"
    textColor: "{colors.slab-ink}"
  lower-third:
    backgroundColor: "{colors.panel-glass}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    width: "760px"
  lower-third-fix:
    backgroundColor: "{colors.points-lost-yellow}"
    textColor: "{colors.on-yellow-ink}"
    padding: "12px 18px"
  lower-third-clean:
    backgroundColor: "{colors.full-marks-purple}"
    textColor: "#ffffff"
    padding: "10px 18px"
  band-slab:
    backgroundColor: "{colors.slab}"
    textColor: "{colors.slab-ink}"
    typography: "{typography.band}"
    padding: "7px 14px"
  error-inline:
    backgroundColor: "{colors.points-lost-yellow}"
    textColor: "{colors.on-yellow-ink}"
    padding: "8px 12px"
---

# Design System: GitRep

## Overview

**Creative North Star: "Live Timing"**

A repository's grade is a lap under live timing, drawn as a broadcast graphics package over black. One persistent timing tower (the rubric's eleven checks as rows) is reused by every view: home shows it at rest and unlit, a repo report lights it sector by sector, a profile turns it into habits, a comparison turns it into a head-to-head. Around it sit the other pieces a broadcast reuses all weekend: a top strip ("the bug") with view cues and eleven mini-sectors, white name straps, sector boxes, a final-classification score, and a lower third for each deduction carrying the copyable fix.

The package is dense, hard-edged and condensed, and it speaks in three voices. What the broadcast says (headlines, closers, the score, check names, repository names, verdicts, sentences) is Bricolage Grotesque in sentence case, heavy and slightly narrowed, tracked tight. What the graphics label (tower, cues, keys, tags, buttons) is uppercase Saira pulled narrow on its width axis. Everything is set in slabs and hairline-gridded panels with no radius and no shadow. Colour is not decoration; it is the timing state. Purple means a clean sector, yellow means points lost, an unlit grey segment means not run, and an outline means nothing earned. Monospace appears only where the README itself is quoted or a fix is handed over.

The build rejects the category default of score ring, card grid and traffic-light colours. There is no green anywhere; a gain colour was tried in the comparison and removed as a traffic-light regression.

**Key Characteristics:**
- One dark ground, dark only; no light theme.
- White slabs mark exactly two things: what you can press, and what the graphic is naming.
- Three sector states (purple, yellow, outline) plus unlit, never on a control.
- Sentence-case Bricolage Grotesque for what is said; condensed uppercase Saira for what the graphics label; Red Hat Mono for README text, inputs and fixes.
- Zero radius, zero shadow, 1px hairlines; clip-path wipes for entrances.
- A pinned scroll stage on wide screens; the same pieces stacked on narrow ones.

## Colors

A black broadcast ground with near-white slabs and a two-colour timing code, purple and yellow, that belongs to the data alone.

### Primary
- **Full Marks Purple** (full-marks-purple): a sector that earned every point. Tower chips, sector segments, sector-box bars, the README barcode ticks, evidence tags, the clean-sector strip under a lower third, and the badge's pass squares. Text on it is pure white.

### Secondary
- **Points-Lost Yellow** (points-lost-yellow): a sector that lost points. Tower chips and values, sector segments, the fix strip under a lower third, the points chip, the partial evidence tag, fact flags and the inline form error. Text set on it uses the near-black On-Yellow Ink (on-yellow-ink). Where a loss value sits on a white slab (the current tower row) it switches to Points-Lost Ink (points-lost-ink) for contrast.
- The README badge, drawn server-side on a white ground, uses a deeper amber (#d99a00) for its partial squares because the screen yellow disappears on white. It is a badge-only adaptation, not a screen token.

### Neutral
- **Broadcast Black** (broadcast-black): the page ground, theme colour and scrollbar track.
- **Panel Glass** (panel-glass) and **Panel Solid** (panel-solid): the tower, straps, lower thirds and snippet panels float on the translucent panel; cells inside hairline grids (facts, sector boxes, starters) use the solid one.
- **Hairline** (hairline) and **Hairline Strong** (hairline-strong): 1px panel borders, row dividers and the 1px gaps of hairline grids; the strong one outlines the input strap and underlines example links.
- **Ink** (ink), **Ink 2** (ink-2), **Ink 3** (ink-3): primary text, supporting prose, and metadata/positions/placeholders. Ink 3 clears 4.5:1 on the panel and is the floor for any readable text.
- **Slab** (slab) and **Slab Ink** (slab-ink): the white strap and its black text. Hover on a slab button lifts it to pure white.
- **Unlit** (unlit): a segment or chip not yet run; also the fill behind the input strap's label.
- **Nothing-Earned Edge** (nothing-earned-edge): the 1px inset outline for a zero sector.
- **Team** (team-default): a repository's GitHub language colour, set inline on the name strap's side bar and on profile chips; the grey is the fallback for unknown languages.

### Named Rules
**The State-Not-Style Rule.** Purple, yellow, outline and unlit are the lap's four states and nothing else. They never colour a button, link, heading or border. If a colour is not reporting a sector's result, it is ink or slab.

**The No-Green Rule.** There is no green, and no red. Comparison leads are shown by pattern (solid versus dashed white), not by a win colour.

**The Zero-Is-Hollow Rule.** A sector that earned nothing is an outline (1px inset of nothing-earned-edge), never a fill. Only "not run yet" is a solid grey.

## Typography

**Display Font:** Bricolage Grotesque (variable: optical size 12-96 automatic, width 75-100, weight 400-800), with system-ui
**Body Font:** Bricolage Grotesque at normal width, 16px/1.5 base
**Label Font:** Saira (variable: width 75-90, weight 500-800), with Arial Narrow, system-ui
**Mono Font:** Red Hat Mono (400, 500), with ui-monospace, SFMono-Regular, Menlo

**Character:** Three voices with separate jobs. Bricolage carries everything that is said, in sentence case: at 800 weight and 85% width with negative tracking it makes a dense, quirky display voice, and its optical sizing lets the same family read as plain text at 16-17px. Saira is the broadcast's label-and-figure voice, always condensed capitals on its width axis. The mono is the README's own voice: whatever the visitor typed or will paste back.

### Hierarchy
- **Display** (Bricolage 800, clamp(110px, 14vw, 210px), 0.8, width 85%, -0.05em, tabular): the final-classification score only. It deliberately exceeds 6rem; it is the graphic, not a heading. Its unit ("pts", "avg", or the leader in a comparison) is Saira capitals at 0.2em in Ink 2, held off the numeral (0.05em after the figure, 0.3em before the unit) so a wide digit never touches it. 100-170px under 1240px, 96-170px stacked.
- **Headline** (Bricolage 800, clamp(54px, 6.8vw, 112px), 0.9, width 85%, -0.035em, max 11ch, balanced, sentence case): the home headline. A small variant (clamp(32px, 3.8vw, 58px), 0.92, max 24ch) carries loading and error states. clamp(46px, 13vw, 88px) stacked.
- **Closer** (Bricolage 800, clamp(40px, 4.6vw, 72px), 0.95, width 85%, -0.03em, max 16ch): the badge and next-step closers. clamp(34px, 10vw, 56px) stacked.
- **Title** (Bricolage 800, 34px, 1.02, width 85%, -0.025em): a lower third's check name in sentence case; 28px on short or narrow screens.
- **Strap** (Bricolage 800, 28px, 1, width 85%, -0.02em): the repository name on the name strap, in its real casing; 24px under 1240px, 26px stacked.
- **Band** (Bricolage 800, 24px, width 85%, -0.01em): the verdict band under the score; its first letter is capitalised, the rest stays as written.
- **Body** (Bricolage 400, 17px, 1.5): standfirsts, ledes and verdicts, capped at 42-60ch. Lower-third detail and the fix instruction run at 16px, criteria and notes at 15px.
- **Row** (Saira 600, 14px, 0.03em, width 84%, tabular, uppercase): tower rows; 13px on long towers.
- **Label** (Saira 600-800, 11-13px, 0.03-0.1em, width 75-88%, uppercase): tower head, cues, wordmark, meta lines, fact keys and values, sector-box labels and figures, tags, starter heads and links, button text, fix and clean labels, hints, figcaptions and the barcode needle.
- **Mono** (400, 13-16px, 1.6): input text (16px), example repos, starter code, the badge snippet, evidence lines (14px, 1.75) and the footage.

### Named Rules
**The Said-Versus-Labelled Rule.** Anything the broadcast says, a sentence or a name, is Bricolage in sentence case with its real casing. Anything the graphics label is Saira capitals. A display line is never uppercased, and a sentence is never set in Saira.

**The Capitals-In-The-Tower Rule.** The tower head and tower rows stay in capitals, repository names included, as broadcast timing towers do. Everywhere else (straps, titles, sentences) a repository name keeps its real casing.

**The Narrow-By-Axis Rule.** Condensation comes from the width axis, never from a fourth family: Saira labels run at font-stretch 75-88% with open tracking (0.03-0.1em); Bricolage display runs at 85% with tight negative tracking (-0.01 to -0.05em). Saira is never tracked negative; Bricolage is never tracked open.

**The Tabular Figures Rule.** Every number that can change or be compared (score, tower values, pairs, sector boxes, facts, points chips) uses tabular figures so columns hold still during a replay.

**The README-Voice Rule.** Mono is reserved for README content, typed input and copyable fixes. UI chrome never goes mono.

## Layout

Wide screens (1000px and up) run a **pinned stage**: a sticky 100vh viewport the page scrolls through. The stage writes scroll progress to each layer as in/out/t values, and layers fade and wipe from that. Geometry is fixed to the edges: a 28px edge margin; the tower pinned top-left at 84px from the top, 372px wide (320px under 1240px); content starts at twice the edge plus the tower width; straps and sector boxes anchor top-right; the lower third anchors 108px from the bottom, up to 760px wide; the README barcode runs along the bottom edge.

The first viewport puts the tower at rest (unlit rubric) on the left, the huge headline bottom-anchored on the right with the input strap under it as the only white action, and the sector strip at the top right.

Below 1000px the same components restack into a single **flow** column (max 760px, 16px gutters, 18px gap) with a sticky bug; tower and straps become in-flow, sector boxes go 2-up, type scales down. Between 1000px and 1240px the result block (score and band) drops to calc(50% + 70px) from the top so it clears the sector boxes. A max-height of 800px tightens rows to 32px and trims the lower third.

Spacing is tight and structural: 1px hairline gaps inside grids, 2px seams between segments and cues, 6px between stacked straps and at sector breaks, 14-18px panel insets.

**Footage.** The README text scrolls behind the graphics at 7% ink in mono, masked to the band between the straps and the lower third and faded at the right, so it never runs under a figure or sentence being read. It is absent in the result phase.

### Named Rules
**The One-Tower Rule.** Every view reuses the same tower. New views change its rows, title and figure, never its position or form.

**The Clear-Band Rule.** Background footage stays inside its masked band. Nothing decorative crosses a figure, a strap or a lower third.

## Elevation & Depth

Flat. There are no drop shadows. Depth comes from layering order (footage at 7% ink, then glass panels at 92% opacity over black, then slabs), from 1px hairline borders, and from motion. The only box-shadows in the build are functional: the 1px inset outline for a nothing-earned sector, and the 2px ink focus ring on the input strap.

### Named Rules
**The No-Lift Rule.** Panels never cast shadows or float on hover. Hover changes fill (slab to white, row to 6% ink wash), not height.

## Shapes

Every panel, strap, chip, segment, button and input is a hard rectangle with a 0 radius. Forms are built from slabs, hairline-bordered panels and thin bars: 6x20px tower chips, 16x8px sector segments, 4px sector-box bars, 8px strap side bars. Entrances are horizontal clip-path wipes, left to right. Pattern carries identity where colour must not: the second repository in a comparison is always a dashed stripe (6px on, 3px off on the strap; 4px on, 3px off on chips).

**The Hard-Edge Rule.** No radius anywhere in the interface: a panel is a slab, and it arrives by wiping, not by scaling or fading in from a rounded card.

## Components

### Buttons
- **Shape:** hard rectangle (0 radius), no border.
- **Primary (the Grade button):** white slab with a black Saira capitals label, 800 weight, 0.1em tracking, 24px side padding, joined to the right end of the input strap. Always enabled; an empty submit shows the inline error instead of disabling the button.
- **Hover / Focus:** slab lifts to pure white in 0.15s; focus is a 2px ink outline at 3px offset site-wide.
- **Copy:** smaller slab (12px label, 6px 12px padding) that sits in starter heads and at the end of the badge snippet.
- **Inline / examples:** text buttons in Ink 2 with a hairline-strong underline that turns to current colour on hover; example repos are set in mono.

### Cues (view navigation)
- **Style:** uppercase 12.5px labels in Ink 3, 2px apart, in the top strip after the wordmark.
- **State:** hover to Ink; the current cue becomes a white slab with black text. The strip scrolls horizontally without a scrollbar when it overflows.

### Input strap (GradeStrap)
- **Style:** a single row: an unlit-grey label cell, a mono 16px input on panel glass, and the white Grade slab; 1px hairline-strong border, max 640px.
- **Focus:** the border shifts to Ink 2 and a 2px ink ring surrounds the whole strap; the input itself has no outline.
- **Error:** an inline yellow strip with on-yellow ink (role alert, input aria-invalid). On the pinned stage it hangs absolutely under the strap so the bottom-anchored block does not jump; in flow it sits in the document.
- **Narrow:** below 1000px the label is visually hidden but still labels the input.

### Timing Tower (signature)
- A panel-glass column with a white slab head (title left, figure right, tabular). Rows are 36px grids of position, chip or micro-sector strip, label, optional pair, and value, divided by hairlines. Section heads are 26px, Ink 3, 12px with 0.1em tracking. Everything in the tower is Saira capitals, including the repository name in the head.
- **Current row:** inverts to a white slab; loss values switch to points-lost ink.
- **Dimmed row:** text stays at Ink 3 (readable); only chips and micro marks fade to 0.3 opacity.
- **Compare:** a chip is solid white where the first repository leads, dashed where the second leads, unlit when level; values show ahead in 800 weight and behind in Ink 2.
- **Motion:** rows wipe in on remount (0.42s, 26ms stagger). When a report lands the lap replays: chips light from unlit, 60ms apart after 200ms, while the score counts up over 1100ms with an ease-out quart.

### Top strip (the Bug)
The mark and GitRep wordmark (Saira 17px, 800, uppercase, width 88%), the view cues, and eleven 16x8px sector segments pushed right, with 6px breaks between the rubric's four categories. Segments take the sector states, stretch vertically on hover, and the current one gets a 1px ink outline. While grading, a single purple light sweeps the eleven segments (1.3s loop, 90ms stagger). The mark tallies whenever the home page or a result opens: written the way a sum is, each ledger row inks in left to right (item, leader dots ticking in, figure, the second figure in its deduction coral), then the total rule is drawn beneath, about 1.1s in all so it closes with the score's count-up. Strokes run on the wipe curve and the total settles on the ease-out. Hovering or focusing the wordmark replays it; on the loading and error screens it stays still, since nothing has been totalled. Only the start state is held, so the mark at rest is pixel for pixel the static logo, and reduced motion shows it already drawn. `docs/logo.svg` carries the same tally for the README; the favicon stays static.

### Name Strap and Sector Boxes
The name strap is a panel with an 8px team-colour side bar (dashed for the rival), the name in the Bricolage strap voice with its real casing, and a Saira capitals meta cell after a hairline. Facts sit below as a hairline grid of solid cells in Saira capitals; flags read in yellow. Sector boxes are a 4-up hairline grid (2-up stacked) of a Saira label, a tabular Saira figure over its maximum, and a 4px bar that grows from the left (purple, or yellow when points were lost).

### Lower Third (signature)
The deduction graphic: a panel-glass box, up to 760px, that wipes in from the left (0.5s, 14px travel) on every beat. Head holds the check name in the Bricolage title voice, sentence case, and a Saira points chip (yellow for a loss, purple for full marks, slab for neutral). Bricolage detail and a small Saira capitals meta line follow. A loss ends in the yellow fix strip (a Saira "Fix" label plus the instruction in Bricolage 600); a clean sector ends in the purple clean strip. A starter block below holds a copyable mono template on panel solid, max 150px tall (110px on short screens).

### Classification
The score in the display voice with its Saira unit, then the verdict band: a white slab (7px 14px) in the Bricolage band voice, first letter capitalised, then verdict prose in Ink 2 at 17px, capped at 42ch.

### README Barcode (TrackMap)
The README drawn as a barcode: one thin vertical mark per line along the bottom of the stage, 40px tall, its height and ink weight set by line kind (headings brightest, then images, then code). Evidence ticks sit on top in the sector colours, and a 2px ink needle labelled with the current line slides to the evidence being read (0.6s ease-out). It stays a barcode, one mark per line; it is not a circuit map.

### Evidence
README hunks in mono at 14px/1.75: right-aligned line numbers in Ink 3, lines in Ink 3, hit lines lifted to Ink on a 6% ink wash with purple or yellow check tags at the end. Gaps between hunks are small Saira capitals in Ink 3. The window masks its top and bottom edges and scrolls with the stage.

### Status tags
Loading and error states reuse the small sentence-case headline with a Saira capitals slab tag beneath it, sized to its text: white for "On track", yellow for "Race control".

## Do's and Don'ts

### Do:
- **Do** reuse the tower, bug, straps and lower third for any new view; change rows and copy, not the package.
- **Do** keep purple, yellow, outline and unlit strictly for sector results, and set text on yellow in on-yellow ink (#161200) and on purple in white.
- **Do** reserve the white slab for the one thing you can press or the thing the graphic is naming.
- **Do** enter panels with a left-to-right clip-path wipe on the wipe curve (cubic-bezier(0.2, 0.8, 0.2, 1)) and settle values on the ease-out curve (cubic-bezier(0.16, 1, 0.3, 1)); collapse all of it, and remove wipes, under prefers-reduced-motion.
- **Do** keep readable text at Ink 3 or brighter; fade only colour marks when de-emphasising.
- **Do** distinguish a second repository by a dashed stripe, never by a colour.
- **Do** use tabular figures for every score and value.
- **Do** set headlines, closers, names, check titles and sentences in Bricolage sentence case (800, width 85%, negative tracking), and every label, cue, key, tag and button in Saira capitals with the family set explicitly.
- **Do** keep the tower in capitals, repository names included, and keep real casing for names everywhere else.

### Don't:
- **Don't** add green, red or any win/lose colour; the comparison regressed to traffic lights once and was reverted.
- **Don't** use a score ring, a card grid or a gauge; the grade is a tower and a classification figure.
- **Don't** round a corner or add a drop shadow to any panel, strap, chip or control.
- **Don't** use purple or yellow on a button, link or heading.
- **Don't** set UI chrome in mono or README content in Bricolage or Saira.
- **Don't** uppercase a Bricolage line, set a sentence or headline in Saira capitals, or add a fourth family.
- **Don't** let footage or any background texture run under a figure, a strap or a lower third.
- **Don't** add a light theme to the package without a new world decision; it is broadcast black only.

## Known Debt

Recorded so it is not mistaken for system rules.

- The 6px category breaks in the eleven sector segments are hard-coded to the rubric's 5/3/2/1 split by child position; a rubric change needs the stylesheet changed too.
- The criteria text in the front-end rubric duplicates the README's rubric table and can drift from it.
- Starters are templates, not generated from the repository.
- No light theme, and no visual regression tests.
- The mark (`docs/logo.svg`, drawn inline in the top strip) predates this system: a rounded square (14 radius) in green-black #1C2119 with a coral #E2705A dash. It is kept on purpose, because the logo is a brand commitment in PRODUCT.md, and it is the only place those colours and that radius appear. Do not reuse them elsewhere; a redraw of the mark in this system's palette is the user's call.
