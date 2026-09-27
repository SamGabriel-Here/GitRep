"""The README badge: a score and one mark per check, as a standalone SVG.

GitHub proxies README images through its own camo server, which strips any
external request, so the badge cannot load a web font. It is drawn in the
system sans stack, and every length is fixed rather than measured.
"""

from __future__ import annotations

from xml.sax.saxutils import escape

INK = "#0b0c0f"
SLAB = "#f2f2ee"
# Full marks, points lost, nothing earned: the same three states the timing
# tower uses, so a badge and a report read the same way.
MARK = {"pass": "#7a3cf0", "partial": "#d99a00"}
FONT = "-apple-system,'Segoe UI',Helvetica,Arial,sans-serif"


def _frame(width: int, body: str, label: str) -> str:
    title = escape(label)
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="28" '
        f'viewBox="0 0 {width} 28" role="img" aria-label="{title}">'
        f"<title>{title}</title>"
        f'<rect width="{width}" height="28" fill="{SLAB}"/>'
        f'<rect width="72" height="28" fill="{INK}"/>'
        f'<text x="11" y="18.5" fill="{SLAB}" font-family="{FONT}" font-size="11" '
        f'font-weight="700" letter-spacing="1.3">GITREP</text>'
        f"{body}</svg>"
    )


def render(score: int, statuses: list[str]) -> str:
    """A graded badge: the score, then one square per check in rubric order."""
    figure = f'<text x="81" y="19.5" fill="{INK}" font-family="{FONT}" font-size="15" font-weight="800">{int(score)}</text>'
    start = 112
    squares = []
    for index, status in enumerate(statuses):
        x = start + index * 9
        if status in MARK:
            squares.append(f'<rect x="{x}" y="10.5" width="7" height="7" fill="{MARK[status]}"/>')
        else:
            squares.append(f'<rect x="{x + 0.5}" y="11" width="6" height="6" fill="none" stroke="{INK}" stroke-opacity=".55"/>')
    width = start + len(statuses) * 9 + 6
    return _frame(width, figure + "".join(squares), f"GitRep: {int(score)} out of 100")


def unavailable(reason: str) -> str:
    """What a README shows when the repo cannot be graded right now."""
    text = escape(reason)
    width = 80 + len(reason) * 7
    body = f'<text x="81" y="18.5" fill="{INK}" font-family="{FONT}" font-size="11.5">{text}</text>'
    return _frame(width, body, f"GitRep: {reason}")
