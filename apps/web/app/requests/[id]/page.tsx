import Link from "next/link";
import { notFound } from "next/navigation";

import { getRequest, getRequestEvents } from "@/lib/api";
import { formatCurrency, priorityBadgeClass, riskBadgeClass, statusBadgeClass } from "@/lib/ui";
import RecomputeButton from "@/components/recompute-button";
import RequestActions from "@/components/request-actions";
import RequestEventTimeline from "@/components/request-event-timeline";

export const dynamic = "force-dynamic";

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const requestId = Number(id);

  if (Number.isNaN(requestId)) {
    notFound();
  }

  let request;
  let events;

  try {
    request = await getRequest(requestId);
    events = await getRequestEvents(requestId);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/requests"
            className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            Back to requests
          </Link>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
            {request.title}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Request #{request.id} · {request.project_name}
          </p>
        </div>

        <div className="space-y-3">
          <RecomputeButton requestId={request.id} />
          <RequestActions requestId={request.id} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm text-slate-500">Estimated Cost</div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">
            {formatCurrency(request.estimated_cost)}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm text-slate-500">Priority</div>
          <div className="mt-3">
            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${priorityBadgeClass(request.priority)}`}>
              {request.priority}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm text-slate-500">AI Risk</div>
          <div className="mt-3">
            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${riskBadgeClass(request.ai_risk_level)}`}>
              {request.ai_risk_level ?? "unknown"}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm text-slate-500">Status</div>
          <div className="mt-3">
            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClass(request.status)}`}>
              {request.status}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold tracking-tight text-slate-900">
              Request Overview
            </h3>

            <dl className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <dt className="text-sm text-slate-500">Requester</dt>
                <dd className="mt-1 text-sm font-medium text-slate-900">{request.requester_name}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Project</dt>
                <dd className="mt-1 text-sm font-medium text-slate-900">{request.project_name}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Request Type</dt>
                <dd className="mt-1 text-sm font-medium text-slate-900">{request.request_type}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Category</dt>
                <dd className="mt-1 text-sm font-medium text-slate-900">{request.category}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Safety Flag</dt>
                <dd className="mt-1 text-sm font-medium text-slate-900">{request.safety_flag ? "True" : "False"}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Final Route</dt>
                <dd className="mt-1 text-sm font-medium text-slate-900">{request.final_route ?? "-"}</dd>
              </div>
            </dl>

            <div className="mt-6">
              <div className="text-sm text-slate-500">Description</div>
              <p className="mt-2 text-sm leading-7 text-slate-700">{request.description}</p>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-900">AI Assessment</div>
              <p className="mt-2 text-sm leading-7 text-slate-700">
                {request.ai_summary ?? "No AI summary available."}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
          <h3 className="text-lg font-semibold tracking-tight text-slate-900">
            Audit Timeline
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Real workflow events captured by the backend.
          </p>

          <div className="mt-5">
            <RequestEventTimeline events={events} />
          </div>
        </div>
      </div>
    </div>
  );
}