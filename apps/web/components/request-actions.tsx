"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Props = {
  requestId: number;
};

export default function RequestActions({ requestId }: Props) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function runAction(kind: "approve" | "reject") {
    setMessage(null);

    try {
      const response = await fetch(`/api/requests/${requestId}/${kind}`, {
        method: "POST",
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Failed to ${kind} request.`);
      }

      setMessage(kind === "approve" ? "Request approved." : "Request rejected.");

      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unexpected error.");
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button
          onClick={() => runAction("approve")}
          disabled={isPending}
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
        >
          Approve
        </button>

        <button
          onClick={() => runAction("reject")}
          disabled={isPending}
          className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-700 disabled:opacity-60"
        >
          Reject
        </button>
      </div>

      {message ? <p className="text-sm text-slate-500">{message}</p> : null}
    </div>
  );
}