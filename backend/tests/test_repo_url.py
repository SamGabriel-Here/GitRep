import pytest

from app.github.repo_url import parse_repo_url, parse_target


@pytest.mark.parametrize(
    "value",
    [
        "https://github.com/owner/repo",
        "http://github.com/owner/repo",
        "github.com/owner/repo",
        "www.github.com/owner/repo/",
        "https://github.com/owner/repo.git",
        "https://github.com/owner/repo/tree/main/src",
        "git@github.com:owner/repo.git",
        "owner/repo",
        "  owner/repo  ",
    ],
)
def test_url_shapes_all_resolve_to_the_same_repo(value):
    assert parse_repo_url(value) == ("owner", "repo")


@pytest.mark.parametrize("value", ["", "   ", "not a url", "https://gitlab.com/owner/repo", "https://github.com/owner"])
def test_rubbish_input_is_rejected(value):
    with pytest.raises(ValueError):
        parse_repo_url(value)


@pytest.mark.parametrize(
    "value,login",
    [
        ("owner", "owner"),
        ("  owner  ", "owner"),
        ("github.com/owner", "owner"),
        ("https://github.com/owner", "owner"),
        ("https://www.github.com/owner/", "owner"),
        ("https://github.com/owner?tab=repositories", "owner"),
    ],
)
def test_a_single_segment_is_a_profile(value, login):
    target = parse_target(value)
    assert target.kind == "profile"
    assert target.owner == login
    assert target.repo is None


@pytest.mark.parametrize("value", ["owner/repo", "https://github.com/owner/repo", "git@github.com:owner/repo.git"])
def test_two_segments_always_win_over_a_profile(value):
    target = parse_target(value)
    assert target.kind == "repo"
    assert target.label == "owner/repo"


def test_parse_repo_url_rejects_a_profile():
    with pytest.raises(ValueError):
        parse_repo_url("owner")
