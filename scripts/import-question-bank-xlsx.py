"""Replace the question library with the rows from the maintained Excel question bank.

The workbook is the source of truth for the category, theme, difficulty, question,
nine accepted answers, and bomb.  Rows are deliberately never deduplicated or
editorially changed by this importer.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import unicodedata
import zipfile
from collections import Counter, defaultdict
from datetime import UTC, datetime
from pathlib import Path
from xml.etree import ElementTree as ET


ROOT = Path(__file__).resolve().parents[1]
THEMES_ROOT = ROOT / "content" / "themes"
MAIN_NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
NS = {"m": MAIN_NS}
HEADERS = [
    "Grande catégorie",
    "Thème",
    "Difficulté",
    "Question",
    *[f"Réponse {index}" for index in range(1, 10)],
    "Bombe",
    "Nouvelle question",
]
DIFFICULTIES = {
    "Facile": (1, "easy", 25, 25, 88, 25, 88, 8),
    "Moyen": (2, "medium", 55, 50, 72, 55, 82, 6),
    "Difficile": (3, "hard", 80, 70, 60, 78, 76, 4),
}


def normalize(value: str) -> str:
    """Match the app's answer normalization, retaining symbol-only answers."""
    normalized = "".join(
        character
        for character in unicodedata.normalize("NFD", value)
        if not unicodedata.combining(character)
    ).lower()
    normalized = normalized.replace("’", " ").replace("'", " ")
    normalized = re.sub(r"[^\w]+", " ", normalized, flags=re.UNICODE)
    normalized = normalized.replace("_", " ").strip()
    return re.sub(r"\s+", " ", normalized)


def stored_normalized(value: str) -> str:
    # Emoji answers are valid game answers. The regular text normalizer intentionally
    # drops symbols, so retain the original display value when it would become empty.
    return normalize(value) or unicodedata.normalize("NFC", value).strip()


def answer_fingerprint(answers: list[dict]) -> str:
    canonical = sorted(normalize(answer["normalized"]) for answer in answers)
    return hashlib.sha256("\x1f".join(canonical).encode("utf-8")).hexdigest()


def excel_column_index(reference: str) -> int:
    letters = "".join(character for character in reference if character.isalpha())
    index = 0
    for character in letters:
        index = index * 26 + ord(character.upper()) - ord("A") + 1
    return index - 1


def cell_value(cell: ET.Element, shared_strings: list[str]) -> str:
    cell_type = cell.attrib.get("t")
    if cell_type == "inlineStr":
        return "".join(text.text or "" for text in cell.findall(".//m:t", NS))
    value = cell.find("m:v", NS)
    if value is None or value.text is None:
        return ""
    if cell_type == "s":
        return shared_strings[int(value.text)]
    return value.text


def read_rows(source: Path) -> list[list[str]]:
    with zipfile.ZipFile(source) as workbook:
        shared_root = ET.fromstring(workbook.read("xl/sharedStrings.xml"))
        shared_strings = [
            "".join(text.text or "" for text in entry.iter(f"{{{MAIN_NS}}}t"))
            for entry in shared_root
        ]
        sheet = ET.fromstring(workbook.read("xl/worksheets/sheet1.xml"))
    rows: list[list[str]] = []
    for row in sheet.findall(".//m:sheetData/m:row", NS):
        values = [""] * len(HEADERS)
        for cell in row.findall("m:c", NS):
            column = excel_column_index(cell.attrib["r"])
            if column < len(values):
                values[column] = unicodedata.normalize("NFC", cell_value(cell, shared_strings))
        rows.append(values)
    return rows


def title_from(question: str) -> str:
    title = re.sub(r"^Cite 9\s+", "", question, flags=re.IGNORECASE).rstrip(".")
    return title if len(title) <= 48 else f"{title[:45].rstrip()}…"


def load_themes() -> tuple[dict[str, tuple[Path, dict]], dict[str, tuple[Path, dict]]]:
    by_label: dict[str, tuple[Path, dict]] = {}
    by_id: dict[str, tuple[Path, dict]] = {}
    for theme_path in sorted(THEMES_ROOT.glob("*/theme.json")):
        theme = json.loads(theme_path.read_text(encoding="utf-8"))
        by_label[theme["label"]] = (theme_path, theme)
        by_id[theme["id"]] = (theme_path, theme)
    return by_label, by_id


def build_question(record: list[str], theme: dict, sequence: int, reviewed_at: str) -> tuple[str, dict]:
    category, _, difficulty_label, question_text, *tail = record
    answer_displays = tail[:9]
    bomb_display = tail[9]
    if not all(answer_displays) or not bomb_display:
        raise ValueError(f"{theme['label']} · {question_text}: réponses ou bombe manquante")
    if difficulty_label not in DIFFICULTIES:
        raise ValueError(f"Difficulté inconnue : {difficulty_label}")

    level, filename_key, editorial, specificity, popularity, recall, homogeneity, expected = DIFFICULTIES[
        difficulty_label
    ]
    question_id = f"xlsx-{theme['id']}-{filename_key}-{sequence:02d}"
    answers = [
        {
            "id": f"{question_id}-answer-{index}",
            "display": display,
            "normalized": stored_normalized(display),
            "aliases": [],
            "abbreviations": [],
            "alternativeSpellings": [],
            "accentInsensitiveVariants": [],
            "hyphenationVariants": [],
            "displayOrder": index,
            "sources": [],
        }
        for index, display in enumerate(answer_displays, start=1)
    ]
    question = {
        "id": question_id,
        "slug": question_id,
        "language": "fr",
        "themeId": theme["id"],
        "subthemeIds": [f"{theme['id']}:essentials"],
        "tags": ["essentials", difficulty_label.lower()],
        "questionText": question_text,
        "shortTitle": title_from(question_text),
        "difficultyLevel": level,
        "difficultyLabel": difficulty_label,
        "editorialDifficultyScore": editorial,
        "specificityScore": specificity,
        "popularityScore": popularity,
        "recallDifficultyScore": recall,
        "answerSetHomogeneityScore": homogeneity,
        "expectedAverageAnswers": expected,
        "playCount": 0,
        "difficultyConfidence": "medium",
        "validationMode": "editorial_panel",
        "answers": answers,
        "bomb": {
            "id": f"{question_id}-bomb",
            "display": bomb_display,
            "normalized": stored_normalized(bomb_display),
            "aliases": [],
            "abbreviations": [],
            "alternativeSpellings": [],
            "accentInsensitiveVariants": [],
            "hyphenationVariants": [],
            "explanation": "Bombe fournie par la banque de questions source.",
        },
        "explanation": "Question et panel importés tels quels depuis la banque Excel source.",
        "qualificationRule": "Les réponses sont celles fournies dans la banque Excel source.",
        "timeSensitive": False,
        "sources": [],
        "status": "published",
        "reviewer": "Import Excel source",
        "reviewedAt": reviewed_at,
        "duplicateJustification": "Fiche importée telle quelle depuis le classeur Excel source.",
        "answerSetFingerprint": answer_fingerprint(answers),
        "version": 4,
        "createdAt": reviewed_at,
        "updatedAt": reviewed_at,
    }
    return filename_key, question


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path, help="Chemin du classeur .xlsx source")
    parser.add_argument("--write", action="store_true", help="Écrit les fichiers de contenu")
    args = parser.parse_args()
    source = args.source.resolve()
    rows = read_rows(source)
    if len(rows) < 3 or rows[1] != HEADERS:
        raise ValueError("La feuille Questions ne respecte pas les colonnes attendues.")
    records = rows[2:]
    if any(not record[3] for record in records):
        raise ValueError("Chaque ligne de question doit renseigner la colonne Question.")

    by_label, _ = load_themes()
    source_labels = {record[1] for record in records}
    if source_labels != set(by_label):
        missing = sorted(source_labels - set(by_label))
        unexpected = sorted(set(by_label) - source_labels)
        raise ValueError(f"Thèmes non mappés : source={missing}, projet={unexpected}")
    reviewed_at = datetime.fromtimestamp(source.stat().st_mtime, UTC).isoformat(timespec="milliseconds").replace(
        "+00:00", "Z"
    )
    grouped: dict[tuple[str, str], list[dict]] = defaultdict(list)
    categories: dict[str, str] = {}
    counters: Counter[tuple[str, str]] = Counter()
    for record in records:
        category, label, difficulty_label = record[:3]
        _, theme = by_label[label]
        if category not in {"Culture générale accessible", "Pop culture & loisirs", "Vie quotidienne & société"}:
            raise ValueError(f"Grande catégorie inconnue : {category}")
        if label in categories and categories[label] != category:
            raise ValueError(f"Catégorie incohérente pour le thème {label}")
        categories[label] = category
        counters[(theme["id"], difficulty_label)] += 1
        filename_key, question = build_question(
            record, theme, counters[(theme["id"], difficulty_label)], reviewed_at
        )
        grouped[(theme["id"], filename_key)].append(question)

    expected = {"Facile": 20, "Moyen": 14, "Difficile": 6}
    for label, (_, theme) in by_label.items():
        for difficulty_label, expected_count in expected.items():
            actual = counters[(theme["id"], difficulty_label)]
            if actual != expected_count:
                raise ValueError(f"{label} · {difficulty_label}: {actual} lignes, {expected_count} attendues")

    if not args.write:
        print(f"Import vérifié : {len(records)} questions, {len(by_label)} thèmes. Ajoutez --write pour écrire.")
        return
    for label, (theme_path, theme) in by_label.items():
        theme["category"] = categories[label]
        theme["contentVersion"] = "2026.08.17-excel-import"
        theme_path.write_text(json.dumps(theme, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        for filename_key in ("easy", "medium", "hard"):
            output = theme_path.parent / f"questions.{filename_key}.json"
            output.write_text(
                json.dumps(grouped[(theme["id"], filename_key)], ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8",
            )
    print(f"Import terminé : {len(records)} questions écrites depuis {source.name}.")


if __name__ == "__main__":
    main()
