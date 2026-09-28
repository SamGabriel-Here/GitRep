<img src="docs/logo.svg" width="72" alt="">

# GitRep

GitRep grades a public GitHub repository out of 100 and shows where every point went. Paste a
repository and you get eleven checks, the README lines each one gave credit for, and a fix for
every point it took. Paste a username and it grades everything that person has published, then
names the habit costing them the most. Put `vs` between two repositories and it compares them
check by check.

**Live at [getgitrep.vercel.app](https://getgitrep.vercel.app).**

[![CI](https://github.com/SamGabriel-Here/GitRep/actions/workflows/ci.yml/badge.svg)](https://github.com/SamGabriel-Here/GitRep/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![GitRep](https://getgitrep.vercel.app/api/badge/SamGabriel-Here/GitRep.svg)](https://getgitrep.vercel.app/?target=SamGabriel-Here/GitRep)

![The GitRep home page: the rubric as an unlit timing tower beside the input](docs/screenshot-home.png)

## What it grades

Eleven checks in four categories, worth 100 points between them. Documentation carries 55 of
them, because it is the part you control entirely and the only part most visitors read.

| Check | Points | Full marks | Partial credit |
| --- | --: | --- | --- |
| **Documentation** | **55** | | |
| README depth | 15 | 600 words of prose, not counting badges or code | 5, 10 or 13 from 40, 120 or 300 words |
| Structure | 8 | Six or more headings | 3 for one or two, 6 for three to five |
| Setup instructions | 12 | A setup section with a command you can copy | 8 for the heading alone, 5 for a passing mention |
| Usage examples | 12 | A usage section with a worked example | 8 for the section alone, 6 for code with no section, 4 for a mention |
| Screenshots | 8 | Two screenshots, or a GIF or video of it running | 6 for one, 2 for badges only |
| **Discoverability** | **20** | | |
| Description | 8 | The repository description is a full sentence | 4 for three words or fewer |
| Topics | 7 | Three or more topics | 4 for one or two |
| Live demo | 5 | The website field points somewhere | 4 for a demo link in the README only |
| **Trust signals** | **15** | | |
| License | 8 | A license GitHub recognises | 4 for one it does not |
| Project signals | 7 | Two of: CI, a contributing guide, visible tests | 4 for one |
| **Upkeep** | **10** | | |
| Recent activity | 10 | Pushed in the last 90 days | 8 within 180 days, 6 within a year, 3 within two |

A score of 85 or more is `exemplary`, 60 to 84 is `solid`, and anything lower `needs work`. Each
check comes back as `pass` (full marks), `partial`, or `fail` (nothing earned), with the reason
and the fix.

## Reading a report

The interface borrows from the timing graphics of a race broadcast. A graded repository is a
lap: the eleven checks are its mini-sectors and the four categories its sectors. The timing
tower on the left stays on screen in every view, re-sorted for whatever you are looking at: the
rubric, a report, a profile's standings or a head-to-head.

When a report lands, the lap replays. Each sector lights in turn, purple for full marks, yellow
for points lost and a hollow outline for nothing earned, while the score counts up.

Scrolling keeps the page still and changes the graphics. Each step puts one check in the lower
third: what GitRep found, the fix, and a starter. A starter is something to copy or a link that
does the job on GitHub, so a repository with no CI gets a workflow file for its language, opened
in GitHub's editor already filled in.

![A deduction in the lower third, with its fix and a starter](docs/screenshot-lap.png)

Along the bottom runs the README as a barcode, one mark per line: taller for headings, denser for
code, with a tick above every line that earned a point. The marker follows the line the current
check found. The report ends with that evidence in full, every credited line with a little
context, tagged with the check it earned.

![The evidence view: README lines tagged with the checks they earned](docs/screenshot-evidence.png)

On a phone the same pieces stack into one scrolling page, and a system set to reduce motion gets
the report without the animation.

## Profiles and comparisons

Paste a username and GitRep grades their twenty most recently pushed repositories. Forks are
skipped, since a fork's README is somebody else's writing. The tower becomes the standings, best
first, each repository with its eleven sectors in miniature. Scrolling steps through the habits
costing the most points; as each one comes up, the repositories that already pass it step back,
and the lower third names the ones that do not.

![A profile: the standings beside the habit costing the most points](docs/screenshot-profile.png)

That is the part worth acting on. Adding a license to eight repositories takes an afternoon, and
it is worth more than perfecting the README of the one you like best.

Put `vs` between two repositories, or open `?compare=owner/one,owner/two`, and the tower becomes
a head-to-head: both scores on every check and the gap between them. Scrolling steps through the
checks where they differ, with each side's reason and the fix for whichever is behind.

![nanoGPT against minGPT, check by check](docs/screenshot-compare.png)

Every report lives in the URL, so it can be shared as a link: `?target=owner/name` for a
repository, `?target=owner` for a profile, `?compare=owner/one,owner/two` for a comparison.
Older links that use `?repo=` still work.

## The README badge

Every graded repository has a badge: the score, then one mark per check in the tower's colours.
The end of each report shows it with the markdown to copy.

```markdown
[![GitRep](https://getgitrep.vercel.app/api/badge/OWNER/REPO.svg)](https://getgitrep.vercel.app/?target=OWNER/REPO)
```

GitHub serves README images through its own proxy, which blocks web fonts, so the badge is drawn
in the system font. It is cached for an hour, so a fix you push reaches the badge within one.

## Run it locally

You need Python 3.10 or newer and Node 20 or newer. Start the API:

```bash
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --app-dir backend --reload
```

Then the site, in a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The dev server passes `/api` through to uvicorn on port 8000, so
the site reaches the API on its own origin exactly as it does in production, and there is no API
URL to configure.

Set `GITHUB_TOKEN` before you show this to anyone. Without it GitHub allows 60 requests an hour,
and grading a single profile can use all of them. GitRep reads only public data, so the token
needs no scopes: a classic token with every box unticked is enough. Do not grant it `repo`.

## API

Four endpoints under `/api`, with no authentication. Interactive docs are at `/api/docs`.

| Endpoint | Returns |
| --- | --- |
| `GET /api/health` | `{"status": "ok", "version": "3.0.0"}` |
| `GET /api/rubric` | The eleven checks and their weights |
| `POST /api/analyze` | A report for a repository or a profile |
| `GET /api/badge/{owner}/{repo}.svg` | The README badge |

`POST /api/analyze` takes a link, an SSH remote, `owner/repo`, or a bare username:

```bash
curl -X POST http://localhost:8000/api/analyze \
  -H 'Content-Type: application/json' \
  -d '{"github_url": "karpathy/nanoGPT"}'
```

The server decides what was pasted and says so in `kind`. A repository report, shortened:

```json
{
  "kind": "repo",
  "score": 77,
  "band": "solid",
  "repo": { "name": "karpathy/nanoGPT", "language": "Python", "stars": 63360, "default_branch": "master" },
  "categories": [{ "id": "documentation", "label": "Documentation", "earned": 55, "possible": 55 }],
  "checks": [
    {
      "id": "install",
      "label": "Setup instructions",
      "possible": 12,
      "earned": 12,
      "status": "pass",
      "detail": "\"install\" with a command you can copy.",
      "fix": "",
      "evidence": [
        { "line": 19, "kind": "heading", "text": "## install" },
        { "line": 21, "kind": "code", "text": "```" }
      ]
    }
  ],
  "readme": { "present": true, "words": 1620, "text": "...", "truncated": false },
  "suggestions": ["Add topics so the repo turns up when people browse by subject."]
}
```

Evidence lines count from 1 through the README as it was written, so they stay right after the
parser sets code blocks and comments aside. `readme.text` is the README itself, capped at 1,500
lines. A profile comes back as `"kind": "profile"`, with each check's total across the profile in
`habits` (most points lost first) and every repository's report in `repos` (best first).

The badge endpoint always answers with an image. A repository that cannot be graded gets a badge
that says why instead of a broken image, cached for five minutes rather than an hour.

Errors come back as `{"detail": "..."}` with a status that means something: `400` for input it
cannot parse, `404` for a missing or private repository, `429` when GitHub's rate limit is spent
(the message says roughly how long to wait), and `502` or `504` when GitHub is down or slow.

## How the analysis works

Asking whether a README explains installation is harder than searching it for "install". The
word also sits inside `uninstall`, and in every code sample that mentions a package manager.

So `rubric/readme.py` takes the document apart before any check asks it anything. Fenced code
blocks come out first, replaced by markers that hold their place. Images are sorted into
screenshots and badges by URL, because a shields.io badge is not a picture of your project. Link
targets go and link text stays. Headings become a tree in which a section runs until the next
heading at its own level or higher, so `## Example` still owns the code under `### Create it`.
Every step keeps a map back to the original lines, which is what lets a check say "line 19" and
mean the line you wrote.

`rubric/checks.py` asks its questions of that structure. When several sections match, it prefers
the one with commands in it, which stops "Requirements" beating "Installation" for the setup
check. `github/client.py` reads the repository first, then its README, file tree and workflows
at the same time, so a grade costs two round trips to GitHub rather than four.

## Project structure

```
.
├── api/index.py            Vercel entrypoint: puts backend/ on the path, exports the app
├── backend/
│   ├── app/
│   │   ├── main.py         the four routes, all under /api
│   │   ├── badge.py        the README badge, as an SVG
│   │   ├── config.py       every setting read from the environment
│   │   ├── schemas.py      request models
│   │   ├── github/         the async GitHub client, and what counts as a repo or a profile
│   │   └── rubric/         the README parser, the eleven checks, and the engine that runs them
│   └── tests/              one test file per module
├── frontend/
│   ├── index.html          fonts and share metadata
│   ├── vite.config.js      the dev proxy from /api to uvicorn
│   └── src/
│       ├── App.jsx         the route, the fetch, and which view to show
│       ├── views/          home, repository, profile and comparison
│       ├── components/     the pinned scroll stage and the broadcast graphics
│       ├── hooks/          media queries and the counting score
│       ├── lib/            API client, rubric knowledge and starters, scroll arithmetic
│       └── styles/         the design tokens, then frame, graphics and pages
├── docs/                   the logo and the screenshots in this README
├── DESIGN.md               the design system
├── PRODUCT.md              who GitRep is for and what it has to do
└── vercel.json             build, function and routing config
```

The interface's tokens, type, motion and layout are written down in [DESIGN.md](DESIGN.md). Read
it before changing anything visual.

## Tests

```bash
pip install pytest
python -m pytest backend/tests -q
cd frontend && npm test
```

The backend tests mirror its modules, and most of them cover the parser and the rubric, where the
hard cases live: badge walls that should not count as screenshots, `Uninstall` headings that
should not count as setup, unclosed code fences, setext headings, and source lines that survive
all of them. The client tests pin the difference between a repository with no README and a
request that ran out of rate limit, which decides whether a report is honestly missing or
confidently wrong. The frontend tests cover routing, the evidence view, the starters and the
scroll arithmetic.

CI runs both suites on every push, along with the frontend's lint and build.

## Deployment

Vercel serves the built site from its CDN and runs the API beside it as a Python function, on
one origin.

1. On Vercel, choose **Add New → Project** and import this repository.
2. Leave the build settings alone. [`vercel.json`](vercel.json) already sets the build command,
   the output directory, and the rewrite that sends `/api/*` to the function.
3. Add `GITHUB_TOKEN` under **Settings → Environment Variables** before the first deploy.

The function may run for 15 seconds, and GitHub gets 10 of them per request. Graded repositories
are cached in memory for five minutes, but serverless instances are short-lived, so that only
helps while one stays warm. The badge relies on Vercel's CDN cache instead.

## Limits

- Public repositories only. There is no sign-in, so a private repository reads as missing.
- A profile grades at most twenty repositories.
- The rubric judges presentation, not code. A well-documented project with broken code scores
  well, which is the scope rather than an oversight.
- Heading matching is English-only, so a README in another language loses the setup and usage
  checks even when it covers both.
- The starters are templates: the CI file assumes the usual commands for the language, and the
  README skeletons have placeholders.
- A comparison grades both repositories from scratch, so it costs twice the GitHub calls.

## License

MIT. See [LICENSE](LICENSE).
