"""Every environment-driven setting, in one place.

Read through functions rather than module constants so tests and a running
server both see changes to the environment without a reimport.
"""

from __future__ import annotations

import os

GITHUB_API = "https://api.github.com"

# Seconds a repo's data stays cached before we ask GitHub again.
CACHE_TTL = 300

# Total and connect timeouts for a single GitHub request.
REQUEST_TIMEOUT = 10.0
CONNECT_TIMEOUT = 5.0


def github_token() -> str | None:
    """A personal access token lifts the rate limit from 60/hour to 5,000."""
    return os.getenv("GITHUB_TOKEN") or None
