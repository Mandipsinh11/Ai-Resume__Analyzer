"""
section_detector.py
===================
Takes the clean text from extractor.py and splits it into
labelled sections: Summary, Experience, Education, Skills, etc.

HOW IT WORKS (2 strategies):
    1) Existing line-based header matching and slicing.
    2) Span-based header detection fallback for PDFs where text
       extraction removes/flatten line breaks.

Requirements met:
  - Preserves existing line-based logic.
  - Never returns an empty dict when resume text exists.
  - If nothing is detected, returns {"other": raw_text}.
"""

import re


# ─────────────────────────────────────────────────────────────────────
# SECTION LABEL MAP
# ─────────────────────────────────────────────────────────────────────

SECTION_PATTERNS = {
    "summary": [
        r"(professional\s+)?summary",
        r"objective",
        r"profile",
        r"about\s+me",
        r"career\s+objective",
        r"professional\s+profile",
    ],
    "experience": [
        r"(work\s+)?experience",
        r"employment(\s+history)?",
        r"work\s+history",
        r"professional\s+experience",
        r"internship(s)?",
        r"positions?\s+held",
        r"career\s+history",
    ],
    "education": [
        r"education(\s+&\s+training)?",
        r"educational\s+background",
        r"academic(s)?(\s+background)?",
        r"qualifications?",
        r"schooling",
        r"degrees?",
    ],
    "skills": [
        r"(technical\s+)?skills?",
        r"core\s+competencies",
        r"competencies",
        r"technologies",
        r"tech\s+stack",
        r"tools?\s+&\s+technologies",
        r"programming\s+languages?",
        r"expertise",
    ],
    "projects": [
        r"projects?",
        r"personal\s+projects?",
        r"academic\s+projects?",
        r"key\s+projects?",
        r"portfolio",
    ],
    "certifications": [
        r"certifications?",
        r"certificates?",
        r"licenses?\s+&\s+certifications?",
        r"professional\s+development",
        r"courses?(\s+&\s+certifications?)?",
    ],
    "achievements": [
        r"achievements?",
        r"accomplishments?",
        r"awards?(\s+&\s+honors?)?",
        r"honors?",
        r"recognitions?",
    ],
    "languages": [
        r"languages?",
        r"language\s+proficiency",
    ],
    "volunteer": [
        r"volunteer(ing)?(\s+experience)?",
        r"community\s+service",
        r"social\s+work",
    ],
    "references": [
        r"references?",
        r"referees?",
    ],
}


# Pre-compile all patterns for the existing line-based logic.
_COMPILED_PATTERNS = {
    label: [
        re.compile(r"^\s*" + pat + r"\s*:?\s*$", re.IGNORECASE)
        for pat in patterns
    ]
    for label, patterns in SECTION_PATTERNS.items()
}


# Pre-compile span-based detection patterns.
# We try to match headers even if they are embedded in flattened PDF text.
# Strategy: allow optional punctuation/whitespace around the header token
# and treat boundaries conservatively.
_SPAN_PATTERNS = {}
for label, patterns in SECTION_PATTERNS.items():
    compiled = []
    for pat in patterns:
        # Use a flexible whitespace matcher and allow colon / dashes.
        # Boundary notes:
        #   - We use lookarounds to avoid matching inside longer words.
        #   - We keep it permissive about whitespace/newlines because PDFs often flatten.
        span_re = re.compile(
            r"(?<![A-Za-z0-9])" + pat + r"(?![A-Za-z0-9])",
            re.IGNORECASE,
        )
        compiled.append(span_re)
    _SPAN_PATTERNS[label] = compiled


# ─────────────────────────────────────────────────────────────────────
# PUBLIC: detect_sections
# ─────────────────────────────────────────────────────────────────────

def detect_sections(text: str) -> dict:  # type: ignore
    """Return labelled resume sections.

    - Preserves existing line-based detection.
    - Adds span-based fallback for flattened PDF extraction.
    - Never returns an empty dict when input text exists.
    - If no sections are detected, returns {"other": raw_text}.

    Output always includes: "_header_block" (may be empty).
    """

    raw_text = text or ""
    if not raw_text.strip():
        return {"other": raw_text}

    # 1) Existing line-based detection
    lines = raw_text.splitlines()
    header_positions = _find_headers(lines)  # type: ignore

    if not header_positions:
        header_positions = _find_headers_loose(lines)  # type: ignore

    sections = _slice_sections(lines, header_positions)  # type: ignore
    header_block = _extract_header_block(lines, header_positions)
    sections["_header_block"] = header_block

    meaningful_keys = {
        "summary",
        "experience",
        "education",
        "skills",
        "projects",
        "certifications",
        "achievements",
    }

    detected_meaningful = any(
        k in sections and isinstance(sections.get(k), str) and sections.get(k, "").strip()
        for k in meaningful_keys
    )

    # 2) Span-based fallback for flattened PDFs
    if not detected_meaningful:
        span_sections, span_header_block = _detect_sections_by_spans(raw_text)

        span_meaningful = any(
            k in span_sections and isinstance(span_sections.get(k), str) and span_sections.get(k, "").strip()
            for k in meaningful_keys
        )

        if span_meaningful:
            span_sections["_header_block"] = span_header_block
            return span_sections  # type: ignore

    # 3) Guarantee non-empty output
    if not sections or all(
        (k != "_header_block" and not (v or "").strip()) for k, v in sections.items()
    ):
        return {"other": raw_text}

    return sections  # type: ignore


# ─────────────────────────────────────────────────────────────────────
# LINE-BASED HEADER DETECTION (existing logic preserved)
# ─────────────────────────────────────────────────────────────────────

def _find_headers(lines: list) -> list:  # type: ignore
    """Scan each line and check if it matches a section header pattern."""
    found = []

    for i, line in enumerate(lines):  # type: ignore
        stripped = line.strip()  # type: ignore

        # Headers are short (not a full sentence)
        if len(stripped) == 0 or len(stripped) > 60:  # type: ignore
            continue

        matched = False
        for label, compiled_list in _COMPILED_PATTERNS.items():
            for pattern in compiled_list:
                if pattern.match(stripped):  # type: ignore
                    found.append((i, label))  # type: ignore
                    matched = True
                    break
            if matched:
                break

    return found  # type: ignore


def _find_headers_loose(lines: list) -> list:  # type: ignore
    """Fallback: looks for ALL-CAPS short lines as likely headers."""
    found = []

    for i, line in enumerate(lines):  # type: ignore
        stripped = line.strip()  # type: ignore
        if len(stripped) == 0 or len(stripped) > 40:  # type: ignore
            continue

        # All caps line with at least 3 chars = likely a header
        if stripped.isupper() and len(stripped) >= 3:  # type: ignore
            label = _map_to_label(stripped.lower())  # type: ignore
            found.append((i, label))  # type: ignore

    return found  # type: ignore


def _map_to_label(text: str) -> str:
    """Maps a lowercased header string to a known label, or 'other'."""
    for label, patterns in SECTION_PATTERNS.items():
        for pat in patterns:
            if re.search(pat, text, re.IGNORECASE):
                return label
    return "other"


# ─────────────────────────────────────────────────────────────────────
# LINE-BASED SLICING (existing logic)
# ─────────────────────────────────────────────────────────────────────

def _slice_sections(lines: list, header_positions: list) -> dict:  # type: ignore
    """Slice lines array between consecutive headers."""
    sections = {}

    if not header_positions:
        sections["other"] = "\n".join(lines)  # type: ignore
        return sections  # type: ignore

    for idx, (line_num, label) in enumerate(header_positions):  # type: ignore
        start = line_num + 1  # content starts AFTER header

        if idx + 1 < len(header_positions):  # type: ignore
            end = header_positions[idx + 1][0]  # type: ignore
        else:
            end = len(lines)

        content_lines = [l.strip() for l in lines[start:end] if l.strip()]  # type: ignore
        content = "\n".join(content_lines)  # type: ignore

        if label in sections:
            sections[label] = sections[label] + "\n" + content
        else:
            sections[label] = content

    return sections  # type: ignore


def _extract_header_block(lines: list, header_positions: list) -> str:  # type: ignore
    """Extract everything BEFORE the first section header."""
    if not header_positions:
        return "\n".join(lines[:10])  # type: ignore

    first_header_line = header_positions[0][0]  # type: ignore
    block = [l.strip() for l in lines[:first_header_line] if l.strip()]  # type: ignore
    return "\n".join(block)  # type: ignore


# ─────────────────────────────────────────────────────────────────────
# SPAN-BASED FALLBACK
# ─────────────────────────────────────────────────────────────────────

def _detect_sections_by_spans(text: str) -> tuple:  # type: ignore
    """Detect section headers by searching the whole text.

    Returns:
      (sections_dict, header_block_str)

    Sections are sliced using character indices.
    """

    # Normalize whitespace a bit but keep original text for slicing.
    # We do NOT discard all newlines; this still helps with most PDFs.
    normalized = re.sub(r"[\t\r]+", " ", text)

    matches = []  # (start_idx, end_idx, label)

    # Find all header matches for known labels
    for label, patterns in _SPAN_PATTERNS.items():
        for pat in patterns:
            for m in pat.finditer(normalized):
                start, end = m.start(), m.end()
                # Avoid pathological matches (e.g., too frequent short tokens)
                # Keep only reasonably spaced matches.
                if end - start < 3:
                    continue
                matches.append((start, end, label))

    if not matches:
        return {"other": text}, ""

    # Sort by position; de-duplicate overlaps by keeping the earliest match.
    matches.sort(key=lambda x: (x[0], -(x[1] - x[0])))

    deduped = []
    last_start = None
    for start, end, label in matches:
        if last_start is not None and abs(start - last_start) < 2:
            # same header region; keep the longer match by label occurrence
            if deduped:
                prev = deduped[-1]
                if (end - start) > (prev[1] - prev[0]):
                    deduped[-1] = (start, end, label)
            continue
        deduped.append((start, end, label))
        last_start = start

    # Slice by start/end indices. Content starts after header match end.
    sections = {}
    first_header_start = deduped[0][0]
    header_block = normalized[:first_header_start].strip()

    for i, (start, end, label) in enumerate(deduped):
        content_start = end
        content_end = deduped[i + 1][0] if i + 1 < len(deduped) else len(normalized)
        content = normalized[content_start:content_end].strip()

        if not content:
            continue

        # Ensure we only use known labels; map others to "other"
        if label not in SECTION_PATTERNS:
            label = "other"

        if label in sections:
            sections[label] = sections[label] + "\n" + content
        else:
            sections[label] = content

    if not sections:
        sections = {"other": text}

    return sections, header_block


# ─────────────────────────────────────────────────────────────────────
# QUICK TEST
# ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    sample = """
John Doe
john.doe@email.com | +91-9876543210 | LinkedIn: linkedin.com/in/johndoe
Ahmedabad, Gujarat

SUMMARY
Final year B.Tech Computer Science student with experience in
Python, Django, and REST API development. Passionate about ML.

EXPERIENCE
Software Development Intern — TechCorp, Ahmedabad
June 2024 – August 2024
- Built REST APIs using FastAPI and PostgreSQL
- Reduced query time by 40% through indexing

EDUCATION
B.Tech Computer Science Engineering
GCET, Vallabh Vidyanagar — 2021–2025  CGPA: 8.4

SKILLS
Python, Django, FastAPI, PostgreSQL, MySQL
Git, Docker, Linux, VS Code
Machine Learning, NLP, scikit-learn

PROJECTS
Resume Analyzer — NLP-based resume scoring tool
Built an NLP pipeline using spaCy and sentence-transformers

CERTIFICATIONS
AWS Cloud Practitioner — Amazon Web Services, 2024
Python for Data Science — Coursera, 2023

ACHIEVEMENTS
Dean's List (example)
"""

    print(detect_sections(sample))

