"""The eleven checks.

Ten checks, weighted to exactly 100 points. Every check can award partial
credit, because "has a Usage heading but no example you can copy" is genuinely
better than nothing and genuinely worse than the real thing. The old pass/fail
scoring collapsed those into the same answer.
"""

from __future__ import annotations

import re
from dataclasses import asdict, dataclass
from datetime import datetime, timezone

from app.rubric.readme import Readme



def _patterns(*sources: str) -> tuple[re.Pattern, ...]:
    return tuple(re.compile(s, re.I) for s in sources)


# `\binstall` deliberately does not match "uninstall": there is no word
# boundary in the middle of that word.
INSTALL = _patterns(
    r"\binstall(?:ation|ing)?\b",
    r"\bset[-\s]?up\b",
    r"\bgetting started\b",
    r"\bquick\s?start\b",
    r"\bprerequisites?\b",
    r"\brequirements?\b",
    r"\bbuild from source\b",
    r"\brun(?:ning)?\b[^.\n]{0,15}\blocally\b",
    r"\bdeployment\b",
)

USAGE = _patterns(
    r"\busage\b",
    r"\bexamples?\b",
    r"\bhow to use\b",
    r"\bhow it works\b",
    r"\bapi\b",
    r"\bcommands?\b",
    r"\bquick\s?start\b",
    r"\bgetting started\b",
)

CONTRIBUTING = _patterns(r"\bcontribut", r"\bdevelopment\b", r"\bdeveloping\b", r"\bhacking\b")
TESTING = _patterns(r"\btests?\b", r"\btesting\b")
CI_HINTS = ("/actions/workflows/", "workflows", "travis", "circleci", "appveyor", "codecov", "coveralls")


@dataclass
class Check:
    id: str
    category: str
    label: str
    possible: int
    earned: int
    detail: str
    fix: str

    @property
    def lost(self) -> int:
        return self.possible - self.earned

    @property
    def status(self) -> str:
        if self.earned >= self.possible:
            return "pass"
        return "partial" if self.earned > 0 else "fail"

    def as_dict(self) -> dict:
        data = asdict(self)
        data["lost"] = self.lost
        data["status"] = self.status
        return data


def _band(words: int, bands: tuple[tuple[int, int], ...], top: int) -> int:
    for threshold, points in bands:
        if words < threshold:
            return points
    return top


def _readme_depth(readme: Readme, repo: dict) -> Check:
    words = readme.words
    if not readme.present:
        detail, fix = (
            "No README on the default branch.",
            "Add a README.md. It is the only part of your repo most visitors will read.",
        )
        earned = 0
    else:
        earned = _band(words, ((40, 0), (120, 5), (300, 10), (600, 13)), 15)
        detail = f"{words} words of prose, once badges and code samples are set aside."
        if earned >= 15:
            fix = ""
        elif words < 40:
            fix = "Say what this project does, who it is for, and why it exists."
        else:
            fix = "Go deeper on what the project does and why someone would choose it."
    return Check("readme_depth", "documentation", "README depth", 15, earned, detail, fix)


def _readme_structure(readme: Readme, repo: dict) -> Check:
    count = len(readme.headings)
    earned = _band(count, ((1, 0), (3, 3), (6, 6)), 8)
    if not readme.present:
        detail = "Nothing to structure yet."
    elif count == 0:
        detail = "One unbroken block of text with no headings."
    else:
        detail = f"{count} heading{'s' if count != 1 else ''} organising the page."
    fix = "" if earned >= 8 else "Break the README into headed sections so people can skim to what they need."
    return Check("readme_structure", "documentation", "Structure", 8, earned, detail, fix)


def _install(readme: Readme, repo: dict) -> Check:
    section = readme.find_section(INSTALL)
    if section and section.has_code:
        earned, detail = 12, f'"{section.heading.text}" with a command you can copy.'
    elif section:
        earned, detail = 8, f'"{section.heading.text}" exists, but there is no command in it.'
    elif readme.prose_mentions(INSTALL):
        earned, detail = 5, "Setup is mentioned in passing, never as its own section."
    else:
        earned, detail = 0, "No installation or setup instructions."
    fix = {
        12: "",
        8: "Add a fenced code block with the exact commands to run.",
        5: "Give setup its own heading, with the commands in a code block.",
        0: "Add a setup section with the commands needed to get it running.",
    }[earned]
    return Check("install", "documentation", "Setup instructions", 12, earned, detail, fix)


def _usage(readme: Readme, repo: dict) -> Check:
    section = readme.find_section(USAGE)
    if section and section.has_code:
        earned, detail = 12, f'"{section.heading.text}" with a worked example.'
    elif section:
        earned, detail = 8, f'"{section.heading.text}" exists, but shows no example.'
    elif readme.code_blocks:
        earned, detail = 6, "Code samples are present, but no section explains how to use the project."
    elif readme.prose_mentions(USAGE):
        earned, detail = 4, "Usage is mentioned, but never shown."
    else:
        earned, detail = 0, "No usage guidance."
    fix = {
        12: "",
        8: "Show a short worked example in a code block.",
        6: "Add a usage section that walks through the examples you already have.",
        4: "Add a usage section with a runnable example.",
        0: "Show what running this looks like, with input and output.",
    }[earned]
    return Check("usage", "documentation", "Usage examples", 12, earned, detail, fix)


def _media(readme: Readme, repo: dict) -> Check:
    real = readme.real_images
    moving = readme.has_video_embed or any(img.is_motion for img in real)
    if moving or len(real) >= 2:
        earned, detail = 8, "Screenshots or a recording of the project running."
    elif len(real) == 1:
        earned, detail = 6, "One screenshot."
    elif readme.badges:
        earned, detail = 2, f"{len(readme.badges)} badges, but nothing showing the project itself."
    else:
        earned, detail = 0, "Nothing to look at."
    fix = {
        8: "",
        6: "Add a second view, or a GIF of it running.",
        2: "Badges show status, not the product. Add a screenshot.",
        0: "Add a screenshot or a short GIF near the top.",
    }[earned]
    return Check("media", "documentation", "Screenshots", 8, earned, detail, fix)


def _description(readme: Readme, repo: dict) -> Check:
    text = (repo.get("description") or "").strip()
    words = len(text.split())
    if not text:
        earned, detail = 0, "No repository description."
    elif words <= 3:
        earned, detail = 4, f'Description is only "{text}".'
    else:
        earned, detail = 8, "Description set."
    fix = {
        8: "",
        4: "Write a full sentence. This is what shows up in search results.",
        0: "Add a one-line description. It appears on your profile and in search.",
    }[earned]
    return Check("description", "discovery", "Description", 8, earned, detail, fix)


def _topics(readme: Readme, repo: dict) -> Check:
    topics = repo.get("topics") or []
    count = len(topics)
    earned = _band(count, ((1, 0), (3, 4)), 7)
    detail = f"{count} topic{'s' if count != 1 else ''} set." if count else "No topics set."
    fix = "" if earned >= 7 else "Add topics so the repo turns up when people browse by subject."
    return Check("topics", "discovery", "Topics", 7, earned, detail, fix)


def _homepage(readme: Readme, repo: dict) -> Check:
    homepage = (repo.get("homepage") or "").strip()
    demos = readme.demo_links
    if homepage:
        earned, detail = 5, "Homepage link set on the repo."
    elif demos:
        earned, detail = 4, "A live link in the README, but the repo's homepage field is empty."
    else:
        earned, detail = 0, "Nothing to click through to."
    fix = {
        5: "",
        4: "Put that link in the repo's homepage field so it shows in the sidebar.",
        0: "Deploy it somewhere and link it. A live demo outperforms any description.",
    }[earned]
    return Check("homepage", "discovery", "Live demo", 5, earned, detail, fix)


def _license(readme: Readme, repo: dict) -> Check:
    spdx = repo.get("license")
    if not spdx:
        earned, detail, fix = 0, "No license.", "Add a license, or nobody can legally reuse this."
    elif spdx == "NOASSERTION":
        earned, detail, fix = 4, "A license file GitHub could not identify.", "Use a standard license so the terms are recognised."
    else:
        earned, detail, fix = 8, f"{spdx}.", ""
    return Check("license", "trust", "License", 8, earned, detail, fix)


def _signals(readme: Readme, repo: dict) -> Check:
    found = []
    if any(hint in img.url.lower() for img in readme.badges for hint in CI_HINTS) or repo.get("has_workflows"):
        found.append("CI")
    if repo.get("has_contributing") or readme.find_section(CONTRIBUTING):
        found.append("contributing guide")
    if repo.get("has_tests") or readme.find_section(TESTING):
        found.append("tests")

    earned = _band(len(found), ((1, 0), (2, 4)), 7)
    listed = ", ".join(found)
    detail = f"{listed[:1].upper()}{listed[1:]}." if found else "No CI, contributing guide, or tests."
    fix = "" if earned >= 7 else "Add CI, a contributing guide, or visible tests. Each one says the project is maintained."
    return Check("signals", "trust", "Project signals", 7, earned, detail, fix)


def _recency(readme: Readme, repo: dict) -> Check:
    pushed = repo.get("pushed_at")
    if not pushed:
        return Check("recency", "upkeep", "Recent activity", 10, 0, "No recorded activity.", "Push something.")

    moment = datetime.fromisoformat(pushed.replace("Z", "+00:00"))
    days = max((datetime.now(timezone.utc) - moment).days, 0)
    earned = _band(days, ((91, 10), (181, 8), (366, 6), (731, 3)), 0)

    if days < 1:
        detail = "Pushed today."
    elif days < 60:
        detail = f"Pushed {days} days ago."
    elif days < 365:
        detail = f"Pushed about {days // 30} months ago."
    else:
        years = days / 365
        detail = f"Pushed about {years:.0f} year{'s' if years >= 1.5 else ''} ago."

    fix = "" if earned >= 10 else "Even a small commit tells visitors the project is still alive."
    return Check("recency", "upkeep", "Recent activity", 10, earned, detail, fix)


CHECKS = (
    _readme_depth,
    _readme_structure,
    _install,
    _usage,
    _media,
    _description,
    _topics,
    _homepage,
    _license,
    _signals,
    _recency,
)
