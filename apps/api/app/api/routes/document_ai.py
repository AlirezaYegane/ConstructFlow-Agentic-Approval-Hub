from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.schemas.ai_documents import DocumentValidationResult, NotificationDraft
from app.services.document_validation_service import (
    draft_notification,
    validate_document_with_rag,
)

router = APIRouter(prefix="/api/requests", tags=["ai-documents"])


class DocumentValidationRequest(BaseModel):
    draft_document_markdown: str | None = None


class NotificationDraftRequest(BaseModel):
    notification_type: str = "document_ready"
    recipient_role: str = "project_manager"
    validation_status: str | None = None


@router.post(
    "/{request_id}/ai/document-validation",
    response_model=DocumentValidationResult,
)
def run_document_validation(request_id: int, payload: DocumentValidationRequest):
    try:
        return validate_document_with_rag(
            request_id=request_id,
            draft_document_markdown=payload.draft_document_markdown,
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.post(
    "/{request_id}/ai/notification-draft",
    response_model=NotificationDraft,
)
def run_notification_draft(request_id: int, payload: NotificationDraftRequest):
    try:
        return draft_notification(
            request_id=request_id,
            notification_type=payload.notification_type,
            recipient_role=payload.recipient_role,
            validation_status=payload.validation_status,
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
