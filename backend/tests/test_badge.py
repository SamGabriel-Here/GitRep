import pytest
from fastapi.testclient import TestClient

from app import badge, main
from app.github.client import Fetched, GitHubError

STATUSES = ["pass"] * 6 + ["fail", "partial", "pass", "fail", "partial"]


def test_the_badge_carries_the_score_and_one_mark_per_check():
    svg = badge.render(81, STATUSES)
    assert ">81<" in svg
    assert svg.count("<rect") == 2 + len(STATUSES)
    assert 'aria-label="GitRep: 81 out of 100"' in svg


def test_a_failed_check_is_drawn_hollow_not_coloured():
    svg = badge.render(0, ["fail"])
    assert 'fill="none"' in svg
    assert badge.MARK["pass"] not in svg


def test_an_unavailable_badge_escapes_its_reason():
    svg = badge.unavailable("<script>")
    assert "<script>" not in svg
    assert "&lt;script&gt;" in svg


@pytest.fixture
def client(monkeypatch):
    async def fake_fetch(owner, repo):
        if repo == "missing":
            raise GitHubError(404, "gone")
        return Fetched(
            {"description": "A thing that does things well.", "topics": [], "license": "MIT", "pushed_at": None},
            "# Title\n\nSome words.",
            None,
        )

    monkeypatch.setattr(main, "fetch", fake_fetch)
    return TestClient(main.app)


def test_the_route_serves_a_cacheable_svg(client):
    res = client.get("/api/badge/owner/repo.svg")
    assert res.status_code == 200
    assert res.headers["content-type"].startswith("image/svg+xml")
    assert "max-age=3600" in res.headers["cache-control"]
    assert "GitRep:" in res.text


def test_a_missing_repo_still_answers_with_an_image(client):
    res = client.get("/api/badge/owner/missing.svg")
    assert res.status_code == 200
    assert "repo not found" in res.text
    assert "max-age=300" in res.headers["cache-control"]


def test_a_repo_name_with_dots_survives_the_route(client):
    assert client.get("/api/badge/owner/my.repo.name.svg").status_code == 200
