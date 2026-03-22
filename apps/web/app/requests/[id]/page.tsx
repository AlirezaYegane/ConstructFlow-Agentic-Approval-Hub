import { notFound } from "next/navigation";
import RequestActions from "@/components/request-actions";
import RequestAiPanel from "@/components/request-ai-panel";
import { API_BASE } from "@/lib/api-base";
import type { RequestStatus } from "@/lib/request-status";

type RequestDetail = {
  id: number;
  status: RequestStatus;
  title?: string | null;
  request_type?: string | null;
  requester_name?: string | null;
  actor_name?: string | null;
  priority?: string | null;
  description?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  metadata?: Record<string, unknown> | null;
  payload?: Record<string, unknown> | null;
  data?: Record<string, unknown> | null;
  ai_summary?: string | null;
  ai_risk_level?: string | null;
  ai_suggested_route?: string | null;
  final_route?: string | null;
  policy_titles?: string[] | null;
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

function statusBadgeClass(status: string) {
  switch (status) {
    case "approved":
      return "bg-emerald-100 text-emerald-800";
    case "rejected":
      return "bg-rose-100 text-rose-800";
    case "under_review":
      return "bg-blue-100 text-blue-800";
    case "needs_info":
      return "bg-amber-100 text-amber-800";
    case "submitted":
      return "bg-slate-100 text-slate-800";
    case "document_generated":
      return "bg-violet-100 text-violet-800";
    case "notified":
      return "bg-cyan-100 text-cyan-800";
    case "closed":
      return "bg-zinc-200 text-zinc-800";
    default:
      return "bg-slate-100 text-slate-700";
  }
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

  if (Array.isArray(json)) {
    return json;
  }

  if (Array.isArray(json?.value)) {
    return json.value;
  }

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
      title: "Generated Document",
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

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [request, events] = await Promise.all([getRequest(id), getEvents(id)]);
  const preview = await getDocumentPreview(id, request.status);

  const extraData = request.metadata ?? request.payload ?? request.data ?? null;
  const previewData = preview ? parseDocumentPreview(preview.content) : null;

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-6 py-8">
      <div className="flex flex-col gap-4 rounded-2xl border bg-white p-6 shadow-sm md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold text-slate-900">
              {request.title?.trim() || `Request #${request.id}`}
            </h1>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(
                request.status
              )}`}
            >
              {request.status}
            </span>
          </div>

          <div className="grid gap-2 text-sm text-slate-600 md:grid-cols-2">
            <div>
              <span className="font-medium text-slate-800">Request ID:</span> {request.id}
            </div>
            <div>
              <span className="font-medium text-slate-800">Type:</span>{" "}
              {request.request_type || "-"}
            </div>
            <div>
              <span className="font-medium text-slate-800">Requester:</span>{" "}
              {request.requester_name || request.actor_name || "-"}
            </div>
            <div>
              <span className="font-medium text-slate-800">Priority:</span>{" "}
              {request.priority || "-"}
            </div>
            <div>
              <span className="font-medium text-slate-800">Created:</span>{" "}
              {formatDate(request.created_at)}
            </div>
            <div>
              <span className="font-medium text-slate-800">Updated:</span>{" "}
              {formatDate(request.updated_at)}
            </div>
          </div>
        </div>

        <div className="w-full md:w-auto md:min-w-[320px]">
          <RequestActions requestId={request.id} status={request.status} />
        </div>
      </div>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Description</h2>
        <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
          {request.description?.trim() || "No description provided."}
        </p>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border bg-white p-6 shadow-sm xl:col-span-2">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">AI Workflow Summary</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                AI Summary
              </div>
              <p className="mt-2 text-sm leading-7 text-slate-700">
                {request.ai_summary || "No AI summary available yet."}
              </p>
            </div>

            <div className="grid gap-4">
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  AI Risk
                </div>
                <p className="mt-2 text-sm font-medium text-slate-900">
                  {request.ai_risk_level || "-"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Final Route
                </div>
                <p className="mt-2 text-sm font-medium text-slate-900">
                  {request.final_route || request.ai_suggested_route || "-"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Policy References</h2>

          {request.policy_titles?.length ? (
            <div className="flex flex-wrap gap-2">
              {request.policy_titles.map((title) => (
                <span
                  key={title}
                  className="rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-800"
                >
                  {title}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No policy references attached yet.</p>
          )}
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Payload / Metadata</h2>

        {extraData ? (
          <pre className="overflow-x-auto rounded-xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">
            {JSON.stringify(extraData, null, 2)}
          </pre>
        ) : (
          <p className="text-sm text-slate-500">No extra payload available.</p>
        )}
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Document Preview</h2>
            <p className="mt-1 text-sm text-slate-500">
              Styled controlled document preview for the generated approval record.
            </p>
          </div>

          {preview && (
            <a
              href={`${API_BASE}/requests/${request.id}/document-pdf`}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              Open PDF
            </a>
          )}
        </div>

        {preview && previewData ? (
          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-violet-950 p-6 text-white">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-300">
                    ConstructFlow Document
                  </div>
                  <h3 className="mt-2 text-2xl font-semibold">{previewData.title}</h3>
                  <p className="mt-2 text-sm text-slate-300">{preview.filename}</p>
                </div>

                <div className="rounded-full bg-emerald-400/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-200">
                  Controlled Output
                </div>
              </div>
            </div>

            {previewData.meta.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {previewData.meta.map((item) => (
                  <div
                    key={`${item.label}-${item.value}`}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
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
                  className="overflow-hidden rounded-2xl border border-slate-200"
                >
                  <div className="bg-violet-600 px-4 py-3 text-sm font-semibold text-white">
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
          <p className="text-sm text-slate-500">
            This request is approved and ready. Click{" "}
            <span className="font-medium">Generate Document</span> to create the controlled
            document preview and PDF.
          </p>
        ) : (
          <p className="text-sm text-slate-500">
            Document preview is not available for the current state.
          </p>
        )}
      </section>

      <RequestAiPanel
        requestId={request.id}
        requestStatus={request.status}
        previewContent={preview?.content ?? null}
      />

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Audit Timeline</h2>
          <span className="text-sm text-slate-500">{events.length} events</span>
        </div>

        {events.length === 0 ? (
          <p className="text-sm text-slate-500">No audit events yet.</p>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      {event.action || "event"}
                    </div>
                    <div className="text-xs text-slate-500">
                      By {event.actor_name || "Unknown actor"}
                    </div>
                  </div>

                  <div className="text-xs text-slate-500">{formatDate(event.created_at)}</div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  {event.from_status && (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                      from: {event.from_status}
                    </span>
                  )}

                  {event.to_status && (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                      to: {event.to_status}
                    </span>
                  )}
                </div>

                {event.note && <p className="mt-3 text-sm text-slate-700">{event.note}</p>}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
