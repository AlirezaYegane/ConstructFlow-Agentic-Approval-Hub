from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.ai.service import run_intake_analysis
from app.ai.rules import decide_final_route
from app.services.request_ai_adapter import to_ai_request_payload

# این import را با مدل واقعی پروژه‌ات sync کن
from app.models.request import Request

router = APIRouter(prefix="/api/requests", tags=["ai-workflow"])


@router.post("/{request_id}/ai/analyze")
def analyze_request(request_id: int, db: Session = Depends(get_db)):
    request_obj = db.query(Request).filter(Request.id == request_id).first()
    if not request_obj:
        raise HTTPException(status_code=404, detail="Request not found")

    payload = to_ai_request_payload(request_obj, db)
    analysis = run_intake_analysis(payload)

    final_route = decide_final_route(
        estimated_cost=payload.get("estimated_cost"),
        safety_flag=payload.get("safety_flag", False),
        risk_level=analysis.risk_level,
        missing_fields=analysis.missing_fields,
    )

    # optional persistence روی همان request
    if hasattr(request_obj, "ai_summary"):
        request_obj.ai_summary = analysis.summary
    if hasattr(request_obj, "ai_risk_level"):
        request_obj.ai_risk_level = analysis.risk_level
    if hasattr(request_obj, "ai_suggested_route"):
        request_obj.ai_suggested_route = analysis.suggested_approver_role
    if hasattr(request_obj, "final_route"):
        request_obj.final_route = final_route

    db.add(request_obj)
    db.commit()
    db.refresh(request_obj)

    return {
        "request_id": request_id,
        "intake_analysis": analysis.model_dump(),
        "final_route": final_route,
        "human_decision_required": True,
    }