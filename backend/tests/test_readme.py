from app.rubric.readme import parse


def test_empty_readme_is_absent():
    assert parse("").present is False
    assert parse(None).present is False
    assert parse("   \n  ").present is False


def test_code_fences_do_not_leak_into_prose():
    doc = parse("Intro text.\n\n```bash\npip install flask\n```\n\nOutro.")
    assert "pip install flask" not in doc.prose
    assert "Intro text." in doc.prose
    assert len(doc.code_blocks) == 1
    assert doc.code_blocks[0] == "bash"


def test_unclosed_fence_still_counts_as_code():
    doc = parse("# Title\n\n```\nnpm run dev\n")
    assert len(doc.code_blocks) == 1
    assert "npm run dev" not in doc.prose


def test_badges_are_not_screenshots():
    doc = parse(
        "![build](https://img.shields.io/badge/build-passing-green)\n"
        "![CI](https://github.com/o/r/actions/workflows/ci.yml/badge.svg)\n"
    )
    assert len(doc.badges) == 2
    assert doc.real_images == []


def test_real_screenshots_are_recognised():
    doc = parse("![app](docs/screenshot.png)\n<img src='https://raw.githubusercontent.com/o/r/main/demo.gif'>")
    assert len(doc.real_images) == 2
    assert any(img.is_motion for img in doc.real_images)


def test_badge_urls_do_not_inflate_word_count():
    badge_wall = "\n".join(
        f"[![metric{i}](https://img.shields.io/badge/a-{i}-blue)](https://example.com/{i})" for i in range(40)
    )
    doc = parse(badge_wall + "\n\nA short line.")
    assert doc.words < 20


def test_setext_headings_are_found():
    doc = parse("Project\n=======\n\nInstallation\n------------\n\nrun it")
    assert [h.level for h in doc.headings] == [1, 2]
    assert doc.headings[1].text == "Installation"


def test_section_knows_whether_it_contains_code():
    doc = parse("## Install\n\n```\nnpm i\n```\n\n## Usage\n\nJust use it.")
    install = doc.sections[0]
    usage = doc.sections[1]
    assert install.has_code is True
    assert usage.has_code is False


def test_html_comments_are_ignored():
    doc = parse("<!-- TODO: write something about installation -->\nReal text.")
    assert "TODO" not in doc.prose


def test_link_text_survives_but_url_does_not():
    doc = parse("See the [installation guide](https://example.com/install-now).")
    assert "installation guide" in doc.prose
    assert "example.com" not in doc.prose


def test_demo_links_are_detected():
    doc = parse("Live at [the demo](https://gitrep.vercel.app) and [source](https://github.com/o/r).")
    assert doc.demo_links == ["https://gitrep.vercel.app"]


def test_a_section_owns_its_subsections():
    doc = parse("## Example\n\nWords.\n\n### Create it\n\n```py\nrun()\n```\n\n## Other\n\nNo code.")
    example = doc.find_section((__import__("re").compile("example"),))
    assert example.has_code is True


def test_best_matching_section_wins_over_document_order():
    import re

    doc = parse("## Requirements\n\nPython 3.12.\n\n## Installation\n\n```bash\npip install x\n```\n")
    patterns = (re.compile(r"\brequirements?\b"), re.compile(r"\binstall(?:ation)?\b"))
    assert doc.find_section(patterns).heading.text == "Installation"


def test_badges_in_a_heading_are_not_heading_words():
    """React's H1 is its title plus a row of badge images.

    Left in, the alt text becomes heading words, and a heading reading
    "React ... GitHub license ... Build Status" can match a setup pattern. The
    project title then counts as an install section.
    """
    doc = parse(
        "# React &middot; ![GitHub license](https://img.shields.io/badge/l-MIT-blue) "
        "[![Build Status](https://img.shields.io/badge/build-passing-green)](https://ci.example.com)\n\n"
        "Some prose.\n"
    )
    assert doc.headings[0].text == "React"


def test_html_entities_do_not_survive_in_a_heading():
    assert parse("## Setup &amp; teardown\n\ntext\n").headings[0].text == "Setup teardown"


# ---------- source lines: evidence has to point at the README people wrote ----------

LINED = """# Title
<!-- a comment
that spans two lines -->

```bash
pip install one
pip install two
```

Setup
-----

![shot](docs/shot.png)
See [the demo](https://thing.vercel.app).

```js
run()
```
"""


def test_headings_keep_their_source_line_past_fences_comments_and_setext():
    doc = parse(LINED)
    assert [(h.text, h.source) for h in doc.headings] == [("Title", 1), ("Setup", 10)]


def test_code_blocks_are_found_at_their_opening_fence():
    doc = parse(LINED)
    assert doc.code_lines == [5, 16]


def test_images_and_links_know_their_line():
    doc = parse(LINED)
    assert doc.real_images[0].line == 13
    assert doc.link_lines[doc.links.index("https://thing.vercel.app")] == 14


def test_line_text_reads_the_original_markdown():
    doc = parse(LINED)
    assert doc.line_text(5) == "```bash"
    assert doc.line_text(999) == ""


def test_a_badge_host_on_a_deploy_domain_is_neither_screenshot_nor_demo():
    """nanoGPT's Discord badge lives on dcbadge.vercel.app. It was scored as a
    screenshot and as a live demo link; it is neither."""
    doc = parse("[![](https://dcbadge.vercel.app/api/server/abc?style=flat)](https://discord.gg/abc)\n")
    assert doc.real_images == []
    assert len(doc.badges) == 1
    assert doc.demo_links == []


def test_a_real_demo_link_still_counts():
    doc = parse("Try it at [the site](https://thing.vercel.app).")
    assert doc.demo_links == ["https://thing.vercel.app"]
