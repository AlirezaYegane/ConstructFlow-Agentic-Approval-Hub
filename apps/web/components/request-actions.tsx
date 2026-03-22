"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { RequestStatus } from "@/lib/request-status";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8001/api";

type Props = {
  requestId: number;
  status: RequestStatus;
};

async function postJson(path: string) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(detail || "Request failed");
  }

  try {
    return await res.json();
  } catch {
    return null;
  }
}

function getStatusHelp(status: RequestStatus) {
  switch (status) {
    case "submitted":
      return "Run the AI brief, then approve the request to move it into the governed decision path.";
    case "under_review":
      return "Review the brief and approve the request if the case is ready to proceed.";
    case "needs_info":
      return "This case needs more information before it can safely move forward.";
    case "approved":
      return "The request is approved. Generate the controlled output next.";
    case "document_generated":
      return "The controlled output exists. Open the PDF and continue to validation/notification.";
    case "notified":
      return "The notification step has started. Review the trace and close the case when ready.";
    case "closed":
      return "The workflow is complete. Use the trace and document record for auditability.";
    case "rejected":
      return "The request was rejected. Keep the decision trace and supporting rationale visible.";
    default:
      return "Use the guided actions below to move the workflow forward.";
  }
}

export default function RequestActions({ requestId, status }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");

  const pdfUrl = `${API_BASE}/requests/${requestId}/document-pdf`;

  const actions = useMemo(() => {
    const items: Array<{
      key: string;
      label: string;
      kind: "primary" | "secondary" | "link";
      visible: boolean;
      run?: () => Promise<void>;
      href?: string;
    }> = [
      {
        key: "analyze",
        label: "Run AI Brief",
        kind: "secondary",
        visible: ["submitted", "under_review", "needs_info"].includes(status),
        run: async () => {
          await postJson(`/requests/${requestId}/ai/analyze`);
          setMessage("AI brief refreshed.");
          router.refresh();
        },
      },
      {
        key: "approve",
        label: "Approve Request",
        kind: "primary",
        visible: ["submitted", "under_review"].includes(status),
        run: async () => {
          await postJson(`/requests/${requestId}/approve`);
          setMessage("Request approved.");
          router.refresh();
        },
      },
      {
        key: "generate",
        label: "Generate Controlled Output",
        kind: "primary",
        visible: status === "approved",
        run: async () => {
          await postJson(`/requests/${requestId}/generate-document`);
          setMessage("Controlled output generated.");
          router.refresh();
        },
      },
      {
        key: "open-pdf",
        label: "Open Final PDF",
        kind: "link",
        visible: ["document_generated", "notified", "closed"].includes(status),
        href: pdfUrl,
      },
    ];

    return items.filter((item) => item.visible);
  }, [requestId, router, status, pdfUrl]);

  async function handleRun(
    key: string,
    run?: () => Promise<void>
  ) {
    if (!run) return;

    try {
      setLoading(key);
      setMessage("");
      await run();
    } catch (error) {
      const text =
        error instanceof Error ? error.message : "Something went wrong.";
      setMessage(text);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-4 rounded-[26px] border border-black/5 bg-white p-5 shadow-sm">
      <div>
        <div className="cf-kicker text-[11px] font-semibold text-slate-500">
          Guided Actions
        </div>
        <h3 className="mt-2 text-lg font-semibold text-slate-950">
          Move the workflow forward
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {getStatusHelp(status)}
        </p>
      </div>

      <div className="space-y-3">
        {actions.map((action) => {
          if (action.kind === "link" && action.href) {
            return (
              <a
                key={action.key}
                href={action.href}
                target="_blank"
                rel="noreferrer"
                className="cf-primary-btn !flex !w-full !text-white hover:!text-white"
              >
                {action.label}
              </a>
            );
          }

          const className =
            action.kind === "primary"
              ? "cf-primary-btn !flex !w-full !text-white hover:!text-white"
              : "cf-secondary-btn !flex !w-full";

          return (
            <button
              key={action.key}
              type="button"
              className={className}
              disabled={loading !== null}
              onClick={() => handleRun(action.key, action.run)}
            >
              {loading === action.key ? "Working..." : action.label}
            </button>
          );
        })}
      </div>

      <div className="rounded-[20px] bg-slate-50 p-4">
        <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
          Current status
        </div>
        <div className="mt-2 text-sm font-semibold text-slate-900">{status}</div>
      </div>

      {message ? (
        <div className="rounded-[18px] border border-[rgba(22,50,79,0.10)] bg-[var(--cf-soft-navy)] px-4 py-3 text-sm text-slate-700">
          {message}
        </div>
      ) : null}
    </div>
  );
}
