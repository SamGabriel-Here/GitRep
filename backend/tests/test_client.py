import asyncio

import httpx
import pytest

from app.github import client
from app.github.client import GitHubError


def response(status, headers=None):
    return httpx.Response(status, headers=headers or {}, request=httpx.Request("GET", "https://api.github.com/x"))


def test_a_404_is_a_genuine_absence():
    assert client._is_rate_limited(response(404)) is False


def test_a_403_with_requests_left_is_a_permission_problem_not_a_limit():
    assert client._is_rate_limited(response(403, {"X-RateLimit-Remaining": "17"})) is False


@pytest.mark.parametrize("status", [403, 429])
def test_an_exhausted_limit_is_recognised(status):
    assert client._is_rate_limited(response(status, {"X-RateLimit-Remaining": "0"})) is True


def test_the_limit_error_says_when_to_come_back():
    import time

    res = response(429, {"X-RateLimit-Remaining": "0", "X-RateLimit-Reset": str(int(time.time()) + 600)})
    error = client._rate_limit_error(res)
    assert error.status_code == 429
    assert "rate limit" in error.detail.lower()
    assert "minute" in error.detail


def _side_files_returning(monkeypatch, res):
    """Run _fetch_side_files with every GitHub call answered by `res`.

    Driven through asyncio.run rather than an async test so the suite needs no
    pytest plugin beyond pytest itself.
    """

    async def fake_get(_client, _path):
        return res

    monkeypatch.setattr(client, "_get", fake_get)
    return asyncio.run(client._fetch_side_files(None, "owner", "repo"))


def test_running_out_mid_fetch_raises_instead_of_reporting_no_readme(monkeypatch):
    """The bug this guards: a 429 on the README read as "no README", so a
    well-documented repo scored as undocumented and the report came back
    confidently wrong rather than honestly missing."""
    with pytest.raises(GitHubError) as caught:
        _side_files_returning(monkeypatch, response(429, {"X-RateLimit-Remaining": "0"}))
    assert caught.value.status_code == 429


def test_an_ordinary_missing_readme_still_degrades_quietly(monkeypatch):
    readme, root, workflows = _side_files_returning(monkeypatch, response(404))
    assert readme is None
    assert root == set()
    assert workflows is False
