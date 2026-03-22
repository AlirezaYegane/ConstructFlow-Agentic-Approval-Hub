"use client";

import { useMemo, useState } from "react";
import { backendUrl } from "@/lib/api-base";
import type { RequestStatus } from "@/lib/request-status";
import type {
  DocumentValidationResult,
  NotificationDraft,
  ValidationStatus,
} from "@/lib/ai-types";

type Props = {
  requestId: number;
  requestStatus: RequestStatus;
  previewContent: string | null;
};

const recipientOptions = [
  "project_manager",
  "site_supervisor",
  "director",
  "safety_officer",
] as const;

function validationBadgeClass(status: ValidationStatus) {
  switch (status) {
    case "pass":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "needs_review":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "fail":
      return "bg-rose-100 text-rose-800 border-rose-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

function issueBadgeClass(severity: string) {
  switch (severity) {
    case "high":
      return "bg-rose-100 text-rose-800";
    case "medium":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export default function RequestAiPanel({
  requestId,
  requestStatus,
  previewContent,
}: Props) {
  const [recipientRole, setRecipientRole] =
    useState<(typeof recipientOptions)[number]>("project_manager");
  const [validation, setValidation] = useState<DocumentValidationResult | null>(null);
  const [notification, setNotification] = useState<NotificationDraft | null>(null);
  const [loadingValidation, setLoadingValidation] = useState(false);
  const [loadingNotification, setLoadingNotification] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canValidate =
    !!previewContent &&
    ["document_generated", "notified", "closed"].includes(requestStatus);

  const canDraftNotification = useMemo(() => {
    if (!validation) return false;
    return validation.validation_status !== "fail";
  }, [validation]);

  async function runValidation() {
    if (!previewContent) return;

    setLoadingValidation(true);
    setError(null);
    setNotification(null);

    try {
      const res = await fetch(
        backendUrl(`/requests/${requestId}/ai/document-validation`),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            draft_document_markdown: previewContent,
          }),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Document validation failed.");
      }

      const json = (await res.json()) as DocumentValidationResult;
      setValidation(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Document validation failed.");
    } finally {
      setLoadingValidation(false);
    }
  }

  async function draftNotification() {
    if (!validation) return;

    setLoadingNotification(true);
    setError(null);

    try {
      const res = await fetch(
        backendUrl(`/requests/${requestId}/ai/notification-draft`),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            notification_type: "document_ready",
            recipient_role: recipientRole,
            validation_status: validation.validation_status,
          }),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Notification drafting failed.");
      }

      const json = (await res.json()) as NotificationDraft;
      setNotification(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Notification drafting failed.");
    } finally {
      setLoadingNotification(false);
    }
  }

  return (
    <section className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">AI Validation & Notification</h2>
          <p className="mt-1 text-sm text-slate-500">
            Validate the generated controlled document, inspect evidence-backed findings,
            then draft the stakeholder notification.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={runValidation}
            disabled={!canValidate || loadingValidation}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {loadingValidation ? "Validating..." : "Validate Document"}
          </button>
        </div>
      </div>

      {!canValidate && (
        <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
          Validation becomes available once the request has a generated document preview.
        </div>
      )}

      {error && (
        <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      {validation && (
        <div className="mt-6 space-y-6">
          <div className="rounded-2xl border border-slate-200 overflow-hidden">
            <div className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-900">Validation Result</div>
                <div className="mt-1 text-sm text-slate-500">
                  Policy-backed review of the current controlled document.
                </div>
              </div>

              <span
                className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${validationBadgeClass(
                  validation.validation_status
                )}`}
              >
                {validation.validation_status}
              </span>
            </div>

            <div className="space-y-4 p-5">
              <div className="rounded-xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">
                {validation.final_note || "No final note provided."}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="text-sm font-semibold text-slate-900">Missing Required Fields</div>
                  {validation.missing_required_fields?.length ? (
                    <ul className="mt-3 space-y-2 text-sm text-slate-700">
                      {validation.missing_required_fields.map((item) => (
                        <li key={item} className="rounded-lg bg-slate-50 px-3 py-2">
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-sm text-slate-500">No missing required fields.</p>
                  )}
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="text-sm font-semibold text-slate-900">Unsupported Claims</div>
                  {validation.unsupported_claims?.length ? (
                    <ul className="mt-3 space-y-2 text-sm text-slate-700">
                      {validation.unsupported_claims.map((item) => (
                        <li key={item} className="rounded-lg bg-slate-50 px-3 py-2">
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-sm text-slate-500">No unsupported claims detected.</p>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <div className="text-sm font-semibold text-slate-900">Issues</div>

                {validation.issues?.length ? (
                  <div className="mt-3 space-y-3">
                    {validation.issues.map((issue, index) => (
                      <div key={`${issue.type}-${index}`} className="rounded-xl bg-slate-50 p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${issueBadgeClass(
                              issue.severity
                            )}`}
                          >
                            {issue.severity}
                          </span>
                          <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700">
                            {issue.type}
                          </span>
                        </div>

                        <p className="mt-3 text-sm font-medium text-slate-900">{issue.message}</p>

                        {issue.suggested_fix && (
                          <p className="mt-2 text-sm text-slate-700">
                            <span className="font-medium text-slate-900">Suggested fix:</span>{" "}
                            {issue.suggested_fix}
                          </p>
                        )}

                        {issue.evidence_refs?.length ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {issue.evidence_refs.map((ref) => (
                              <span
                                key={ref}
                                className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-medium text-violet-800"
                              >
                                {ref}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-slate-500">No material issues reported.</p>
                )}
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <div className="text-sm font-semibold text-slate-900">Evidence Summary</div>

                {validation.evidence_summary?.length ? (
                  <div className="mt-3 grid gap-3">
                    {validation.evidence_summary.map((item) => (
                      <div key={item.ref} className="rounded-xl bg-slate-50 p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white">
                            {item.ref}
                          </span>
                          <span className="text-sm font-medium text-slate-900">{item.title}</span>
                          {item.section ? (
                            <span className="text-xs text-slate-500">Section: {item.section}</span>
                          ) : null}
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-700">
                          {item.why_it_matters}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-slate-500">No evidence summary returned.</p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 overflow-hidden">
            <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
              <div className="text-sm font-semibold text-slate-900">Draft Notification</div>
              <div className="mt-1 text-sm text-slate-500">
                Notify stakeholders only after the document passes or is reviewable.
              </div>
            </div>

            <div className="space-y-4 p-5">
              <div className="grid gap-4 md:grid-cols-[220px_1fr] md:items-end">
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-800">Recipient Role</span>
                  <select
                    value={recipientRole}
                    onChange={(e) =>
                      setRecipientRole(e.target.value as (typeof recipientOptions)[number])
                    }
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0"
                  >
                    {recipientOptions.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={draftNotification}
                    disabled={!canDraftNotification || loadingNotification}
                    className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {loadingNotification ? "Drafting..." : "Draft Notification"}
                  </button>

                  {!canDraftNotification && (
                    <span className="text-sm text-slate-500">
                      Notification stays locked when validation fails.
                    </span>
                  )}
                </div>
              </div>

              {notification && (
                <div className="rounded-2xl border border-slate-200 bg-white">
                  <div className="border-b border-slate-200 px-4 py-3">
                    <div className="text-xs uppercase tracking-wide text-slate-500">
                      Notification Preview
                    </div>
                    <div className="mt-1 text-base font-semibold text-slate-900">
                      {notification.subject}
                    </div>
                  </div>

                  <div className="space-y-4 px-4 py-4">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Message
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                        {notification.message}
                      </p>
                    </div>

                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Action Required
                      </div>
                      <p className="mt-2 text-sm leading-7 text-slate-700">
                        {notification.action_required}
                      </p>
                    </div>

                    <div className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 w-fit">
                      {notification.tone}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
