import type { ApprovalEvent } from "@/lib/api";

type Props = {
  events: ApprovalEvent[];
};

function badgeClass(action: string): string {
  switch (action) {
    case "approved":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
    case "rejected":
      return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
    case "ai_recomputed":
    case "ai_triaged":
      return "bg-sky-50 text-sky-700 ring-1 ring-sky-200";
    default:
      return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
  }
}

export default function RequestEventTimeline({ events }: Props) {
  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div key={event.id} className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-900">{event.actor_name}</div>
              <div className="mt-1 text-xs text-slate-500">
                {new Date(event.created_at).toLocaleString("en-AU")}
              </div>
            </div>

            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badgeClass(event.action)}`}>
              {event.action}
            </span>
          </div>

          <div className="mt-3 text-sm text-slate-600">
            Status: {event.from_status ?? "-"} → {event.to_status ?? "-"}
          </div>

          {event.note ? (
            <p className="mt-2 text-sm leading-6 text-slate-600">{event.note}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}