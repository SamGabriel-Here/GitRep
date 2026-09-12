from datetime import datetime, timedelta, timezone

import pytest

from app.github.repo_url import parse_repo_url
from app.rubric import engine


def repo(**overrides):
    base = {
        "description": "A small tool that grades README files.",
        "topics": ["python", "github", "readme"],
        "license": "MIT",
        "homepage": "https://gitrep.onrender.com",
        "pushed_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "has_workflows": True,
        "has_contributing": True,
        "has_tests": True,
    }
    base.update(overrides)
    return base


def by_id(report, check_id):
    return next(c for c in report["checks"] if c["id"] == check_id)


GOOD_README = """
# Project

A tool that reads your repository and tells you what is missing from it.

![screenshot](docs/shot.png)
![flow](docs/flow.png)

## Installation

```bash
pip install project
```

## Usage

```python
from project import run
run("owner/repo")
```

## Testing

```bash
pytest
```

## Contributing

Open a pull request.

## License

MIT.
""" + ("Extra prose to clear the depth threshold. " * 90)


def test_rubric_is_exactly_one_hundred_points():
    assert sum(check["possible"] for check in engine.rubric()) == 100


def test_a_well_documented_repo_scores_full_marks():
    report = engine.analyse(GOOD_README, repo())
    assert report["score"] == 100
    assert report["band"] == "exemplary"
    assert report["suggestions"] == []
    assert all(c["status"] == "pass" for c in report["checks"])


def test_missing_readme_loses_every_documentation_point():
    report = engine.analyse(None, repo())
    docs = next(c for c in report["categories"] if c["id"] == "documentation")
    assert docs["earned"] == 0
    assert by_id(report, "readme_depth")["status"] == "fail"


def test_score_never_leaves_the_zero_to_hundred_range():
    empty = engine.analyse(None, {})
    assert 0 <= empty["score"] <= 100
    assert empty["score"] == 0


def test_uninstall_does_not_count_as_install_instructions():
    readme = "# Tool\n\n## Uninstall\n\nDelete the folder.\n"
    report = engine.analyse(readme, repo())
    assert by_id(report, "install")["status"] == "fail"


def test_install_mentioned_only_in_a_code_sample_does_not_count():
    readme = "# Tool\n\nSome prose about the thing.\n\n```bash\npip install tool\n```\n"
    report = engine.analyse(readme, repo())
    assert by_id(report, "install")["earned"] == 0


def test_heading_without_commands_earns_partial_credit():
    readme = "# Tool\n\n## Installation\n\nIt is fairly straightforward, honestly.\n"
    check = by_id(engine.analyse(readme, repo()), "install")
    assert check["status"] == "partial"
    assert 0 < check["earned"] < check["possible"]
    assert check["fix"]


def test_heading_with_commands_earns_full_credit():
    readme = "# Tool\n\n## Installation\n\n```bash\npip install tool\n```\n"
    assert by_id(engine.analyse(readme, repo()), "install")["status"] == "pass"


def test_a_wall_of_badges_is_not_a_screenshot():
    badges = "\n".join(f"![b{i}](https://img.shields.io/badge/x-{i}-blue)" for i in range(8))
    check = by_id(engine.analyse(f"# Tool\n{badges}\n", repo()), "media")
    assert check["status"] == "partial"
    assert check["earned"] == 2


def test_badge_heavy_readme_is_still_judged_thin():
    badges = "\n".join(f"[![b{i}](https://img.shields.io/badge/x-{i}-blue)](https://e.com)" for i in range(50))
    check = by_id(engine.analyse(f"# Tool\n{badges}\n\nShort.\n", repo()), "readme_depth")
    assert check["earned"] <= 5


@pytest.mark.parametrize(
    "days,expected",
    [(1, 10), (60, 10), (120, 8), (300, 6), (500, 3), (1200, 0)],
)
def test_recency_is_graded_not_binary(days, expected):
    pushed = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat().replace("+00:00", "Z")
    assert by_id(engine.analyse(GOOD_README, repo(pushed_at=pushed)), "recency")["earned"] == expected


def test_one_word_description_earns_partial_credit():
    check = by_id(engine.analyse(GOOD_README, repo(description="tool")), "description")
    assert check["status"] == "partial"


def test_unrecognised_license_sits_between_none_and_mit():
    none = by_id(engine.analyse(GOOD_README, repo(license=None)), "license")["earned"]
    other = by_id(engine.analyse(GOOD_README, repo(license="NOASSERTION")), "license")["earned"]
    mit = by_id(engine.analyse(GOOD_README, repo(license="MIT")), "license")["earned"]
    assert none < other < mit


def test_readme_demo_link_scores_below_a_set_homepage():
    with_field = by_id(engine.analyse(GOOD_README, repo()), "homepage")["earned"]
    link_only = by_id(
        engine.analyse(GOOD_README + "\nLive: https://x.vercel.app\n[demo](https://x.vercel.app)", repo(homepage=None)),
        "homepage",
    )["earned"]
    nothing = by_id(engine.analyse(GOOD_README, repo(homepage=None)), "homepage")["earned"]
    assert nothing < link_only < with_field


def test_categories_add_up_to_the_score():
    report = engine.analyse(GOOD_README, repo(topics=[], license=None))
    assert sum(c["earned"] for c in report["categories"]) == report["score"]


def test_every_failing_check_offers_a_fix():
    report = engine.analyse("# Nothing here\n", repo(description=None, topics=[], license=None, homepage=None))
    for check in report["checks"]:
        if check["status"] != "pass":
            assert check["fix"], f"{check['id']} has no fix text"


def test_suggestions_are_ordered_by_points_lost():
    report = engine.analyse("# Nothing\n", repo(description=None, topics=[], license=None, homepage=None))
    losses = [c["lost"] for c in sorted(report["checks"], key=lambda c: -c["lost"]) if c["fix"]]
    assert losses == sorted(losses, reverse=True)
    assert len(report["suggestions"]) == len(losses)


def test_setup_heading_beats_deployment_heading():
    readme = (
        "# Tool\n\n## Running it locally\n\n### Start the API\n\n```bash\nuvicorn main:app\n```\n"
        "\n## Deployment\n\nUse the blueprint.\n"
    )
    assert by_id(engine.analyse(readme, repo()), "install")["status"] == "pass"


@pytest.mark.parametrize(
    "heading",
    ["Run locally", "Running locally", "Running it locally", "How to run this locally"],
)
def test_local_run_headings_all_count_as_setup(heading):
    readme = f"# Tool\n\n## {heading}\n\n```bash\nnpm run dev\n```\n"
    assert by_id(engine.analyse(readme, repo()), "install")["earned"] == 12
