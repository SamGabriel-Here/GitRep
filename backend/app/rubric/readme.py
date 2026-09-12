"""Turns README markdown into something we can ask real questions about.

The old scorer asked things like `"install" in readme.lower()`, which is true
for "uninstall", for a link to installshield.com, and for the word appearing
inside a code sample. This module pulls the document apart first, so a question
about prose only ever looks at prose.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field

CODE_MARK = "\x00code\x00"

# Services that serve status badges. A badge is not a screenshot, and treating
# it as one was the most misleading thing the old scorer did.
BADGE_HOSTS = (
    "shields.io",
    "badge.fury.io",
    "badgen.net",
    "forthebadge.com",
    "travis-ci.org",
    "travis-ci.com",
    "circleci.com",
    "codecov.io",
    "coveralls.io",
    "snyk.io",
    "sonarcloud.io",
    "app.netlify.com",
    "api.netlify.com",
    "opencollective.com",
    "isitmaintained.com",
    "codeclimate.com",
    "david-dm.org",
    "bettercodehub.com",
    "pepy.tech",
    "img.buymeacoffee.com",
)

BADGE_PATH_HINTS = ("/badge", "badge.svg", "badge.png", "/actions/workflows/", "/workflows/")

# Hosts people actually deploy portfolio projects to.
DEMO_HOSTS = (
    "vercel.app",
    "netlify.app",
    "onrender.com",
    "github.io",
    "herokuapp.com",
    "fly.dev",
    "pages.dev",
    "streamlit.app",
    "railway.app",
    "surge.sh",
    "glitch.me",
    "replit.app",
    "huggingface.co/spaces",
)

MOTION_SUFFIXES = (".gif", ".mp4", ".webm", ".mov")

_FENCE_OPEN = re.compile(r"^(`{3,}|~{3,})(.*)$")
_FENCE_CLOSE = re.compile(r"^(`{3,}|~{3,})\s*$")
_HTML_COMMENT = re.compile(r"<!--.*?-->", re.S)
_MD_IMAGE = re.compile(r"!\[(?P<alt>[^\]]*)\]\(\s*(?P<url>[^)\s]+)[^)]*\)")
_HTML_IMAGE = re.compile(r"<img\b[^>]*?\bsrc\s*=\s*[\"'](?P<url>[^\"']+)[\"']", re.I)
_MD_LINK = re.compile(r"(?<!!)\[(?P<text>[^\]]*)\]\(\s*(?P<url>[^)\s]+)[^)]*\)")
_HTML_LINK = re.compile(r"<a\b[^>]*?\bhref\s*=\s*[\"'](?P<url>[^\"']+)[\"']", re.I)
_ATX = re.compile(r"^(#{1,6})\s+(.+?)\s*#*\s*$")
_SETEXT = re.compile(r"^(?P<text>\S[^\n]*)\n(?P<rule>=+|-{2,})[ \t]*$", re.M)
_INLINE_CODE = re.compile(r"`[^`\n]+`")
_HTML_TAG = re.compile(r"<[^>]+>")
_HTML_ENTITY = re.compile(r"&(?:[A-Za-z]+|#\d+);")
_LIST_MARK = re.compile(r"^\s*(?:[-*+]|\d+[.)])\s+", re.M)
_QUOTE_MARK = re.compile(r"^\s*>+\s?", re.M)
_TABLE_RULE = re.compile(r"^\s*\|?[\s:|-]{4,}\|?\s*$", re.M)
_EMPHASIS = re.compile(r"[*_~]{1,3}")
_WORD = re.compile(r"[A-Za-z0-9][A-Za-z0-9'’./-]*")


@dataclass
class Heading:
    level: int
    text: str
    line: int

    @property
    def slug(self) -> str:
        return self.text.lower().strip()


@dataclass
class Image:
    url: str
    alt: str

    @property
    def is_badge(self) -> bool:
        low = self.url.lower()
        if any(host in low for host in BADGE_HOSTS):
            return True
        return any(hint in low for hint in BADGE_PATH_HINTS)

    @property
    def is_motion(self) -> bool:
        return self.url.lower().split("?")[0].endswith(MOTION_SUFFIXES)


@dataclass
class Section:
    heading: Heading
    body: str
    code_blocks: int

    @property
    def has_code(self) -> bool:
        return self.code_blocks > 0


@dataclass
class Readme:
    present: bool = False
    raw: str = ""
    prose: str = ""
    words: int = 0
    headings: list[Heading] = field(default_factory=list)
    sections: list[Section] = field(default_factory=list)
    code_blocks: list[str] = field(default_factory=list)
    images: list[Image] = field(default_factory=list)
    links: list[str] = field(default_factory=list)
    has_video_embed: bool = False

    @property
    def real_images(self) -> list[Image]:
        return [img for img in self.images if not img.is_badge]

    @property
    def badges(self) -> list[Image]:
        return [img for img in self.images if img.is_badge]

    @property
    def demo_links(self) -> list[str]:
        return [url for url in self.links if any(host in url.lower() for host in DEMO_HOSTS)]

    def find_section(self, patterns: tuple[re.Pattern, ...]) -> Section | None:
        """Best matching section, preferring one that actually shows commands.

        A README often has both "Requirements" and "Installation"; matching the
        first heading in document order picks the wrong one about half the time.
        """
        matches = [s for s in self.sections if any(p.search(s.heading.slug) for p in patterns)]
        if not matches:
            return None
        return next((s for s in matches if s.has_code), matches[0])

    def prose_mentions(self, patterns: tuple[re.Pattern, ...]) -> bool:
        return any(p.search(self.prose.lower()) for p in patterns)


def _split_fences(text: str) -> tuple[str, list[str]]:
    """Replace every fenced block with a one-line marker, keeping line order."""
    out: list[str] = []
    langs: list[str] = []
    fence_char = ""
    fence_len = 0
    lang = ""
    open_fence = False

    for line in text.split("\n"):
        stripped = line.lstrip()
        if not open_fence:
            match = _FENCE_OPEN.match(stripped)
            if match and len(line) - len(stripped) <= 3:
                fence_char = match.group(1)[0]
                fence_len = len(match.group(1))
                info = match.group(2).strip()
                lang = info.split()[0].strip("{}.") if info else ""
                open_fence = True
                continue
            out.append(line)
            continue

        close = _FENCE_CLOSE.match(stripped)
        if close and close.group(1)[0] == fence_char and len(close.group(1)) >= fence_len:
            langs.append(lang)
            out.append(CODE_MARK)
            open_fence = False
            continue

    # An unclosed fence still tells us there was a code sample.
    if open_fence:
        langs.append(lang)
        out.append(CODE_MARK)

    return "\n".join(out), langs


def _promote_setext(text: str) -> str:
    def repl(match: re.Match) -> str:
        level = 1 if match.group("rule").startswith("=") else 2
        return f"{'#' * level} {match.group('text').strip()}"

    return _SETEXT.sub(repl, text)


def _collect_headings(text: str) -> list[Heading]:
    headings = []
    for index, line in enumerate(text.split("\n")):
        match = _ATX.match(line.strip())
        if match:
            # Badges live in headings more often than you would hope, and their
            # alt text is not part of the title: React's H1 carries a "GitHub
            # license" image that would otherwise read as heading words.
            title = _MD_IMAGE.sub(" ", match.group(2))
            title = _HTML_IMAGE.sub(" ", title)
            title = _INLINE_CODE.sub(lambda m: m.group(0).strip("`"), title)
            title = _MD_LINK.sub(lambda m: m.group("text"), title)
            title = _EMPHASIS.sub("", _HTML_TAG.sub("", title))
            title = _HTML_ENTITY.sub(" ", title)
            title = re.sub(r"\s+", " ", title).strip(" ·-—:|")
            if title:
                headings.append(Heading(level=len(match.group(1)), text=title, line=index))
    return headings


def _build_sections(text: str, headings: list[Heading]) -> list[Section]:
    """A section runs until the next heading at the same level or higher.

    Nesting matters: "## Example" followed by "### Create it" owns the code in
    that subsection, and slicing at the next heading of any level would hand
    back an empty body and score the repo as having no examples.
    """
    lines = text.split("\n")
    sections = []
    for position, heading in enumerate(headings):
        start = heading.line + 1
        end = len(lines)
        for later in headings[position + 1:]:
            if later.level <= heading.level:
                end = later.line
                break
        body = "\n".join(lines[start:end])
        sections.append(Section(heading=heading, body=body, code_blocks=body.count(CODE_MARK)))
    return sections


def _to_prose(text: str) -> str:
    """Strip markdown down to the words a human would actually read."""
    text = _MD_IMAGE.sub(" ", text)
    text = _HTML_IMAGE.sub(" ", text)
    text = _MD_LINK.sub(lambda m: f" {m.group('text')} ", text)
    text = _HTML_TAG.sub(" ", text)
    text = text.replace(CODE_MARK, " ")
    text = _INLINE_CODE.sub(" ", text)
    text = _TABLE_RULE.sub(" ", text)
    text = _QUOTE_MARK.sub("", text)
    text = _LIST_MARK.sub("", text)
    text = re.sub(r"^#{1,6}\s+", "", text, flags=re.M)
    text = _EMPHASIS.sub("", text)
    text = text.replace("|", " ")
    return re.sub(r"[ \t]+", " ", text).strip()


def parse(markdown: str | None) -> Readme:
    if not markdown or not markdown.strip():
        return Readme(present=False)

    raw = markdown
    body = _HTML_COMMENT.sub(" ", markdown)
    body, langs = _split_fences(body)

    images = [Image(url=m.group("url"), alt=m.group("alt")) for m in _MD_IMAGE.finditer(body)]
    images += [Image(url=m.group("url"), alt="") for m in _HTML_IMAGE.finditer(body)]

    links = [m.group("url") for m in _MD_LINK.finditer(body)]
    links += [m.group("url") for m in _HTML_LINK.finditer(body)]

    body = _promote_setext(body)
    headings = _collect_headings(body)
    sections = _build_sections(body, headings)

    prose = _to_prose(body)

    return Readme(
        present=True,
        raw=raw,
        prose=prose,
        words=len(_WORD.findall(prose)),
        headings=headings,
        sections=sections,
        code_blocks=langs,
        images=images,
        links=links,
        has_video_embed=bool(re.search(r"<video\b", raw, re.I)),
    )
