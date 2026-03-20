from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.routing import evaluate_request
from app.db.session import get_db
from app.models.project import Project
from app.models.request import Request
from app.models.user import User
from app.schemas.request import RequestOut

router = APIRouter()

def serialize_request(
    record: Request,
    project_map: dict[int, str],
    user_map: dict[int, str],
) -> RequestOut:
    return RequestOut(
        id=record.id,
        project_id=record.project_id,
        project_name=project_map.get(record.project_id),
        requester_id=record.requester_id,
        requester_name=user_map.get(record.requester_id),
        request_type=record.request_type,
        category=record.category,
        title=record.title,
        description=record.description,
        estimated_cost=record.estimated_cost,
        priority=record.priority,
        safety_flag=record.safety_flag,
        status=record.status,
        ai_summary=record.ai_summary,
        ai_risk_level=record.ai_risk_level,
        ai_suggested_route=record.ai_suggested_route,
        final_route=record.final_route,
    )

@router.get("/requests", response_model=list[RequestOut])
def list_requests(db: Session = Depends(get_db)):
    project_map = {item.id: item.name for item in db.query(Project).all()}
    user_map = {item.id: item.name for item in db.query(User).all()}
    items = db.query(Request).order_by(Request.id.desc()).all()
    return [serialize_request(item, project_map, user_map) for item in items]

@router.get("/requests/{request_id}", response_model=RequestOut)
def get_request(request_id: int, db: Session = Depends(get_db)):
    project_map = {item.id: item.name for item in db.query(Project).all()}
    user_map = {item.id: item.name for item in db.query(User).all()}

    item = db.query(Request).filter(Request.id == request_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Request not found")

    return serialize_request(item, project_map, user_map)

@router.post("/requests/{request_id}/recompute", response_model=RequestOut)
def recompute_request(request_id: int, db: Session = Depends(get_db)):
    item = db.query(Request).filter(Request.id == request_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Request not found")

    result = evaluate_request(
        request_type=item.request_type,
        category=item.category,
        title=item.title,
        description=item.description,
        estimated_cost=item.estimated_cost,
        priority=item.priority,
        safety_flag=item.safety_flag,
    )

    item.ai_summary = result["summary"]
    item.ai_risk_level = result["risk"]
    item.ai_suggested_route = result["route_label"]
    if not item.final_route:
        item.final_route = result["route_label"]

    db.commit()
    db.refresh(item)

    project_map = {p.id: p.name for p in db.query(Project).all()}
    user_map = {u.id: u.name for u in db.query(User).all()}
    return serialize_request(item, project_map, user_map)
