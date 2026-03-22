"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, FileSearch, Mail, ShieldCheck, Sparkles } from "lucide-react";
import type { RequestStatus } from "@/lib/request-status";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8001/api";

type ValidationIssue = {
  severity?: string;
  type?: string;
  message?: string;
  suggested_fix?: string;
  evidence_refs?: string[];
};

type EvidenceItem = {
  ref?: string;
  title?: string;
  section?: string;
  why_it_matters?: string;
};

type ValidationResult = {
  validation_status?: "pass" | "needs_review" | "fail";
  issues?: ValidationIssue[];
  missing_required_fields?: string[];
  unsupported_claims?: string[];
  evidence_summary?: EvidenceItem[];
  final_note?: string;
};

type NotificationDraft = {
  subject?: string;
  message?: string;
  action_required?: string;
  tone?: string;
};

type Props = {
  requestId: number;
  status: RequestStatus;
  previewTitle?: string | null;
  previewContent?: string | null;
  projectName?: string | null;
  requestTitle?: string | null;
  finalRoute?: string | null;
  aiRiskLevel?: string | null;
};

async function postJson(path: string, body: unknown) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(text || "Request failed");
  }

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function statusTone(status?: string) {
  switch (status) {
    case "pass":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "needs_review":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "fail":
      return "border-rose-200 bg-rose-50 text-rose-700";
    default:
      return "border-slate-200 bg-slate-100 text-slate-700";
  }
}

function pickRecipientRole(finalRoute?: string | null) {
  const text = (finalRoute || "").toLowerCase();

  if (text.includes("project_manager")) return "project_manager";
  if (text.includes("safety_officer")) return "safety_officer";
  if (text.includes("director")) return "director";
  return "site_supervisor";
}

export default function RequestAiPanel({
  requestId,
  status,
  previewTitle,
  previewContent,
  projectName,
  requestTitle,
  finalRoute,
  aiRiskLevel,
}: Props) {
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [notification, setNotification] = useState<NotificationDraft | null>(null);
  const [loading, setLoading] = useState<"validate" | "notify" | null>(null);
  const [message, setMessage] = useState<string>("");

  const canValidate = useMemo(() => {
    return Boolean(previewContent) && ["document_generated", "notified", "closed"].includes(status);
  }, [previewContent, status]);

  const canNotify = useMemo(() => {
    return Boolean(validation) && validation?.validation_status !== "fail";
  }, [validation]);

  async function runValidation() {
    if (!previewContent) return;

    try {
      setLoading("validate");
      setMessage("");
      setNotification(null);

      const result = await postJson(`/requests/${requestId}/ai/document-validation`, {
        document_type: "variation_approval",
        document_title: previewTitle ?? `Request ${requestId} controlled record`,
        draft_document_markdown: previewContent,
        document_markdown: previewContent,
        document_content: previewContent,
      });

      setValidation(result);
      setMessage("Validation result refreshed.");
    } catch (error) {
      const raw = error instanceof Error ? error.message : "Validation failed.";

      if (
        raw.includes("RESOURCE_EXHAUSTED") ||
        raw.includes("429") ||
        raw.toLowerCase().includes("quota")
      ) {
        setMessage(
          "AI validation is temporarily unavailable because the model provider quota has been exceeded. Please retry shortly or switch to a billed provider key."
        );
      } else {
        setMessage("Validation failed. Please review the backend response and try again.");
      }
    } finally {
      setLoading(null);
    }
  }

  async function runNotificationDraft() {
    if (!validation) return;

    try {
      setLoading("notify");
      setMessage("");

      const result = await postJson(`/requests/${requestId}/ai/notification-draft`, {
        notification_type: "document_ready",
        recipient_role: pickRecipientRole(finalRoute),
        validation_status: validation.validation_status ?? "needs_review",
      });

      setNotification(result);
      setMessage("Notification draft created.");
    } catch (error) {
      const raw = error instanceof Error ? error.message : "Notification draft failed.";

      if (
        raw.includes("RESOURCE_EXHAUSTED") ||
        raw.includes("429") ||
        raw.toLowerCase().includes("quota")
      ) {
        setMessage(
          "AI drafting is temporarily unavailable because the model provider quota has been exceeded. Please retry shortly or switch to a billed provider key."
        );
      } else {
        setMessage("Notification drafting failed. Please review the backend response and try again.");
      }
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="cf-card rounded-[30px] p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="cf-kicker text-[11px] font-semibold text-slate-500">
              AI Validation & Notification
            </div>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">
              Let the AI assistant inspect the controlled output
            </h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              AI supports validation, evidence summarization, and stakeholder drafting — but not the final approval decision.
            </p>
          </div>

          <div className="rounded-full border border-[rgba(22,50,79,0.10)] bg-[var(--cf-soft-navy)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--cf-navy)]">
            AI Assistant
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-[22px] bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
              Current Context
            </div>
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              <div><span className="font-semibold text-slate-900">Project:</span> {projectName || "-"}</div>
              <div><span className="font-semibold text-slate-900">Request:</span> {requestTitle || "-"}</div>
              <div><span className="font-semibold text-slate-900">Final Route:</span> {finalRoute || "-"}</div>
              <div><span className="font-semibold text-slate-900">AI Risk:</span> {aiRiskLevel || "-"}</div>
            </div>
          </div>

          <div className="rounded-[22px] border border-black/5 bg-white p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
              Guided Actions
            </div>

            <div className="mt-3 space-y-3">
              <button
                type="button"
                disabled={!canValidate || loading !== null}
                onClick={runValidation}
                className="cf-primary-btn !flex !w-full !text-white hover:!text-white"
                aria-disabled={!canValidate || loading !== null}
              >
                <FileSearch className="h-4 w-4" />
                {loading === "validate" ? "Validating..." : "Validate Controlled Output"}
              </button>

              <button
                type="button"
                disabled={!canNotify || loading !== null}
                onClick={runNotificationDraft}
                className="cf-secondary-btn !flex !w-full"
                aria-disabled={!canNotify || loading !== null}
              >
                <Mail className="h-4 w-4" />
                {loading === "notify" ? "Drafting..." : "Draft Notification"}
              </button>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              {!canValidate
                ? "Validation becomes available after the controlled output has been generated."
                : !canNotify
                ? "Run validation first. Notification drafting unlocks after a pass or needs_review result."
                : "Validation is complete. You can now review and use the stakeholder draft."}
            </p>
          </div>
        </div>

        {message ? (
          <div className="mt-4 rounded-[18px] border border-[rgba(22,50,79,0.10)] bg-[var(--cf-soft-navy)] px-4 py-3 text-sm text-slate-700">
            {message}
          </div>
        ) : null}
      </div>

      {validation ? (
        <div className="cf-card rounded-[30px] p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <div className="cf-kicker text-[11px] font-semibold text-slate-500">
                Validation Result
              </div>
              <h2 className="mt-2 text-xl font-semibold text-slate-950">
                Evidence-backed document check
              </h2>
            </div>

            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusTone(validation.validation_status)}`}>
              {validation.validation_status ?? "unknown"}
            </span>
          </div>

          <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-4">
              <div className="rounded-[22px] border border-black/5 bg-white p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <ShieldCheck className="h-4 w-4" />
                  Final Note
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-700">
                  {validation.final_note || "No final note returned."}
                </p>
              </div>

              <div className="rounded-[22px] border border-black/5 bg-white p-4">
                <div className="text-sm font-semibold text-slate-900">
                  Missing Required Fields
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(validation.missing_required_fields ?? []).length > 0 ? (
                    validation.missing_required_fields?.map((item) => (
                      <span key={item} className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                        {item}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">No required-field gaps.</span>
                  )}
                </div>
              </div>

              <div className="rounded-[22px] border border-black/5 bg-white p-4">
                <div className="text-sm font-semibold text-slate-900">
                  Unsupported Claims
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(validation.unsupported_claims ?? []).length > 0 ? (
                    validation.unsupported_claims?.map((item) => (
                      <span key={item} className="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700">
                        {item}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">No unsupported claims were flagged.</span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[22px] border border-black/5 bg-white p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <AlertTriangle className="h-4 w-4" />
                  Issues
                </div>

                <div className="mt-4 space-y-3">
                  {(validation.issues ?? []).length > 0 ? (
                    validation.issues?.map((issue, index) => (
                      <div key={`${issue.type}-${index}`} className="rounded-[18px] bg-slate-50 p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                            {issue.severity || "issue"}
                          </span>
                          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                            {issue.type || "validation_issue"}
                          </span>
                        </div>

                        <p className="mt-3 text-sm leading-6 text-slate-700">
                          {issue.message || "-"}
                        </p>

                        {issue.suggested_fix ? (
                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            <span className="font-semibold text-slate-900">Suggested fix:</span> {issue.suggested_fix}
                          </p>
                        ) : null}

                        {(issue.evidence_refs ?? []).length > 0 ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {issue.evidence_refs?.map((ref) => (
                              <span key={ref} className="rounded-full bg-[var(--cf-soft-navy)] px-3 py-1 text-xs font-medium text-[var(--cf-navy)]">
                                {ref}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[18px] bg-[var(--cf-soft-teal)] p-4 text-sm text-slate-700">
                      No material issues were returned.
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-[22px] border border-black/5 bg-white p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Sparkles className="h-4 w-4" />
                  Evidence Summary
                </div>

                <div className="mt-4 space-y-3">
                  {(validation.evidence_summary ?? []).length > 0 ? (
                    validation.evidence_summary?.map((item, index) => (
                      <div key={`${item.ref}-${index}`} className="rounded-[18px] bg-slate-50 p-4">
                        <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                          {item.ref || "evidence"}
                        </div>
                        <div className="mt-2 text-sm font-semibold text-slate-900">
                          {item.title || "-"}
                        </div>
                        <div className="mt-1 text-sm text-slate-600">
                          Section: {item.section || "-"}
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-700">
                          {item.why_it_matters || "-"}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[18px] bg-slate-50 p-4 text-sm text-slate-600">
                      No evidence summary returned.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {notification ? (
        <div className="cf-card rounded-[30px] p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <div className="cf-kicker text-[11px] font-semibold text-slate-500">
                Draft Notification
              </div>
              <h2 className="mt-2 text-xl font-semibold text-slate-950">
                Stakeholder-ready communication draft
              </h2>
            </div>

            <div className="rounded-full border border-[rgba(47,107,95,0.14)] bg-[var(--cf-soft-teal)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--cf-green)]">
              Draft ready
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[22px] bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                Subject
              </div>
              <div className="mt-2 text-sm font-semibold text-slate-900">
                {notification.subject || "-"}
              </div>
            </div>

            <div className="rounded-[22px] bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                Message
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                {notification.message || "-"}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[22px] bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Action Required
                </div>
                <div className="mt-2 text-sm text-slate-700">
                  {notification.action_required || "-"}
                </div>
              </div>

              <div className="rounded-[22px] bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Tone
                </div>
                <div className="mt-2 text-sm text-slate-700">
                  {notification.tone || "-"}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
