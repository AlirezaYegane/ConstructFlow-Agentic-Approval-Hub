from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

from langchain_google_genai import ChatGoogleGenerativeAI
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.project import Project
from app.models.request import Request
from app.models.user import User
from app.schemas.ai_documents import DocumentValidationResult, NotificationDraft
from app.services.knowledge_service import retrieve_policy_chunks


PROMPTS_DIR = Path(__file__).resolve().parents[1] / "ai" / "prompts"


def _read_prompt(name: str) -> str:
    return (PROMPTS_DIR / name).read_text(encoding="utf-8")


def _render_prompt(template: str, mapping: dict[str, Any]) -> str:
    text = template
    for key, value in mapping.items():
        if not isinstance(value, str):
            value = json.dumps(value, ensure_ascii=False, indent=2)
        text = text.replace("{" + key + "}", value)
    return text


def _get_model():
    return ChatGoogleGenerativeAI(
        model=os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
        temperature=0,
    )


def _db() -> Session:
    return SessionLocal()


def _get_request_payload(db: Session, request_id: int) -> dict[str, Any]:
    request_obj = db.query(Request).filter(Request.id == request_id).first()
    if request_obj is None:
        raise ValueError(f"Request {request_id} not found")

    project = db.query(Project).filter(Project.id == request_obj.project_id).first()
    requester = db.query(User).filter(User.id == request_obj.requester_id).first()

    return {
        "request_id": request_obj.id,
        "project_id": request_obj.project_id,
        "project_name": getattr(project, "name", None),
        "requester_id": request_obj.requester_id,
        "requester_name": getattr(requester, "name", None),
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


def _build_policy_query(request_payload: dict[str, Any]) -> str:
    parts = [
        request_payload.get("title") or "",
        request_payload.get("description") or "",
        request_payload.get("category") or "",
        request_payload.get("ai_risk_level") or request_payload.get("priority") or "",
        request_payload.get("request_type") or "",
    ]
    return " | ".join([p for p in parts if p])


def _build_policy_evidence(request_payload: dict[str, Any]) -> list[dict[str, Any]]:
    query = _build_policy_query(request_payload)
    chunks = retrieve_policy_chunks(query=query, k=4)

    evidence: list[dict[str, Any]] = []
    for idx, item in enumerate(chunks, start=1):
        evidence.append(
            {
                "ref": f"policy_{idx}",
                "doc_id": item.get("doc_id"),
                "title": item.get("title"),
                "section": f"chunk_{item.get('chunk_index')}",
                "text": item.get("text"),
                "score": item.get("score"),
                "source_path": item.get("source_path"),
            }
        )
    return evidence


def _fallback_draft(request_payload: dict[str, Any]) -> str:
    return f"""# {request_payload.get("title") or "Controlled Document"}

Project: {request_payload.get("project_name") or "-"}
Request ID: {request_payload.get("request_id")}
Requester: {request_payload.get("requester_name") or "-"}
Type: {request_payload.get("request_type") or "-"}
Category: {request_payload.get("category") or "-"}
Priority: {request_payload.get("priority") or "-"}
Safety Flag: {request_payload.get("safety_flag")}

Summary:
{request_payload.get("ai_summary") or request_payload.get("description") or "-"}

Approval Route:
{request_payload.get("final_route") or request_payload.get("ai_suggested_route") or "-"}
"""


def validate_document_with_rag(
    request_id: int,
    draft_document_markdown: str | None = None,
) -> DocumentValidationResult:
    db = _db()
    try:
        request_payload = _get_request_payload(db, request_id)
        policy_evidence = _build_policy_evidence(request_payload)
        draft = draft_document_markdown or _fallback_draft(request_payload)

        prompt = _render_prompt(
            _read_prompt("document_validation.txt"),
            {
                "approved_request_json": request_payload,
                "policy_evidence_json": policy_evidence,
                "draft_document_markdown": draft,
            },
        )

        chain = _get_model().with_structured_output(DocumentValidationResult)
        return chain.invoke(prompt)
    finally:
        db.close()


def draft_notification(
    request_id: int,
    notification_type: str = "document_ready",
    recipient_role: str = "project_manager",
    validation_status: str | None = None,
) -> NotificationDraft:
    db = _db()
    try:
        request_payload = _get_request_payload(db, request_id)
        workflow_context = {
            "request": request_payload,
            "current_status": request_payload.get("status"),
            "validation_status": validation_status or "unknown",
            "document_title": request_payload.get("title"),
        }

        prompt = _render_prompt(
            _read_prompt("notification_drafting.txt"),
            {
                "notification_type": notification_type,
                "recipient_role": recipient_role,
                "workflow_context_json": workflow_context,
            },
        )

        chain = _get_model().with_structured_output(NotificationDraft)
        return chain.invoke(prompt)
    finally:
        db.close()
