from typing import Literal, List
from pydantic import BaseModel, Field


class IntakeAnalysis(BaseModel):
    summary: str
    issue_category: Literal["variation", "defect", "safety", "maintenance", "other"]
    risk_level: Literal["low", "medium", "high"]
    missing_fields: List[str] = Field(default_factory=list)
    suggested_approver_role: Literal[
        "site_supervisor", "project_manager", "director", "safety_officer", "needs_review"
    ]
    reasoning_short: str
    insufficient_evidence: bool = False


class PolicyItem(BaseModel):
    doc_id: str
    title: str
    section: str
    relevance_reason: str
    operational_rule: str


class PolicyGrounding(BaseModel):
    relevant_policies: List[PolicyItem] = Field(default_factory=list)
    policy_gaps: List[str] = Field(default_factory=list)
    confidence: Literal["low", "medium", "high"]


class ValidationIssue(BaseModel):
    severity: Literal["low", "medium", "high"]
    type: Literal[
        "missing_field",
        "unsupported_claim",
        "policy_mismatch",
        "factual_inconsistency",
        "wording_risk",
    ]
    message: str
    suggested_fix: str
    evidence_refs: List[str] = Field(default_factory=list)


class EvidenceSummary(BaseModel):
    ref: str
    title: str
    section: str
    why_it_matters: str


class DocumentValidationResult(BaseModel):
    validation_status: Literal["pass", "needs_review", "fail"]
    issues: List[ValidationIssue] = Field(default_factory=list)
    missing_required_fields: List[str] = Field(default_factory=list)
    unsupported_claims: List[str] = Field(default_factory=list)
    evidence_summary: List[EvidenceSummary] = Field(default_factory=list)
    final_note: str


class NotificationDraft(BaseModel):
    subject: str
    message: str
    action_required: str
    tone: Literal["formal_concise"] = "formal_concise"