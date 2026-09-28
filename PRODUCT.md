# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Backend kept as it is: FastAPI under `/api`, served as a Vercel Python function beside the static
front end, one origin. The front end is rebuilt from zero; its framework was delegated. The choice is
React + Vite, because CI, the Vercel build and the dev proxy already assume it and nothing in the
redesign needs a server-rendered framework.

## Users

Three audiences, all confirmed:

- **Developers polishing their GitHub**, often students and job seekers, checking how their repos read
  to a stranger before someone important looks.
- **Recruiters and hiring managers** pasting a candidate's username for a quick, defensible read on how
  that person presents their work.
- **Open-source maintainers** who want their project to earn adoption and contributors.

## Product Purpose

GitRep grades a public GitHub repository, or a whole profile, against a weighted 100-point rubric and
itemises every point: which check lost it, why, and the specific fix.

Success means all three of:

1. People fix their repos: they leave with a to-do list and their score goes up.
2. Scores get shared: people send the report link or embed the score badge, which brings new visitors.
3. It works as a portfolio showpiece for its author.

## Positioning

The grade is explainable to the point. Every deduction names the check, the evidence, and the fix, so
nobody has to take a number on faith. The README is parsed as a document (sections own their code,
badges are told apart from screenshots, "uninstall" is not "install"), not keyword-searched. A profile is
read as habits: the check that costs a person the most across all their repositories.

## Operating Context

- One input takes a repo URL, an SSH remote, `owner/repo`, or a bare username; the server decides which.
- A result lives at `?target=owner/name` so it can be linked, sent and reopened.
- Recruiters usually arrive through a shared link rather than the home page.
- Planned additions: a score badge people embed in their own README, an annotated README view that shows
  each check's evidence in place, and a side-by-side comparison of two repositories.

## Capabilities and Constraints

- API: `GET /api/health`, `GET /api/rubric`, `POST /api/analyze`. The backend's logic stays; new features
  may add endpoints or fields but must not break these.
- Eleven checks across four categories, weighted to exactly 100. Bands: exemplary 85+, solid 60-84,
  needs work below 60.
- Public repositories only; no OAuth.
- GitHub rate limit is 60 requests an hour without a token, 5,000 with one. A repo costs four calls.
- A profile grades at most the twenty most recently pushed non-fork repositories, within a 15 second
  function limit.
- Heading matching is English-only. The rubric judges presentation, not code quality.
- Nothing is stored. The in-process cache only helps within a warm serverless instance.
- Local tooling is Node 20.11 (see project memory); dependency choices must build on it.
- The "every repo starts at 100" framing is no longer a commitment; it may stay or go.

## Brand Commitments

- The name **GitRep**.
- The logo, `docs/logo.svg` (also the favicon): two ledger rows closed by a total rule, one figure in the
  deduction colour.
- The URL **getgitrep.vercel.app**, deployed from this repository's Vercel project.

## Evidence on Hand

- Real API output for any public repository or profile, fetched live.
- README screenshots in `docs/` (from the previous interface, now superseded).
- No user counts, testimonials, press, or usage statistics exist. Do not invent any.

## Product Principles

1. Every point is accounted for. A score never appears without the itemised reasons behind it.
2. Tell the truth kindly. The report says what is missing without cheering or scolding.
3. The fix is the product. Each deduction ends in something the reader can do today.
4. A result is worth sending. Every report is a link, and the badge is a way home.
5. Fast to an answer. One paste, one wait, one page.

## Accessibility & Inclusion

WCAG 2.2 AA, carried over from the current build: data-bearing text at 4.5:1 or better in every theme,
full keyboard reach with a visible focus ring, results announced politely to screen readers, errors as
alerts, and `prefers-reduced-motion` honoured by every animation.
