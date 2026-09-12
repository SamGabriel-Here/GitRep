import pytest

from app.github.repo_url import parse_repo_url


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
