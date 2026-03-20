import csv
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "apps" / "api"))

from app import models  # noqa: F401
from app.core.routing import evaluate_request
from app.db.session import Base, SessionLocal, engine
from app.models.project import Project
from app.models.request import Request
from app.models.user import User

SEED_DIR = ROOT / "data" / "seed"

def load_csv(path: Path):
    with path.open("r", encoding="utf-8") as f:
        return list(csv.DictReader(f))

def seed_projects(db):
    for row in load_csv(SEED_DIR / "seed_projects.csv"):
        existing = db.query(Project).filter(Project.id == int(row["id"])).first()
        if existing:
            continue

        db.add(
            Project(
                id=int(row["id"]),
                name=row["name"],
                code=row["code"],
                address=row["address"],
                client_name=row["client_name"],
            )
        )
    db.commit()

def seed_users(db):
    for row in load_csv(SEED_DIR / "seed_users.csv"):
        existing = db.query(User).filter(User.id == int(row["id"])).first()
        if existing:
            continue

        db.add(
            User(
                id=int(row["id"]),
                name=row["name"],
                email=row["email"],
                role=row["role"],
            )
        )
    db.commit()

def seed_requests(db):
    for row in load_csv(SEED_DIR / "seed_requests.csv"):
        existing = db.query(Request).filter(Request.id == int(row["id"])).first()
        if existing:
            continue

        estimated_cost = float(row["estimated_cost"])
        safety_flag = row["safety_flag"].strip().lower() == "true"

        result = evaluate_request(
            request_type=row["request_type"],
            category=row["category"],
            title=row["title"],
            description=row["description"],
            estimated_cost=estimated_cost,
            priority=row["priority"],
            safety_flag=safety_flag,
        )

        db.add(
            Request(
                id=int(row["id"]),
                project_id=int(row["project_id"]),
                requester_id=int(row["requester_id"]),
                request_type=row["request_type"],
                category=row["category"],
                title=row["title"],
                description=row["description"],
                estimated_cost=estimated_cost,
                priority=row["priority"],
                safety_flag=safety_flag,
                status=row["status"],
                ai_summary=row["ai_summary"] or result["summary"],
                ai_risk_level=row["ai_risk_level"] or result["risk"],
                ai_suggested_route=row["ai_suggested_route"] or result["route_label"],
                final_route=row["final_route"] or result["route_label"],
            )
        )
    db.commit()

def main():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_projects(db)
        seed_users(db)
        seed_requests(db)
        print("Seed completed.")
    finally:
        db.close()

if __name__ == "__main__":
    main()
