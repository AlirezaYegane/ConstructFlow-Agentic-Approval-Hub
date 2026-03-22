export type ValidationStatus = "pass" | "needs_review" | "fail";

export type ValidationIssue = {
  severity: "low" | "medium" | "high";
  type:
    | "missing_field"
    | "unsupported_claim"
    | "policy_mismatch"
    | "factual_inconsistency"
    | "wording_risk";
  message: string;
  suggested_fix?: string;
  evidence_refs?: string[];
};

export type ValidationEvidence = {
  ref: string;
  title: string;
  section?: string;
  why_it_matters: string;
};

export type DocumentValidationResult = {
  validation_status: ValidationStatus;
  issues: ValidationIssue[];
  missing_required_fields: string[];
  unsupported_claims: string[];
  evidence_summary: ValidationEvidence[];
  final_note: string;
};

export type NotificationDraft = {
  subject: string;
  message: string;
  action_required: string;
  tone: "formal_concise" | string;
};
