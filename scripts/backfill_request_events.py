import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "apps" / "api"))

from app import models  # noqa: F401
from app.db.session import Base, SessionLocal, engine
from app.models.request import Request
from app.models.request_event import RequestEvent
from app.models.user import User

def main():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        user_map = {u.id: u.name for u in db.query(User).all()}
        requests = db.query(Request).all()

        for req in requests:
            existing = db.query(RequestEvent).filter(RequestEvent.request_id == req.id).count()
            if existing > 0:
                continue

            db.add(
                RequestEvent(
                    request_id=req.id,
                    actor_name=user_map.get(req.requester_id, "Requester"),
                    action="submitted",
                    from_status=None,
                    to_status="submitted",
                    note="Backfilled submitted event.",
                )
            )
            db.add(
                RequestEvent(
                    request_id=req.id,
                    actor_name="ConstructFlow AI",
                    action="ai_triaged",
                    from_status=req.status,
                    to_status=req.status,
                    note=req.ai_summary,
                )
            )

        db.commit()
        print("Backfill completed.")
    finally:
        db.close()

if __name__ == "__main__":
    main()