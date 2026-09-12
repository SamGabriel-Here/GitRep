"""Runs the rubric and totals it.

The checks live in `checks.py`; this module is what turns them into a report:
category subtotals, the score, the band, and the legacy suggestion list.
"""

from __future__ import annotations

from app.rubric.checks import CHECKS
from app.rubric.readme import parse

CATEGORIES = {
    "documentation": "Documentation",
    "discovery": "Discoverability",
    "trust": "Trust signals",
    "upkeep": "Upkeep",
}


def rubric() -> list[dict]:
    """The checks and their weights, with no repo attached."""
    blank = parse("")
    return [
        {
            "id": c.id,
            "category": c.category,
            "category_label": CATEGORIES[c.category],
            "label": c.label,
            "possible": c.possible,
        }
        for c in (check(blank, {}) for check in CHECKS)
    ]


def band(score: int) -> str:
    if score >= 85:
        return "exemplary"
    if score >= 60:
        return "solid"
    return "needs work"


def analyse(readme_text: str | None, repo: dict) -> dict:
    readme = parse(readme_text)
    results = [check(readme, repo) for check in CHECKS]
    score = sum(c.earned for c in results)

    categories = []
    for key, label in CATEGORIES.items():
        members = [c for c in results if c.category == key]
        categories.append(
            {
                "id": key,
                "label": label,
                "earned": sum(c.earned for c in members),
                "possible": sum(c.possible for c in members),
            }
        )

    # Kept so older clients of this API keep working.
    suggestions = [c.fix for c in sorted(results, key=lambda c: -c.lost) if c.fix]

    return {
        "score": score,
        "band": band(score),
        "categories": categories,
        "checks": [c.as_dict() for c in results],
        "suggestions": suggestions,
        "readme": {
            "present": readme.present,
            "words": readme.words,
            "headings": len(readme.headings),
            "code_blocks": len(readme.code_blocks),
            "images": len(readme.real_images),
            "badges": len(readme.badges),
        },
    }
