"""
Turkish-locale-aware alphabetical sorting.

SQLite has no usable Turkish collation (NOCASE only folds ASCII A-Z), and
Python's built-in str.lower()/upper() don't follow Turkish casing rules
(dotless "I" folds to "i" in default Unicode casefolding, but in Turkish it
must fold to dotless "ı"; dotted "İ" must fold to dotted "i"). So we map each
character - upper and lower form - directly to a rank, instead of relying on
casefolding at all.
"""

# (uppercase, lowercase) pairs in Turkish alphabetical order.
_TURKISH_ALPHABET = [
    ("A", "a"), ("B", "b"), ("C", "c"), ("Ç", "ç"), ("D", "d"),
    ("E", "e"), ("F", "f"), ("G", "g"), ("Ğ", "ğ"), ("H", "h"),
    ("I", "ı"), ("İ", "i"), ("J", "j"), ("K", "k"), ("L", "l"),
    ("M", "m"), ("N", "n"), ("O", "o"), ("Ö", "ö"), ("P", "p"),
    ("R", "r"), ("S", "s"), ("Ş", "ş"), ("T", "t"), ("U", "u"),
    ("Ü", "ü"), ("V", "v"), ("Y", "y"), ("Z", "z"),
]

_RANK: dict[str, float] = {}
for _index, (_upper, _lower) in enumerate(_TURKISH_ALPHABET):
    _RANK[_upper] = _index
    _RANK[_lower] = _index

# Letters used in loanwords but not part of the Turkish alphabet - slot them
# in next to their closest phonetic neighbor so they don't disrupt sorting.
_RANK["Q"] = _RANK["P"] + 0.5
_RANK["q"] = _RANK["p"] + 0.5
_RANK["W"] = _RANK["V"] + 0.5
_RANK["w"] = _RANK["v"] + 0.5
_RANK["X"] = _RANK["V"] + 0.6
_RANK["x"] = _RANK["v"] + 0.6


_LOWER_MAP = {upper: lower for upper, lower in _TURKISH_ALPHABET}


def turkish_casefold(text: str) -> str:
    """Lowercase text using Turkish casing rules.

    Needed because Python's default str.lower() gets Turkish's dotted/
    dotless I wrong (see module docstring), which would otherwise break
    case-insensitive search - e.g. searching "corba" should still find
    "Çorbası", and SQLite's own LIKE/ILIKE only case-folds ASCII A-Z, so
    non-ASCII comparisons have to happen here in Python instead of in SQL.
    """
    if text is None:
        return ""
    return "".join(_LOWER_MAP.get(ch, ch.lower()) for ch in text)


def turkish_sort_key(text: str) -> tuple:
    """Sort key that orders text per the Turkish alphabet.

    Characters outside the mapped alphabet (digits, punctuation, spaces,
    other scripts) fall back to a rank derived from their code point, placed
    after all Turkish letters, so they don't crash sorting and stay in a
    stable relative order.
    """
    if text is None:
        return ()
    return tuple(_RANK.get(ch, 1000 + ord(ch)) for ch in text)
