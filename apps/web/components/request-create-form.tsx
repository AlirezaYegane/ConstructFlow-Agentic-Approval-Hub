"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RequestCreateForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError(null);

    const payload = {
      project_id: Number(formData.get("project_id")),
      requester_id: Number(formData.get("requester_id")),
      request_type: String(formData.get("request_type") ?? ""),
      category: String(formData.get("category") ?? ""),
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      estimated_cost: Number(formData.get("estimated_cost")),
      priority: String(formData.get("priority") ?? ""),
      safety_flag: formData.get("safety_flag") === "on",
    };

    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : null;

      if (!response.ok) {
        throw new Error(data?.detail ?? "Failed to create request.");
      }

      router.push(`/requests/${data.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">
          Create New Request
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Submit a new variation, defect, or safety item into the approval flow.
        </p>
      </div>

      <form
        action={handleSubmit}
        className="mt-6 grid gap-4 md:grid-cols-2"
      >
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Project</label>
          <select
            name="project_id"
            defaultValue="1"
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
          >
            <option value="1">Peakhurst Renovation</option>
            <option value="2">Lindfield Duplex</option>
            <option value="3">Chatswood Fitout</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Requester</label>
          <select
            name="requester_id"
            defaultValue="1"
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
          >
            <option value="1">Alireza Yegane</option>
            <option value="2">Sarah Lee</option>
            <option value="3">Michael Tan</option>
            <option value="4">Olivia Brown</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Request Type</label>
          <select
            name="request_type"
            defaultValue="variation"
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
          >
            <option value="variation">Variation</option>
            <option value="defect">Defect</option>
            <option value="safety">Safety</option>
            <option value="procurement">Procurement</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Category</label>
          <input
            name="category"
            defaultValue="electrical"
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">Title</label>
          <input
            name="title"
            defaultValue="Temporary site lighting upgrade"
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
          <textarea
            name="description"
            rows={5}
            defaultValue="Install improved temporary lighting near the rear access path to support safer evening access and reduce visibility risk for workers."
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Estimated Cost</label>
          <input
            type="number"
            step="0.01"
            min="0"
            name="estimated_cost"
            defaultValue="1850"
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Priority</label>
          <select
            name="priority"
            defaultValue="medium"
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <label className="md:col-span-2 flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
          <input type="checkbox" name="safety_flag" className="h-4 w-4" />
          Mark as safety-related item
        </label>

        {error ? (
          <div className="md:col-span-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="md:col-span-2 flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-60"
          >
            {isSubmitting ? "Submitting..." : "Create request"}
          </button>
        </div>
      </form>
    </div>
  );
}