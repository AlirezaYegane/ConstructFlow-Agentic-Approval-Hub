"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Props = {
  requestId: number;
};

export default function RecomputeButton({ requestId }: Props) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleClick() {
    setMessage(null);

    try {
      const response = await fetch(`/api/recompute/${requestId}`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to recompute request.");
      }

      setMessage("AI routing recomputed successfully.");

      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unexpected error.");
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleClick}
        disabled={isPending}
        className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Recomputing..." : "Recompute AI Routing"}
      </button>

      {message ? <p className="text-sm text-slate-500">{message}</p> : null}
    </div>
  );
}