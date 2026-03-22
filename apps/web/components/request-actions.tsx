"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { backendUrl } from "@/lib/api-base";
import type { RequestStatus } from "@/lib/request-status";

type Props = {
  requestId: number;
  status: RequestStatus;
};

export default function RequestActions({ requestId, status }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generateDocument() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(backendUrl(`/requests/${requestId}/generate-document`), {
        method: "POST",
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to generate document.");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate document.");
    } finally {
      setLoading(false);
    }
  }

  if (status === "approved") {
    return (
      <div className="space-y-3">
        <button
          type="button"
          onClick={generateDocument}
          disabled={loading}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {loading ? "Generating..." : "Generate Document"}
        </button>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </div>
        )}
      </div>
    );
  }

  if (["document_generated", "notified", "closed"].includes(status)) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        Legacy notify removed. Use the AI Validation & Notification panel below.
      </div>
    );
  }

  return null;
}
