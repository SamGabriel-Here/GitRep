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
    fontFamily: "Saira, Arial Narrow, system-ui, sans-serif"
    fontSize: "clamp(110px, 14vw, 210px)"
    fontWeight: 800
    lineHeight: 0.8
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 70"
    fontFeature: "'tnum'"
  headline:
    fontFamily: "Saira, Arial Narrow, system-ui, sans-serif"
    fontSize: "clamp(56px, 7.6vw, 124px)"
    fontWeight: 800
    lineHeight: 0.86
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 70"
  closer:
    fontFamily: "Saira, Arial Narrow, system-ui, sans-serif"
    fontSize: "clamp(40px, 4.6vw, 76px)"
    fontWeight: 800
    lineHeight: 0.92
    fontVariation: "'wdth' 72"
  title:
    fontFamily: "Saira, Arial Narrow, system-ui, sans-serif"
    fontSize: "34px"
    fontWeight: 800
    lineHeight: 1.02
    fontVariation: "'wdth' 76"
  strap:
    fontFamily: "Saira, Arial Narrow, system-ui, sans-serif"
    fontSize: "30px"
    fontWeight: 800
    lineHeight: 1
    fontVariation: "'wdth' 76"
  row:
    fontFamily: "Saira, Arial Narrow, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    letterSpacing: "0.03em"
    fontVariation: "'wdth' 84"
    fontFeature: "'tnum'"
  body:
    fontFamily: "Saira, Arial Narrow, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.45
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
    padding: "8px 14px 6px"
  error-inline:
    backgroundColor: "{colors.points-lost-yellow}"
    textColor: "{colors.on-yellow-ink}"
    padding: "8px 12px"
---

# Design System: GitRep

## Overview

**Creative North Star: "Live Timing"**

A repository's grade is a lap under live timing, drawn as a broadcast graphics package over black. One persistent timing tower (the rubric's eleven checks as rows) is reused by every view: home shows it at rest and unlit, a repo report lights it sector by sector, a profile turns it into habits, a comparison turns it into a head-to-head. Around it sit the other pieces a broadcast reuses all weekend: a top strip ("the bug") with view cues and eleven mini-sectors, white name straps, sector boxes, a final-classification score, and a lower third for each deduction carrying the copyable fix.

The package is dense, hard-edged and condensed. Everything is uppercase Saira pulled narrow on its width axis, set in slabs and hairline-gridded panels with no radius and no shadow. Colour is not decoration; it is the timing state. Purple means a clean sector, yellow means points lost, an unlit grey segment means not run, and an outline means nothing earned. Monospace appears only where the README itself is quoted or a fix is handed over.

The build rejects the category default of score ring, card grid and traffic-light colours. There is no green anywhere; a gain colour was tried in the comparison and removed as a traffic-light regression.

**Key Characteristics:**
- One dark ground, dark only; no light theme.
- White slabs mark exactly two things: what you can press, and what the graphic is naming.
- Three sector states (purple, yellow, outline) plus unlit, never on a control.
- Condensed uppercase Saira throughout; Red Hat Mono for README text, inputs and fixes.
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

**Display Font:** Saira (variable width 62-100, weight 400-800), with Arial Narrow, system-ui
**Body Font:** Saira at normal width
**Label/Mono Font:** Red Hat Mono (400, 500), with ui-monospace, SFMono-Regular, Menlo

**Character:** A single condensed grotesque doing every job a timing graphic does, from the 210px classification figure down to 12px tower headers, varied by width axis (70% to 88%) as much as by size. The mono is the README's own voice: whatever the visitor typed or will paste back.

### Hierarchy
- **Display** (800, clamp(110px, 14vw, 210px), 0.8, width 70%, tabular): the final-classification score only. It deliberately exceeds 6rem; it is the graphic, not a heading. The "/100" beside it drops to 0.2em in Ink 2.
- **Headline** (800, clamp(56px, 7.6vw, 124px), 0.86, width 70%, max 12ch, balanced): the home headline. A small variant (clamp(36px, 4.6vw, 72px), max 22ch) carries loading and error states.
- **Closer** (800, clamp(40px, 4.6vw, 76px), 0.92, width 72%, max 16ch): the badge and next-step closers.
- **Title** (800, 34px, 1.02, width 76%): a lower third's check name; 28px on short or narrow screens.
- **Strap** (800, 30px, 1, width 76%): the name strap; 24px under 1240px, 26px stacked. The band slab under the score uses the same voice at 26px.
- **Row** (600, 14px, 0.03em, width 84%, tabular): tower rows; 13px on long towers.
- **Body** (400, 17px, 1.45): standfirsts, ledes and verdicts, capped at 42-60ch. Lower-third detail runs at 16px, criteria and notes at 15px.
- **Label** (600-800, 12-13px, 0.06-0.1em, width 78-84%, uppercase): cues, fact keys, sector-box heads, starter heads, figcaptions, scroll hints and button text.
- **Mono** (400, 13-16px, 1.6): input text (16px), starter code, the badge snippet, evidence lines (14px, 1.75) and the footage.

### Named Rules
**The Narrow-By-Axis Rule.** Condensation comes from Saira's width axis (font-stretch 70-88%), never from a second condensed family or from letter-spacing squeeze.

**The Tabular Figures Rule.** Every number that can change or be compared (score, tower values, pairs, sector boxes, facts, points chips) uses tabular figures so columns hold still during a replay.

**The README-Voice Rule.** Mono is reserved for README content, typed input and copyable fixes. UI chrome never goes mono.

## Layout

Wide screens (1000px and up) run a **pinned stage**: a sticky 100vh viewport the page scrolls through. The stage writes scroll progress to each layer as in/out/t values, and layers fade and wipe from that. Geometry is fixed to the edges: a 28px edge margin; the tower pinned top-left at 84px from the top, 372px wide (320px under 1240px); content starts at twice the edge plus the tower width; straps and sector boxes anchor top-right; the lower third anchors 108px from the bottom, up to 760px wide; the README barcode runs along the bottom edge.

The first viewport puts the tower at rest (unlit rubric) on the left, the huge headline bottom-anchored on the right with the input strap under it as the only white action, and the sector strip at the top right.

Below 1000px the same components restack into a single **flow** column (max 760px, 16px gutters, 18px gap) with a sticky bug; tower and straps become in-flow, sector boxes go 2-up, type scales down. A max-height of 800px tightens rows to 32px and trims the lower third.

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
- **Primary (the Grade button):** white slab with black condensed uppercase label, 800 weight, 0.1em tracking, 24px side padding, joined to the right end of the input strap. Always enabled; an empty submit shows the inline error instead of disabling the button.
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
- A panel-glass column with a white slab head (title left, figure right, tabular). Rows are 36px grids of position, chip or micro-sector strip, label, optional pair, and value, divided by hairlines. Section heads are 26px, Ink 3, 12px with 0.1em tracking.
- **Current row:** inverts to a white slab; loss values switch to points-lost ink.
- **Dimmed row:** text stays at Ink 3 (readable); only chips and micro marks fade to 0.3 opacity.
- **Compare:** a chip is solid white where the first repository leads, dashed where the second leads, unlit when level; values show ahead in 800 weight and behind in Ink 2.
- **Motion:** rows wipe in on remount (0.42s, 26ms stagger). When a report lands the lap replays: chips light from unlit, 60ms apart after 200ms, while the score counts up over 1100ms with an ease-out quart.

### Top strip (the Bug)
The mark and GitRep wordmark (17px, 800, uppercase), the view cues, and eleven 16x8px sector segments pushed right, with 6px breaks between the rubric's four categories. Segments take the sector states, stretch vertically on hover, and the current one gets a 1px ink outline. While grading, a single purple light sweeps the eleven segments (1.3s loop, 90ms stagger).

### Name Strap and Sector Boxes
The name strap is a panel with an 8px team-colour side bar (dashed for the rival), the name at strap size, and a meta cell after a hairline. Facts sit below as a hairline grid of solid cells; flags read in yellow. Sector boxes are a 4-up hairline grid (2-up stacked) of label, tabular figure over its maximum, and a 4px bar that grows from the left (purple, or yellow when points were lost).

### Lower Third (signature)
The deduction graphic: a panel-glass box, up to 760px, that wipes in from the left (0.5s, 14px travel) on every beat. Head holds the check name at title size and a points chip (yellow for a loss, purple for full marks, slab for neutral). Detail and a small uppercase meta line follow. A loss ends in the yellow fix strip ("Fix" label plus the instruction); a clean sector ends in the purple clean strip. A starter block below holds a copyable mono template on panel solid, max 150px tall (110px on short screens).

### README Barcode (TrackMap)
The README drawn as a barcode: one thin vertical mark per line along the bottom of the stage, 40px tall, its height and ink weight set by line kind (headings brightest, then images, then code). Evidence ticks sit on top in the sector colours, and a 2px ink needle labelled with the current line slides to the evidence being read (0.6s ease-out). It stays a barcode, one mark per line; it is not a circuit map.

### Evidence
README hunks in mono at 14px/1.75: right-aligned line numbers in Ink 3, lines in Ink 3, hit lines lifted to Ink on a 6% ink wash with purple or yellow check tags at the end. Gaps between hunks are small uppercase Ink 3 labels. The window masks its top and bottom edges and scrolls with the stage.

### Status tags
Loading and error states reuse the small headline with a slab tag beneath it: white for "On track", yellow for "Race control".

## Do's and Don'ts

### Do:
- **Do** reuse the tower, bug, straps and lower third for any new view; change rows and copy, not the package.
- **Do** keep purple, yellow, outline and unlit strictly for sector results, and set text on yellow in on-yellow ink (#161200) and on purple in white.
- **Do** reserve the white slab for the one thing you can press or the thing the graphic is naming.
- **Do** enter panels with a left-to-right clip-path wipe on the wipe curve (cubic-bezier(0.2, 0.8, 0.2, 1)) and settle values on the ease-out curve (cubic-bezier(0.16, 1, 0.3, 1)); collapse all of it, and remove wipes, under prefers-reduced-motion.
- **Do** keep readable text at Ink 3 or brighter; fade only colour marks when de-emphasising.
- **Do** distinguish a second repository by a dashed stripe, never by a colour.
- **Do** use tabular figures for every score and value.

### Don't:
- **Don't** add green, red or any win/lose colour; the comparison regressed to traffic lights once and was reverted.
- **Don't** use a score ring, a card grid or a gauge; the grade is a tower and a classification figure.
- **Don't** round a corner or add a drop shadow to any panel, strap, chip or control.
- **Don't** use purple or yellow on a button, link or heading.
- **Don't** set UI chrome in mono or README content in Saira.
- **Don't** let footage or any background texture run under a figure, a strap or a lower third.
- **Don't** add a light theme to the package without a new world decision; it is broadcast black only.

## Known Debt

Recorded so it is not mistaken for system rules.

- The 6px category breaks in the eleven sector segments are hard-coded to the rubric's 5/3/2/1 split by child position; a rubric change needs the stylesheet changed too.
- The criteria text in the front-end rubric duplicates the README's rubric table and can drift from it.
- Starters are templates, not generated from the repository.
- No light theme, and no visual regression tests.
- The mark (`docs/logo.svg`, drawn inline in the top strip) predates this system: a rounded square (14 radius) in green-black #1C2119 with a coral #E2705A dash. It is kept on purpose, because the logo is a brand commitment in PRODUCT.md, and it is the only place those colours and that radius appear. Do not reuse them elsewhere; a redraw of the mark in this system's palette is the user's call.
