import { notFound } from "next/navigation";
import RequestActions from "@/components/request-actions";
import RequestAiPanel from "@/components/request-ai-panel";
import type { RequestStatus } from "@/lib/request-status";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8001/api";
const PUBLIC_API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8001/api";

type RequestDetail = {
  id: number;
  status: RequestStatus;
  title?: string | null;
  request_type?: string | null;
  requester_name?: string | null;
  actor_name?: string | null;
  project_name?: string | null;
  category?: string | null;
  estimated_cost?: number | null;
  priority?: string | null;
  safety_flag?: boolean | null;
  description?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  ai_summary?: string | null;
  ai_risk_level?: string | null;
  ai_suggested_route?: string | null;
  final_route?: string | null;
  metadata?: Record<string, unknown> | null;
  payload?: Record<string, unknown> | null;
  data?: Record<string, unknown> | null;
};

type RequestEvent = {
  id: number;
  request_id: number;
  actor_name?: string | null;
  action?: string | null;
  from_status?: string | null;
  to_status?: string | null;
  note?: string | null;
  created_at?: string | null;
};

type DocumentPreview = {
  title: string;
  filename: string;
  content: string;
};

function formatDate(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatCurrency(value?: number | null) {
  if (typeof value !== "number") return "-";

  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(value);
}

function statusBadgeClass(status: string) {
  switch (status) {
    case "approved":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "rejected":
      return "border-rose-200 bg-rose-50 text-rose-700";
    case "under_review":
      return "border-sky-200 bg-sky-50 text-sky-700";
    case "needs_info":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "submitted":
      return "border-slate-200 bg-slate-100 text-slate-700";
    case "document_generated":
      return "border-[rgba(22,50,79,0.14)] bg-[var(--cf-soft-navy)] text-[var(--cf-navy)]";
    case "notified":
      return "border-[rgba(47,107,95,0.14)] bg-[var(--cf-soft-teal)] text-[var(--cf-green)]";
    case "closed":
      return "border-zinc-200 bg-zinc-100 text-zinc-700";
    default:
      return "border-slate-200 bg-slate-100 text-slate-700";
  }
}

function lifecycleFromStatus(status: string) {
  if (status === "submitted") return 1;
  if (["under_review", "needs_info"].includes(status)) return 2;
  if (["approved", "rejected"].includes(status)) return 3;
  if (["document_generated"].includes(status)) return 4;
  if (["notified", "closed"].includes(status)) return 5;
  return 1;
}

function nextActionHint(status: string) {
  switch (status) {
    case "submitted":
      return "Review the intake and confirm whether this case should move into a decision state.";
    case "under_review":
      return "Use the operational brief and evidence pack to decide the next governed transition.";
    case "needs_info":
      return "Request the missing material before allowing the workflow to proceed.";
    case "approved":
      return "The request is approved. Generate the controlled output to continue the workflow.";
    case "document_generated":
      return "Validate the generated controlled document and prepare the stakeholder notification.";
    case "notified":
      return "The notification has been prepared or sent. Close the loop and retain the trace.";
    case "closed":
      return "This case is complete. Use the decision trace for reference and auditability.";
    case "rejected":
      return "The case was rejected. Confirm the rejection notice and keep the event history intact.";
    default:
      return "Use the detail page to understand the current state and next governed action.";
  }
}

function toDisplayValue(value: unknown) {
  if (value === null || value === undefined) return "-";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return String(value);
  if (typeof value === "string") return value.trim() || "-";

  try {
    const text = JSON.stringify(value);
    if (text.length > 120) return `${text.slice(0, 117)}...`;
    return text;
  } catch {
    return "-";
  }
}

function getEvidenceEntries(
  data?: Record<string, unknown> | null
): Array<{ label: string; value: string }> {
  if (!data) return [];

  return Object.entries(data)
    .filter(([key]) => !["description", "title"].includes(key))
    .slice(0, 8)
    .map(([key, value]) => ({
      label: key.replace(/_/g, " "),
      value: toDisplayValue(value),
    }));
}

async function getRequest(id: string): Promise<RequestDetail> {
  const res = await fetch(`${API_BASE}/requests/${id}`, {
    cache: "no-store",
  });

  if (res.status === 404) {
    notFound();
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch request ${id}`);
  }

  return res.json();
}

async function getEvents(id: string): Promise<RequestEvent[]> {
  const res = await fetch(`${API_BASE}/requests/${id}/events`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return [];
  }

  const json = await res.json();

  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.value)) return json.value;

  return [];
}

async function getDocumentPreview(
  id: string,
  status: RequestStatus
): Promise<DocumentPreview | null> {
  if (!["document_generated", "notified", "closed"].includes(status)) {
    return null;
  }

  const res = await fetch(`${API_BASE}/requests/${id}/document-preview`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return null;
  }

  return res.json();
}

function parseDocumentPreview(content: string) {
  const clean = content.replace(/^#\s*/gm, "").trim();
  const blocks = clean
    .split(/\n\s*\n/g)
    .map((item) => item.trim())
    .filter(Boolean);

  if (blocks.length === 0) {
    return {
      title: "Controlled Record",
      meta: [] as Array<{ label: string; value: string }>,
      sections: [] as Array<{ heading: string; body: string }>,
    };
  }

  const title = blocks[0];
  const metaBlock = blocks[1] ?? "";

  const meta = metaBlock
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, ...rest] = line.split(":");
      return {
        label: label.trim(),
        value: rest.join(":").trim(),
      };
    });

  const sections = blocks.slice(2).reduce<Array<{ heading: string; body: string }>>(
    (acc, block) => {
      const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
      if (lines.length === 0) return acc;

      if (lines.length === 1) {
        acc.push({
          heading: "Details",
          body: lines[0],
        });
        return acc;
      }

      acc.push({
        heading: lines[0].replace(/:$/, ""),
        body: lines.slice(1).join("\n"),
      });
      return acc;
    },
    []
  );

  return { title, meta, sections };
}

const flowSteps = [
  { label: "Signal", note: "Request captured" },
  { label: "Assessment", note: "AI brief prepared" },
  { label: "Decision", note: "Human approval gate" },
  { label: "Document", note: "Controlled output" },
  { label: "Trace", note: "Audit retained" },
] as const;

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [request, events] = await Promise.all([getRequest(id), getEvents(id)]);
  const preview = await getDocumentPreview(id, request.status);

  const extraData = request.metadata ?? request.payload ?? request.data ?? null;
  const evidenceEntries = getEvidenceEntries(extraData);
  const previewData = preview ? parseDocumentPreview(preview.content) : null;
  const activeStep = lifecycleFromStatus(request.status);

  return (
    <main className="space-y-6">
      <section className="cf-card rounded-[30px] p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-4">
            <div className="cf-kicker text-[11px] font-semibold text-slate-500">
              Decision Room
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
                {request.title?.trim() || `Request #${request.id}`}
              </h1>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusBadgeClass(
                  request.status
                )}`}
              >
                {request.status}
              </span>
            </div>

            <p className="max-w-3xl text-sm leading-7 text-slate-600">
              Review the case context, use the operational brief, take a governed action,
              and keep the decision trace intact.
            </p>
          </div>

          <div className="w-full xl:w-[340px]">
            <RequestActions requestId={request.id} status={request.status} />
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-5">
          {flowSteps.map((step, index) => {
            const isActive = index + 1 === activeStep;
            const isDone = index + 1 < activeStep;

            return (
              <div
                key={step.label}
                className={[
                  "rounded-[22px] border px-4 py-4 transition",
                  isActive
                    ? "border-[var(--cf-navy)] bg-[var(--cf-navy)] text-white"
                    : isDone
                    ? "border-[rgba(47,107,95,0.16)] bg-[var(--cf-soft-teal)] text-slate-900"
                    : "border-black/5 bg-white text-slate-700",
                ].join(" ")}
              >
                <div className="text-xs font-semibold uppercase tracking-[0.14em] opacity-80">
                  Step {index + 1}
                </div>
                <div className="mt-2 text-base font-semibold">{step.label}</div>
                <div className="mt-1 text-sm opacity-80">{step.note}</div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr_0.85fr]">
        <section className="space-y-6">
          <div className="cf-card rounded-[30px] p-6">
            <div className="cf-kicker text-[11px] font-semibold text-slate-500">
              Case Context
            </div>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">
              Request facts at a glance
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[22px] bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Project
                </div>
                <div className="mt-2 text-sm font-medium text-slate-900">
                  {request.project_name || "-"}
                </div>
              </div>

              <div className="rounded-[22px] bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Requester
                </div>
                <div className="mt-2 text-sm font-medium text-slate-900">
                  {request.requester_name || request.actor_name || "-"}
                </div>
              </div>

              <div className="rounded-[22px] bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Type / Category
                </div>
                <div className="mt-2 text-sm font-medium text-slate-900">
                  {(request.request_type || "-") + " / " + (request.category || "-")}
                </div>
              </div>

              <div className="rounded-[22px] bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Estimated Cost
                </div>
                <div className="mt-2 text-sm font-medium text-slate-900">
                  {formatCurrency(request.estimated_cost)}
                </div>
              </div>

              <div className="rounded-[22px] bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Priority
                </div>
                <div className="mt-2 text-sm font-medium text-slate-900">
                  {request.priority || "-"}
                </div>
              </div>

              <div className="rounded-[22px] bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Safety Flag
                </div>
                <div className="mt-2 text-sm font-medium text-slate-900">
                  {request.safety_flag ? "Raised" : "Not raised"}
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-[24px] border border-black/5 bg-white p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                Description
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                {request.description?.trim() || "No description provided."}
              </p>
            </div>
          </div>

          <div className="cf-card rounded-[30px] p-6">
            <div className="cf-kicker text-[11px] font-semibold text-slate-500">
              Evidence Pack
            </div>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">
              Supporting context
            </h2>

            {evidenceEntries.length > 0 ? (
              <div className="mt-5 grid gap-4">
                {evidenceEntries.map((item) => (
                  <div key={`${item.label}-${item.value}`} className="rounded-[22px] border border-black/5 bg-white p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                      {item.label}
                    </div>
                    <div className="mt-2 text-sm leading-6 text-slate-700">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">
                No extra evidence pack is available for this request.
              </p>
            )}
          </div>
        </section>

        <section className="space-y-6">
          <div className="cf-card rounded-[30px] p-6">
            <div className="cf-kicker text-[11px] font-semibold text-slate-500">
              Decision Intelligence
            </div>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">
              Operational Brief
            </h2>

            <div className="mt-5 grid gap-4">
              <div className="rounded-[24px] border border-black/5 bg-white p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  AI Summary
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-700">
                  {request.ai_summary || "No AI summary is available yet."}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[22px] bg-slate-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Risk Assessment
                  </div>
                  <div className="mt-2 text-sm font-medium text-slate-900">
                    {request.ai_risk_level || "-"}
                  </div>
                </div>

                <div className="rounded-[22px] bg-slate-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Suggested Route
                  </div>
                  <div className="mt-2 text-sm font-medium text-slate-900">
                    {request.ai_suggested_route || "-"}
                  </div>
                </div>

                <div className="rounded-[22px] bg-slate-50 p-4 md:col-span-2">
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Final Route
                  </div>
                  <div className="mt-2 text-sm font-medium text-slate-900">
                    {request.final_route || "Pending governed routing"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="cf-card rounded-[30px] p-6">
            <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="cf-kicker text-[11px] font-semibold text-slate-500">
                  Controlled Output
                </div>
                <h2 className="mt-2 text-xl font-semibold text-slate-950">
                  Preview the archived approval record
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Review the controlled output before opening the final PDF.
                </p>
              </div>

              {preview ? (
                <a
                  href={`${PUBLIC_API_BASE}/requests/${request.id}/document-pdf`}
                  target="_blank"
                  rel="noreferrer"
                  className="cf-primary-btn !text-white hover:!text-white"
                >
                  Open final PDF
                </a>
              ) : null}
            </div>

            {preview && previewData ? (
              <div className="space-y-5">
                <div className="rounded-[26px] bg-[var(--cf-navy)] p-6 text-white shadow-[0_14px_40px_rgba(15,23,42,0.16)]">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="cf-kicker text-[11px] font-semibold text-slate-300">
                        ConstructFlow Controlled Record
                      </div>
                      <h3 className="mt-3 text-2xl font-semibold">{previewData.title}</h3>
                      <p className="mt-2 text-sm text-slate-300">
                        Approval outcome archived for project operations.
                      </p>
                    </div>

                    <div className="rounded-full bg-white/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white">
                      Controlled Record
                    </div>
                  </div>
                </div>

                {previewData.meta.length > 0 && (
                  <div className="grid gap-4 md:grid-cols-2">
                    {previewData.meta.map((item) => (
                      <div
                        key={`${item.label}-${item.value}`}
                        className="rounded-[22px] border border-black/5 bg-slate-50 p-4"
                      >
                        <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                          {item.label}
                        </div>
                        <div className="mt-2 text-sm font-medium leading-6 text-slate-900">
                          {item.value || "-"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid gap-4">
                  {previewData.sections.map((section, index) => (
                    <div
                      key={`${section.heading}-${index}`}
                      className="overflow-hidden rounded-[24px] border border-black/5"
                    >
                      <div className="bg-[var(--cf-navy)] px-4 py-3 text-sm font-semibold text-white">
                        {section.heading}
                      </div>
                      <div className="bg-white px-4 py-4 text-sm leading-7 text-slate-700">
                        <p className="whitespace-pre-wrap">{section.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : request.status === "approved" ? (
              <div className="rounded-[22px] border border-[rgba(183,121,31,0.18)] bg-[var(--cf-soft-amber)] p-4 text-sm leading-6 text-slate-700">
                This request is approved and ready. Generate the controlled output to unlock the preview and final PDF.
              </div>
            ) : (
              <div className="rounded-[22px] border border-black/5 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                Controlled output becomes available once the request reaches the document stage.
              </div>
            )}
          </div>
        </section>

        <aside className="space-y-6">
          <div className="cf-card rounded-[30px] p-6">
            <div className="cf-kicker text-[11px] font-semibold text-slate-500">
              Action Rail
            </div>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">
              Current state and next move
            </h2>

            <div className="mt-5 rounded-[22px] bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                Current Status
              </div>
              <div className="mt-2 text-sm font-semibold text-slate-900">
                {request.status}
              </div>
            </div>

            <div className="mt-4 rounded-[22px] border border-black/5 bg-white p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                Next Guided Action
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                {nextActionHint(request.status)}
              </p>
            </div>

            <div className="mt-4 space-y-3">
              {flowSteps.map((step, index) => {
                const isActive = index + 1 === activeStep;
                const isDone = index + 1 < activeStep;

                return (
                  <div
                    key={step.label}
                    className={[
                      "rounded-[20px] border px-4 py-3",
                      isActive
                        ? "border-[var(--cf-navy)] bg-[var(--cf-soft-navy)]"
                        : isDone
                        ? "border-[rgba(47,107,95,0.16)] bg-[var(--cf-soft-teal)]"
                        : "border-black/5 bg-white",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-slate-900">{step.label}</div>
                      <span className="text-xs text-slate-500">{index + 1}</span>
                    </div>
                    <div className="mt-1 text-sm text-slate-600">{step.note}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <RequestAiPanel
            requestId={request.id}
            status={request.status}
            previewTitle={preview?.title ?? previewData?.title ?? null}
            previewContent={preview?.content ?? null}
            projectName={request.project_name || null}
            requestTitle={request.title || null}
            finalRoute={request.final_route || null}
            aiRiskLevel={request.ai_risk_level || null}
          />

          <div className="cf-card rounded-[30px] p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="cf-kicker text-[11px] font-semibold text-slate-500">
                  Decision Trace
                </div>
                <h2 className="mt-2 text-xl font-semibold text-slate-950">
                  Event history
                </h2>
              </div>
              <span className="text-sm text-slate-500">{events.length} events</span>
            </div>

            {events.length === 0 ? (
              <p className="text-sm text-slate-500">No trace events yet.</p>
            ) : (
              <div className="space-y-3">
                {events.map((event) => (
                  <div key={event.id} className="rounded-[20px] border border-black/5 bg-white p-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-semibold text-slate-900">
                          {event.action || "event"}
                        </div>
                        <div className="text-xs text-slate-500">
                          {formatDate(event.created_at)}
                        </div>
                      </div>

                      <div className="text-xs text-slate-500">
                        By {event.actor_name || "Unknown actor"}
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        {event.from_status && (
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                            from: {event.from_status}
                          </span>
                        )}
                        {event.to_status && (
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                            to: {event.to_status}
                          </span>
                        )}
                      </div>

                      {event.note && (
                        <p className="pt-1 text-sm leading-6 text-slate-700">{event.note}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
