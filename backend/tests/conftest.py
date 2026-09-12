import sys
from pathlib import Path

# Lets the tests import `app.*` without installing the package.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
