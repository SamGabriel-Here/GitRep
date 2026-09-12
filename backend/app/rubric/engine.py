"""Runs the rubric and totals it, for one repository or a whole profile.

The checks live in `checks.py`; this module is what turns them into a report:
category subtotals, the score, the band, and the legacy suggestion list.
"""

from __future__ import annotations

from collections import Counter
from statistics import mean, median

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


def _habit_detail(failing: int, partial: int, total: int) -> str:
    if not failing and not partial:
        return f"Full marks in all {total}."
    if failing and partial:
        return f"Missing in {failing}, thin in {partial}, of {total}."
    if failing:
        return f"Missing in {failing} of {total}."
    return f"Thin in {partial} of {total}."


def analyse_profile(owner: dict, graded: list[tuple[dict, dict]], **counts) -> dict:
    """Aggregate a set of repo reports into one picture of a person's habits.

    Twenty separate scorecards tell you very little. What is worth knowing is
    which check you keep failing, so the report leads with the running total
    per check across the whole profile rather than per repository.
    """
    reports = [report for _, report in graded]
    scores = sorted(r["score"] for r in reports)
    total = len(reports)

    habits = []
    if total:
        for index, template in enumerate(rubric()):
            checks = [r["checks"][index] for r in reports]
            failing = sum(1 for c in checks if c["status"] == "fail")
            partial = sum(1 for c in checks if c["status"] == "partial")
            fixes = [c["fix"] for c in checks if c["fix"]]
            habits.append(
                {
                    "id": template["id"],
                    "label": template["label"],
                    "category": template["category"],
                    "category_label": template["category_label"],
                    "possible": template["possible"] * total,
                    "lost": sum(c["lost"] for c in checks),
                    "failing": failing,
                    "partial": partial,
                    "passing": total - failing - partial,
                    "detail": _habit_detail(failing, partial, total),
                    # The advice people see most often is the advice to lead with.
                    "fix": Counter(fixes).most_common(1)[0][0] if fixes else "",
                }
            )
        habits.sort(key=lambda h: (-h["lost"], h["label"]))

    average = round(mean(scores)) if scores else 0

    return {
        "kind": "profile",
        "owner": owner,
        "analysed": total,
        "average": average,
        "median": round(median(scores)) if scores else 0,
        "best": scores[-1] if scores else 0,
        "worst": scores[0] if scores else 0,
        "band": band(average),
        "habits": habits,
        "repos": [
            {
                "name": repo["name"],
                "url": repo["url"],
                "description": repo["description"],
                "language": repo["language"],
                "stars": repo["stars"],
                "pushed_at": repo["pushed_at"],
                "is_archived": repo["is_archived"],
                "score": report["score"],
                "band": report["band"],
                "categories": report["categories"],
                "checks": report["checks"],
            }
            for repo, report in sorted(graded, key=lambda g: -g[1]["score"])
        ],
        **counts,
    }
