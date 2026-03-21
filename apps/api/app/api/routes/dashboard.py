from collections import Counter
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.session import get_db
from app.models.request import Request

router = APIRouter()

@router.get("/dashboard/summary")
def dashboard_summary(db: Session = Depends(get_db)):
    total_requests = db.query(func.count(Request.id)).scalar() or 0
    pending_approval = (
        db.query(func.count(Request.id))
        .filter(Request.status.in_(["submitted", "under_review", "pending_approval"]))
        .scalar()
        or 0
    )
    approved = (
        db.query(func.count(Request.id))
        .filter(Request.status.in_(["approved", "document_generated", "notified", "closed"]))
        .scalar()
        or 0
    )
    rejected = (
        db.query(func.count(Request.id))
        .filter(Request.status == "rejected")
        .scalar()
        or 0
    )
    high_risk = (
        db.query(func.count(Request.id))
        .filter(Request.ai_risk_level == "high")
        .scalar()
        or 0
    )

    return {
        "open_requests": total_requests,
        "pending_approval": pending_approval,
        "approved_flow": approved,
        "rejected": rejected,
        "high_risk": high_risk,
    }


@router.get("/dashboard/charts")
def dashboard_charts(db: Session = Depends(get_db)):
    rows = db.query(Request.status, func.count(Request.id)).group_by(Request.status).all()

    status_counts = [{"label": status or "unknown", "value": count} for status, count in rows]

    type_rows = db.query(Request.request_type, func.count(Request.id)).group_by(Request.request_type).all()
    type_counts = [{"label": req_type or "unknown", "value": count} for req_type, count in type_rows]

    risk_counter = Counter()
    all_requests = db.query(Request).all()
    for item in all_requests:
        risk_counter[item.ai_risk_level or "unclassified"] += 1

    risk_counts = [{"label": k, "value": v} for k, v in risk_counter.items()]

    return {
        "status_counts": status_counts,
        "type_counts": type_counts,
        "risk_counts": risk_counts,
    }
