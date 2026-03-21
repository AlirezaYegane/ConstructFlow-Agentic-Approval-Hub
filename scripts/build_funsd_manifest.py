from __future__ import annotations

import csv
import json
import re
from collections import Counter
from pathlib import Path


RAW_ROOT = Path("data/raw/funsd/dataset")
PROCESSED_DIR = Path("data/processed/funsd")
MANIFEST_CSV = PROCESSED_DIR / "funsd_manifest.csv"
DOCS_JSONL = PROCESSED_DIR / "funsd_docs.jsonl"
SUMMARY_JSON = PROCESSED_DIR / "summary.json"


def clean_text(value: str) -> str:
    return re.sub(r"\s+", " ", (value or "").strip())


def load_annotation(annotation_path: Path) -> dict:
    with annotation_path.open("r", encoding="utf-8") as f:
        return json.load(f)


def build_record(split_name: str, annotation_path: Path, image_path: Path) -> tuple[dict[str, str], dict]:
    data = load_annotation(annotation_path)
    forms = data.get("form", [])

    label_counter: Counter[str] = Counter()
    words_count = 0
    text_chunks: list[str] = []

    for item in forms:
        label = clean_text(item.get("label", "")) or "unknown"
        label_counter[label] += 1

        text_value = clean_text(item.get("text", ""))
        if text_value:
            text_chunks.append(text_value)

        words = item.get("words", [])
        words_count += len(words)

    doc_text = " ".join(text_chunks)
    doc_id = annotation_path.stem

    manifest_row = {
        "doc_id": doc_id,
        "split": split_name,
        "image_path": str(image_path).replace("\\", "/"),
        "annotation_path": str(annotation_path).replace("\\", "/"),
        "form_items": str(len(forms)),
        "words_count": str(words_count),
        "question_count": str(label_counter.get("question", 0)),
        "answer_count": str(label_counter.get("answer", 0)),
        "header_count": str(label_counter.get("header", 0)),
        "other_count": str(sum(v for k, v in label_counter.items() if k not in {"question", "answer", "header"})),
        "text_preview": doc_text[:300],
    }

    doc_json = {
        "doc_id": doc_id,
        "split": split_name,
        "image_path": str(image_path).replace("\\", "/"),
        "annotation_path": str(annotation_path).replace("\\", "/"),
        "doc_type": "form",
        "full_text": doc_text,
        "label_counts": dict(label_counter),
        "form_items": len(forms),
        "words_count": words_count,
    }

    return manifest_row, doc_json


def main() -> None:
    if not RAW_ROOT.exists():
        raise FileNotFoundError(f"Missing FUNSD dataset root: {RAW_ROOT}")

    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

    manifest_rows: list[dict[str, str]] = []
    docs_rows: list[dict] = []
    split_summary: dict[str, int] = {}

    split_map = {
        "train": RAW_ROOT / "training_data",
        "test": RAW_ROOT / "testing_data",
    }

    for split_name, split_dir in split_map.items():
        ann_dir = split_dir / "annotations"
        img_dir = split_dir / "images"

        if not ann_dir.exists() or not img_dir.exists():
            raise FileNotFoundError(f"Expected FUNSD folders missing under: {split_dir}")

        count = 0
        for annotation_path in sorted(ann_dir.glob("*.json")):
            image_path = img_dir / f"{annotation_path.stem}.png"
            if not image_path.exists():
                continue

            manifest_row, doc_json = build_record(split_name, annotation_path, image_path)
            manifest_rows.append(manifest_row)
            docs_rows.append(doc_json)
            count += 1

        split_summary[split_name] = count

    fieldnames = list(manifest_rows[0].keys()) if manifest_rows else []
    with MANIFEST_CSV.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(manifest_rows)

    with DOCS_JSONL.open("w", encoding="utf-8") as f:
        for item in docs_rows:
            f.write(json.dumps(item, ensure_ascii=False) + "\n")

    summary = {
        "dataset_root": str(RAW_ROOT),
        "manifest_csv": str(MANIFEST_CSV),
        "docs_jsonl": str(DOCS_JSONL),
        "doc_count": len(manifest_rows),
        "split_counts": split_summary,
    }

    with SUMMARY_JSON.open("w", encoding="utf-8") as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)

    print(f"[funsd] wrote: {MANIFEST_CSV}")
    print(f"[funsd] wrote: {DOCS_JSONL}")
    print(f"[funsd] wrote: {SUMMARY_JSON}")
    print(f"[funsd] docs: {len(manifest_rows)}")


if __name__ == "__main__":
    main()
