from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.core.routing import evaluate_request
from app.db.session import get_db
from app.models.project import Project
from app.models.request import Request
from app.models.user import User
from app.schemas.request import RequestOut
from app.schemas.request_create import RequestCreate

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
def list_requests(
    search: str | None = Query(default=None),
    risk: str | None = Query(default=None),
    priority: str | None = Query(default=None),
    status: str | None = Query(default=None),
    project_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
):
    project_map = {item.id: item.name for item in db.query(Project).all()}
    user_map = {item.id: item.name for item in db.query(User).all()}

    query = db.query(Request)

    if search:
        like_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Request.title.ilike(like_term),
                Request.description.ilike(like_term),
                Request.category.ilike(like_term),
                Request.request_type.ilike(like_term),
            )
        )

    if risk:
        query = query.filter(Request.ai_risk_level == risk)

    if priority:
        query = query.filter(Request.priority == priority)

    if status:
        query = query.filter(Request.status == status)

    if project_id is not None:
        query = query.filter(Request.project_id == project_id)

    items = query.order_by(Request.id.desc()).all()
    return [serialize_request(item, project_map, user_map) for item in items]

@router.get("/requests/{request_id}", response_model=RequestOut)
def get_request(request_id: int, db: Session = Depends(get_db)):
    project_map = {item.id: item.name for item in db.query(Project).all()}
    user_map = {item.id: item.name for item in db.query(User).all()}

    item = db.query(Request).filter(Request.id == request_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Request not found")

    return serialize_request(item, project_map, user_map)

@router.post("/requests", response_model=RequestOut, status_code=201)
def create_request(payload: RequestCreate, db: Session = Depends(get_db)):
    project_exists = db.query(Project).filter(Project.id == payload.project_id).first()
    if not project_exists:
        raise HTTPException(status_code=400, detail="Invalid project_id")

    user_exists = db.query(User).filter(User.id == payload.requester_id).first()
    if not user_exists:
        raise HTTPException(status_code=400, detail="Invalid requester_id")

    result = evaluate_request(
        request_type=payload.request_type,
        category=payload.category,
        title=payload.title,
        description=payload.description,
        estimated_cost=payload.estimated_cost,
        priority=payload.priority,
        safety_flag=payload.safety_flag,
    )

    next_id = (db.query(func.max(Request.id)).scalar() or 0) + 1

    item = Request(
        id=next_id,
        project_id=payload.project_id,
        requester_id=payload.requester_id,
        request_type=payload.request_type,
        category=payload.category,
        title=payload.title,
        description=payload.description,
        estimated_cost=payload.estimated_cost,
        priority=payload.priority,
        safety_flag=payload.safety_flag,
        status="submitted",
        ai_summary=result["summary"],
        ai_risk_level=result["risk"],
        ai_suggested_route=result["route_label"],
        final_route=result["route_label"],
    )

    db.add(item)
    db.commit()
    db.refresh(item)

    project_map = {p.id: p.name for p in db.query(Project).all()}
    user_map = {u.id: u.name for u in db.query(User).all()}
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