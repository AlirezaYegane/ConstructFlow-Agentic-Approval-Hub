from __future__ import annotations

import csv
import json
from pathlib import Path

from sqlalchemy.orm import Session

import sys
sys.path.append("apps/api")

import app.models  # noqa: F401
from app.db.session import SessionLocal
from app.models.datasets import DocumentCorpus, ExternalIncident, TrainingCase


OSHA_CSV = Path("data/processed/osha/osha_incidents_normalized.csv")
OSHA_CASES_JSONL = Path("data/processed/osha/osha_risk_cases.jsonl")
FUNSD_MANIFEST = Path("data/processed/funsd/funsd_manifest.csv")
FUNSD_DOCS_JSONL = Path("data/processed/funsd/funsd_docs.jsonl")


def to_bool(value: str) -> bool:
    return str(value).strip().lower() == "true"


def to_float(value: str):
    value = (value or "").strip()
    if not value:
        return None
    try:
        return float(value)
    except ValueError:
        return None


def to_int(value: str):
    value = (value or "").strip()
    if not value:
        return None
    try:
        return int(value)
    except ValueError:
        return None


def import_osha_incidents(db: Session) -> int:
    count = 0
    with OSHA_CSV.open("r", encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            exists = db.query(ExternalIncident).filter_by(
                source_record_id=row["incident_id"]
            ).first()
            if exists:
                continue

            item = ExternalIncident(
                source_dataset=row["source_dataset"],
                source_record_id=row["incident_id"],
                event_date=row["event_date"],
                employer=row["employer"],
                city=row["city"],
                state=row["state"],
                zip=row["zip"],
                latitude=to_float(row["latitude"]),
                longitude=to_float(row["longitude"]),
                primary_naics=row["primary_naics"],
                hospitalized=to_bool(row["hospitalized"]),
                amputation=to_bool(row["amputation"]),
                loss_of_eye=to_bool(row["loss_of_eye"]),
                inspection=row["inspection"],
                nature_code=row["nature_code"],
                nature_title=row["nature_title"],
                part_of_body_code=row["part_of_body_code"],
                part_of_body_title=row["part_of_body_title"],
                event_code=row["event_code"],
                event_title=row["event_title"],
                source_code=row["source_code"],
                source_title=row["source_title"],
                secondary_source_code=row["secondary_source_code"],
                secondary_source_title=row["secondary_source_title"],
                federal_state=row["federal_state"],
                final_narrative=row["final_narrative"],
                risk_label=row["risk_label"],
            )
            db.add(item)
            count += 1

            if count % 2000 == 0:
                db.commit()
                print(f"[db] imported incidents: {count}")

    db.commit()
    return count


def import_training_cases(db: Session) -> int:
    count = 0
    with OSHA_CASES_JSONL.open("r", encoding="utf-8") as f:
        for line in f:
            row = json.loads(line)
            exists = db.query(TrainingCase).filter_by(case_id=row["case_id"]).first()
            if exists:
                continue

            item = TrainingCase(
                case_id=row["case_id"],
                task_type=row["task_type"],
                source_dataset=row["source_dataset"],
                source_record_id=row.get("source_record_id"),
                input_text=row["input_text"],
                expected_risk=row.get("expected_risk"),
                expected_route=row.get("expected_route"),
                expected_document_type=row.get("expected_document_type"),
                metadata_json=json.dumps(row.get("metadata", {}), ensure_ascii=False),
            )
            db.add(item)
            count += 1

            if count % 2000 == 0:
                db.commit()
                print(f"[db] imported training cases: {count}")

    db.commit()
    return count


def load_funsd_full_texts() -> dict[str, str]:
    texts: dict[str, str] = {}
    with FUNSD_DOCS_JSONL.open("r", encoding="utf-8") as f:
        for line in f:
            row = json.loads(line)
            texts[row["doc_id"]] = row.get("full_text", "")
    return texts


def import_funsd_docs(db: Session) -> int:
    full_texts = load_funsd_full_texts()
    count = 0

    with FUNSD_MANIFEST.open("r", encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            doc_id = row["doc_id"]
            exists = db.query(DocumentCorpus).filter_by(source_record_id=doc_id).first()
            if exists:
                continue

            item = DocumentCorpus(
                source_dataset="funsd",
                source_record_id=doc_id,
                split=row["split"],
                doc_type="form",
                image_path=row["image_path"],
                annotation_path=row["annotation_path"],
                form_items=to_int(row["form_items"]),
                words_count=to_int(row["words_count"]),
                question_count=to_int(row["question_count"]),
                answer_count=to_int(row["answer_count"]),
                header_count=to_int(row["header_count"]),
                other_count=to_int(row["other_count"]),
                text_preview=row["text_preview"],
                full_text=full_texts.get(doc_id, ""),
            )
            db.add(item)
            count += 1

    db.commit()
    return count


def main() -> None:
    db = SessionLocal()
    try:
        incidents = import_osha_incidents(db)
        cases = import_training_cases(db)
        docs = import_funsd_docs(db)

        print(f"[done] external_incidents imported: {incidents}")
        print(f"[done] training_cases imported: {cases}")
        print(f"[done] document_corpus imported: {docs}")
    finally:
        db.close()


if __name__ == "__main__":
    main()