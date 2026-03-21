from __future__ import annotations

from pydantic import BaseModel, Field


class ValidationIssue(BaseModel):
    severity: str = Field(..., description="low | medium | high")
    type: str = Field(
        ...,
        description="missing_field | unsupported_claim | policy_mismatch | factual_inconsistency | wording_risk",
    )
    message: str
    suggested_fix: str
    evidence_refs: list[str] = Field(default_factory=list)


class EvidenceSummaryItem(BaseModel):
    ref: str
    title: str
    section: str
    why_it_matters: str


class DocumentValidationResult(BaseModel):
    validation_status: str = Field(..., description="pass | needs_review | fail")
    issues: list[ValidationIssue] = Field(default_factory=list)
    missing_required_fields: list[str] = Field(default_factory=list)
    unsupported_claims: list[str] = Field(default_factory=list)
    evidence_summary: list[EvidenceSummaryItem] = Field(default_factory=list)
    final_note: str


class NotificationDraft(BaseModel):
    subject: str
    message: str
    action_required: str
    tone: str = "formal_concise"
