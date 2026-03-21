from app.services.document_generator import build_document_payload, build_document_pdf, DocumentGenerationError
from fastapi.responses import Response
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.core.routing import evaluate_request
from app.db.session import get_db
from app.models.project import Project
from app.models.request import Request
from app.services.state_machine import ensure_transition, InvalidTransitionError

from app.models.request_event import RequestEvent
from app.models.user import User
from app.schemas.request import RequestOut
from app.schemas.request_create import RequestCreate
from app.schemas.request_event import RequestEventOut

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import Project, Request, User
from app.services.document_generator import (
    DocumentGenerationError,
    build_document_payload,
    build_document_pdf,
)

def _build_document_request_payload(db: Session, request_obj: Request) -> dict:
    project_name = (
        db.query(Project.name)
        .filter(Project.id == request_obj.project_id)
        .scalar()
    )
    requester_name = (
        db.query(User.name)
        .filter(User.id == request_obj.requester_id)
        .scalar()
    )

    return {
        "id": request_obj.id,
        "project_id": request_obj.project_id,
        "project_name": project_name,
        "requester_id": request_obj.requester_id,
        "requester_name": requester_name,
        "request_type": request_obj.request_type,
        "category": request_obj.category,
        "title": request_obj.title,
        "description": request_obj.description,
        "estimated_cost": request_obj.estimated_cost,
        "priority": request_obj.priority,
        "safety_flag": request_obj.safety_flag,
        "status": request_obj.status,
        "ai_summary": request_obj.ai_summary,
        "ai_risk_level": request_obj.ai_risk_level,
        "ai_suggested_route": request_obj.ai_suggested_route,
        "final_route": request_obj.final_route,
    }
router = APIRouter()

def apply_request_transition(
    db: Session,
    request_obj: Request,
    target_status: str,
    actor_name: str,
    action: str,
    note: str | None = None,
):
    try:
        result = ensure_transition(request_obj.status, target_status)
    except InvalidTransitionError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc

    from_status = request_obj.status
    request_obj.status = result.to_status
    db.add(request_obj)
    db.commit()
    db.refresh(request_obj)

    add_event(
        db=db,
        request_id=request_obj.id,
        actor_name=actor_name,
        action=action,
        from_status=from_status,
        to_status=result.to_status,
        note=note,
    )

    return {
        "id": request_obj.id,
        "status": request_obj.status,
        "from_status": from_status,
        "to_status": result.to_status,
        "action": action,
        "actor_name": actor_name,
        "note": note,
    }

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

def add_event(
    db: Session,
    *,
    request_id: int,
    actor_name: str,
    action: str,
    from_status: str | None,
    to_status: str | None,
    note: str | None = None,
):
    event = RequestEvent(
        request_id=request_id,
        actor_name=actor_name,
        action=action,
        from_status=from_status,
        to_status=to_status,
        note=note,
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event

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

@router.get("/requests/{request_id}/events", response_model=list[RequestEventOut])
def list_request_events(request_id: int, db: Session = Depends(get_db)):
    item = db.query(Request).filter(Request.id == request_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Request not found")

    return (
        db.query(RequestEvent)
        .filter(RequestEvent.request_id == request_id)
        .order_by(RequestEvent.created_at.asc(), RequestEvent.id.asc())
        .all()
    )

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
    db.flush()

    requester_name = user_exists.name
    add_event(
        db,
        request_id=item.id,
        actor_name=requester_name,
        action="submitted",
        from_status=None,
        to_status="submitted",
        note="Request created in ConstructFlow.",
    )
    add_event(
        db,
        request_id=item.id,
        actor_name="ConstructFlow AI",
        action="ai_triaged",
        from_status="submitted",
        to_status="submitted",
        note=result["summary"],
    )

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

    add_event(
        db,
        request_id=item.id,
        actor_name="ConstructFlow AI",
        action="ai_recomputed",
        from_status=item.status,
        to_status=item.status,
        note=result["summary"],
    )

    db.commit()
    db.refresh(item)

    project_map = {p.id: p.name for p in db.query(Project).all()}
    user_map = {u.id: u.name for u in db.query(User).all()}
    return serialize_request(item, project_map, user_map)

@router.post("/requests/{request_id}/approve", response_model=RequestOut)
def approve_request(request_id: int, db: Session = Depends(get_db)):
    item = db.query(Request).filter(Request.id == request_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Request not found")

    previous_status = item.status
    item.status = "approved"

    add_event(
        db,
        request_id=item.id,
        actor_name="Project Manager",
        action="approved",
        from_status=previous_status,
        to_status="approved",
        note="Request approved through workflow action.",
    )

    db.commit()
    db.refresh(item)

    project_map = {p.id: p.name for p in db.query(Project).all()}
    user_map = {u.id: u.name for u in db.query(User).all()}
    return serialize_request(item, project_map, user_map)

@router.post("/requests/{request_id}/reject", response_model=RequestOut)
def reject_request(request_id: int, db: Session = Depends(get_db)):
    item = db.query(Request).filter(Request.id == request_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Request not found")

    previous_status = item.status
    item.status = "rejected"

    add_event(
        db,
        request_id=item.id,
        actor_name="Project Manager",
        action="rejected",
        from_status=previous_status,
        to_status="rejected",
        note="Request rejected through workflow action.",
    )

    db.commit()
    db.refresh(item)

    project_map = {p.id: p.name for p in db.query(Project).all()}
    user_map = {u.id: u.name for u in db.query(User).all()}
    return serialize_request(item, project_map, user_map)
@router.post("/requests/{request_id}/approve")
def approve_request(request_id: int, db: Session = Depends(get_db)):
    request_obj = db.query(Request).filter(Request.id == request_id).first()
    if not request_obj:
        raise HTTPException(status_code=404, detail="Request not found")

    return apply_request_transition(
        db=db,
        request_obj=request_obj,
        target_status="approved",
        actor_name="ConstructFlow AI",
        action="approved",
        note="Approved via approval action.",
    )

@router.post("/requests/{request_id}/reject")
def reject_request(request_id: int, db: Session = Depends(get_db)):
    request_obj = db.query(Request).filter(Request.id == request_id).first()
    if not request_obj:
        raise HTTPException(status_code=404, detail="Request not found")

    return apply_request_transition(
        db=db,
        request_obj=request_obj,
        target_status="rejected",
        actor_name="ConstructFlow AI",
        action="rejected",
        note="Rejected via approval action.",
    )

@router.post("/requests/{request_id}/request-info")
def request_more_info(request_id: int, db: Session = Depends(get_db)):
    request_obj = db.query(Request).filter(Request.id == request_id).first()
    if not request_obj:
        raise HTTPException(status_code=404, detail="Request not found")

    return apply_request_transition(
        db=db,
        request_obj=request_obj,
        target_status="needs_info",
        actor_name="ConstructFlow AI",
        action="info_requested",
        note="More information requested.",
    )

@router.post("/requests/{request_id}/send-to-review")
def send_to_review(request_id: int, db: Session = Depends(get_db)):
    request_obj = db.query(Request).filter(Request.id == request_id).first()
    if not request_obj:
        raise HTTPException(status_code=404, detail="Request not found")

    return apply_request_transition(
        db=db,
        request_obj=request_obj,
        target_status="under_review",
        actor_name="ConstructFlow AI",
        action="review_requested",
        note="Moved to under_review.",
    )


@router.post("/requests/{request_id}/generate-document")
def generate_document(request_id: int, db: Session = Depends(get_db)):
    request_obj = db.query(Request).filter(Request.id == request_id).first()
    if not request_obj:
        raise HTTPException(status_code=404, detail="Request not found")

    if request_obj.status != "approved":
        raise HTTPException(
            status_code=409,
            detail=f"Document generation requires status 'approved', not '{request_obj.status}'.",
        )

    document_request = _build_document_request_payload(db, request_obj)

    try:
        document = build_document_payload(document_request)
    except DocumentGenerationError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc

    result = apply_request_transition(
        db=db,
        request_obj=request_obj,
        target_status="document_generated",
        actor_name="ConstructFlow AI",
        action="document_generated",
        note=f"Generated controlled document: {document['title']}",
    )
    result["document"] = document
    return result


@router.get("/requests/{request_id}/document-preview")
def get_document_preview(request_id: int, db: Session = Depends(get_db)):
    request_obj = db.query(Request).filter(Request.id == request_id).first()
    if not request_obj:
        raise HTTPException(status_code=404, detail="Request not found")

    if request_obj.status not in {"document_generated", "notified", "closed"}:
        raise HTTPException(
            status_code=409,
            detail=f"Document preview is not available for status '{request_obj.status}'.",
        )

    document_request = _build_document_request_payload(db, request_obj)

    try:
        return build_document_payload(document_request)
    except DocumentGenerationError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@router.get("/requests/{request_id}/document-pdf")
def get_document_pdf(request_id: int, db: Session = Depends(get_db)):
    request_obj = db.query(Request).filter(Request.id == request_id).first()
    if not request_obj:
        raise HTTPException(status_code=404, detail="Request not found")

    if request_obj.status not in {"document_generated", "notified", "closed"}:
        raise HTTPException(
            status_code=409,
            detail=f"Document PDF is not available for status '{request_obj.status}'.",
        )

    document_request = _build_document_request_payload(db, request_obj)

    try:
        payload = build_document_payload(document_request)
        pdf_bytes = build_document_pdf(document_request)
    except DocumentGenerationError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'inline; filename="{payload["filename"]}"'
        },
    )


@router.post("/requests/{request_id}/notify")
def notify_request(request_id: int, db: Session = Depends(get_db)):
    request_obj = db.query(Request).filter(Request.id == request_id).first()
    if not request_obj:
        raise HTTPException(status_code=404, detail="Request not found")

    if request_obj.status != "document_generated":
        raise HTTPException(
            status_code=409,
            detail=f"Notification requires status 'document_generated', not '{request_obj.status}'.",
        )

    return apply_request_transition(
        db=db,
        request_obj=request_obj,
        target_status="notified",
        actor_name="ConstructFlow AI",
        action="notified",
        note="Stakeholders notified after controlled document generation.",
    )

