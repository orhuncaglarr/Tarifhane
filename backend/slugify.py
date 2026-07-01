import re
from typing import Callable

_TR_MAP = str.maketrans({
    "ç": "c", "Ç": "c",
    "ğ": "g", "Ğ": "g",
    "ı": "i", "I": "i",
    "İ": "i", "i": "i",
    "ö": "o", "Ö": "o",
    "ş": "s", "Ş": "s",
    "ü": "u", "Ü": "u",
})

_NON_SLUG_CHARS = re.compile(r"[^a-z0-9]+")


def slugify(text: str) -> str:
    ascii_ish = text.translate(_TR_MAP).lower()
    slug = _NON_SLUG_CHARS.sub("-", ascii_ish).strip("-")
    return slug or "kayit"


def unique_slug(base_text: str, slug_exists: Callable[[str], bool]) -> str:
    """Append -2, -3, ... to the base slug until slug_exists(candidate) is False."""
    base = slugify(base_text)
    candidate = base
    suffix = 2
    while slug_exists(candidate):
        candidate = f"{base}-{suffix}"
        suffix += 1
    return candidate
