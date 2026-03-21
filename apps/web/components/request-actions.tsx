"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  canApprove,
  canReject,
  canRequestInfo,
  canSendToReview,
  canGenerateDocument,
  isHardTerminalStatus,
  type RequestStatus,
} from "@/lib/request-status";

type Props = {
  requestId: number;
  status: RequestStatus;
};

type ActionName =
  | "approve"
  | "reject"
  | "request-info"
  | "send-to-review"
  | "generate-document";

export default function RequestActions({ requestId, status }: Props) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<ActionName | null>(null);

  async function runAction(action: ActionName) {
    setLoadingAction(action);

    try {
      const res = await fetch(`/api/requests/${requestId}/${action}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      });

      const contentType = res.headers.get("content-type") ?? "";
      const data = contentType.includes("application/json")
        ? await res.json()
        : null;

      if (!res.ok) {
        alert(data?.detail ?? `Action "${action}" failed.`);
        return;
      }

      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unexpected network error.";
      alert(message);
    } finally {
      setLoadingAction(null);
    }
  }

  const isBusy = loadingAction !== null;

  return (
    <div className="space-y-3">
      {status === "document_generated" && (
        <div className="rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-700">
          Document has been generated. Use the preview and PDF section below.
        </div>
      )}

      {isHardTerminalStatus(status) && (
        <div className="rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
          This request is in a terminal state. No further workflow actions are available.
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {canSendToReview(status) && (
          <button
            type="button"
            onClick={() => runAction("send-to-review")}
            disabled={isBusy}
            className="rounded-xl border px-4 py-2 text-sm font-medium transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingAction === "send-to-review" ? "Sending..." : "Send to Review"}
          </button>
        )}

        {canApprove(status) && (
          <button
            type="button"
            onClick={() => runAction("approve")}
            disabled={isBusy}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingAction === "approve" ? "Approving..." : "Approve"}
          </button>
        )}

        {canReject(status) && (
          <button
            type="button"
            onClick={() => runAction("reject")}
            disabled={isBusy}
            className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingAction === "reject" ? "Rejecting..." : "Reject"}
          </button>
        )}

        {canRequestInfo(status) && (
          <button
            type="button"
            onClick={() => runAction("request-info")}
            disabled={isBusy}
            className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingAction === "request-info" ? "Sending..." : "Request Info"}
          </button>
        )}

        {canGenerateDocument(status) && (
          <button
            type="button"
            onClick={() => runAction("generate-document")}
            disabled={isBusy}
            className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingAction === "generate-document"
              ? "Generating..."
              : "Generate Document"}
          </button>
        )}
      </div>
    </div>
  );
}
