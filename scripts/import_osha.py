from __future__ import annotations

import csv
import json
import re
from pathlib import Path


RAW_PATH = Path("data/raw/osha/osha_severe_injuries.csv")
PROCESSED_DIR = Path("data/processed/osha")
NORMALIZED_CSV = PROCESSED_DIR / "osha_incidents_normalized.csv"
TRAINING_JSONL = PROCESSED_DIR / "osha_risk_cases.jsonl"
SUMMARY_JSON = PROCESSED_DIR / "summary.json"


def clean_text(value: str) -> str:
    return re.sub(r"\s+", " ", (value or "").strip())


def to_bool(value: str) -> bool:
    value = (value or "").strip()
    return value in {"1", "1.0", "1.00", "true", "True", "TRUE"}


def derive_risk_label(hospitalized: bool, amputation: bool, loss_of_eye: bool) -> str:
    if amputation or loss_of_eye:
        return "critical"
    if hospitalized:
        return "high"
    return "unknown"


def build_input_text(row: dict[str, str]) -> str:
    parts = [
        clean_text(row.get("EventTitle", "")),
        clean_text(row.get("NatureTitle", "")),
        clean_text(row.get("Part of Body Title", "")),
        clean_text(row.get("SourceTitle", "")),
        clean_text(row.get("Final Narrative", "")),
    ]
    parts = [p for p in parts if p]
    return " | ".join(parts)


def main() -> None:
    if not RAW_PATH.exists():
        raise FileNotFoundError(f"Missing input file: {RAW_PATH}")

    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

    normalized_rows: list[dict[str, str]] = []
    risk_rows: list[dict[str, object]] = []
    seen_incident_ids: set[str] = set()
    skipped_duplicates = 0

    with RAW_PATH.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            incident_id = clean_text(row.get("ID", ""))
            if not incident_id:
                continue

            if incident_id in seen_incident_ids:
                skipped_duplicates += 1
                continue

            seen_incident_ids.add(incident_id)

            hospitalized = to_bool(row.get("Hospitalized", ""))
            amputation = to_bool(row.get("Amputation", ""))
            loss_of_eye = to_bool(row.get("Loss of Eye", ""))
            risk_label = derive_risk_label(
                hospitalized=hospitalized,
                amputation=amputation,
                loss_of_eye=loss_of_eye,
            )

            normalized = {
                "incident_id": incident_id,
                "upa": clean_text(row.get("UPA", "")),
                "event_date": clean_text(row.get("EventDate", "")),
                "employer": clean_text(row.get("Employer", "")),
                "city": clean_text(row.get("City", "")),
                "state": clean_text(row.get("State", "")),
                "zip": clean_text(row.get("Zip", "")),
                "latitude": clean_text(row.get("Latitude", "")),
                "longitude": clean_text(row.get("Longitude", "")),
                "primary_naics": clean_text(row.get("Primary NAICS", "")),
                "hospitalized": str(hospitalized).lower(),
                "amputation": str(amputation).lower(),
                "loss_of_eye": str(loss_of_eye).lower(),
                "inspection": clean_text(row.get("Inspection", "")),
                "nature_code": clean_text(row.get("Nature", "")),
                "nature_title": clean_text(row.get("NatureTitle", "")),
                "part_of_body_code": clean_text(row.get("Part of Body", "")),
                "part_of_body_title": clean_text(row.get("Part of Body Title", "")),
                "event_code": clean_text(row.get("Event", "")),
                "event_title": clean_text(row.get("EventTitle", "")),
                "source_code": clean_text(row.get("Source", "")),
                "source_title": clean_text(row.get("SourceTitle", "")),
                "secondary_source_code": clean_text(row.get("Secondary Source", "")),
                "secondary_source_title": clean_text(row.get("Secondary Source Title", "")),
                "federal_state": clean_text(row.get("FederalState", "")),
                "final_narrative": clean_text(row.get("Final Narrative", "")),
                "risk_label": risk_label,
                "source_dataset": "osha_severe_injury_reports",
            }
            normalized_rows.append(normalized)

            risk_case = {
                "case_id": f"osha-{incident_id}",
                "task_type": "risk_triage",
                "source_dataset": "osha_severe_injury_reports",
                "source_record_id": incident_id,
                "input_text": build_input_text(row),
                "expected_risk": risk_label,
                "metadata": {
                    "event_date": normalized["event_date"],
                    "employer": normalized["employer"],
                    "city": normalized["city"],
                    "state": normalized["state"],
                    "primary_naics": normalized["primary_naics"],
                    "hospitalized": hospitalized,
                    "amputation": amputation,
                    "loss_of_eye": loss_of_eye,
                },
            }
            risk_rows.append(risk_case)

    fieldnames = list(normalized_rows[0].keys()) if normalized_rows else []
    with NORMALIZED_CSV.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(normalized_rows)

    with TRAINING_JSONL.open("w", encoding="utf-8") as f:
        for item in risk_rows:
            f.write(json.dumps(item, ensure_ascii=False) + "\n")

    summary = {
        "input_file": str(RAW_PATH),
        "normalized_csv": str(NORMALIZED_CSV),
        "training_jsonl": str(TRAINING_JSONL),
        "row_count": len(normalized_rows),
        "skipped_duplicate_incident_ids": skipped_duplicates,
        "risk_counts": {
            "critical": sum(1 for r in normalized_rows if r["risk_label"] == "critical"),
            "high": sum(1 for r in normalized_rows if r["risk_label"] == "high"),
            "unknown": sum(1 for r in normalized_rows if r["risk_label"] == "unknown"),
        },
    }

    with SUMMARY_JSON.open("w", encoding="utf-8") as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)

    print(f"[osha] wrote: {NORMALIZED_CSV}")
    print(f"[osha] wrote: {TRAINING_JSONL}")
    print(f"[osha] wrote: {SUMMARY_JSON}")
    print(f"[osha] rows: {len(normalized_rows)}")
    print(f"[osha] skipped duplicates: {skipped_duplicates}")


if __name__ == "__main__":
    main()
