import Link from "next/link";
import { getRequests } from "@/lib/api";
import { formatCurrency, priorityBadgeClass, riskBadgeClass, statusBadgeClass } from "@/lib/ui";

export const dynamic = "force-dynamic";

type StatCardProps = {
  label: string;
  value: string;
  helper: string;
};

function StatCard({ label, value, helper }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-3 text-3xl font-semibold tracking-tight">{value}</div>
      <div className="mt-2 text-sm text-slate-500">{helper}</div>
    </div>
  );
}

export default async function HomePage() {
  let requests = [];
  let apiError: string | null = null;

  try {
    requests = await getRequests();
  } catch (error) {
    apiError = error instanceof Error ? error.message : "Unknown API error";
  }

  const openRequests = requests.filter(
    (item) => !["approved", "closed", "completed"].includes(item.status.toLowerCase())
  ).length;

  const pendingApproval = requests.filter(
    (item) => ["submitted", "under_review"].includes(item.status.toLowerCase())
  ).length;

  const highRisk = requests.filter(
    (item) => (item.ai_risk_level ?? "").toLowerCase() === "high"
  ).length;

  const totalValue = requests.reduce((sum, item) => sum + item.estimated_cost, 0);

  return (
    <div className="space-y-8">
      {apiError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-700">
          <div className="text-sm font-semibold">API connection issue</div>
          <div className="mt-1 text-sm">{apiError}</div>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Open Requests"
          value={String(openRequests)}
          helper="Requests still active in the workflow"
        />
        <StatCard
          label="Pending Approval"
          value={String(pendingApproval)}
          helper="Items awaiting review or sign-off"
        />
        <StatCard
          label="High Risk"
          value={String(highRisk)}
          helper="Requests escalated by the rule engine"
        />
        <StatCard
          label="Tracked Value"
          value={formatCurrency(totalValue)}
          helper="Current value across seeded requests"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Recent Requests</h2>
              <p className="text-sm text-slate-500">Live data from FastAPI</p>
            </div>
            <Link
              href="/requests"
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              View all
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Title</th>
                  <th className="px-5 py-3 font-medium">Project</th>
                  <th className="px-5 py-3 font-medium">Cost</th>
                  <th className="px-5 py-3 font-medium">Risk</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.slice(0, 4).map((item) => (
                  <tr key={item.id} className="border-t border-slate-100">
                    <td className="px-5 py-4">
                      <Link
                        href={`/requests/${item.id}`}
                        className="font-medium text-slate-900 underline-offset-4 transition hover:underline"
                      >
                        {item.title}
                      </Link>
                      <div className="mt-1 text-xs text-slate-500">
                        {item.request_type} · {item.category}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{item.project_name}</td>
                    <td className="px-5 py-4 text-slate-600">
                      {formatCurrency(item.estimated_cost)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${riskBadgeClass(
                          item.ai_risk_level
                        )}`}
                      >
                        {item.ai_risk_level ?? "unknown"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClass(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}

                {requests.length === 0 && !apiError ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-slate-500">
                      No requests available.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold tracking-tight">Routing Snapshot</h2>
          <p className="mt-1 text-sm text-slate-500">
            Quick operational view of approvals and escalation path.
          </p>

          <div className="mt-5 space-y-4">
            {requests.slice(0, 3).map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/requests/${item.id}`}
                      className="font-medium text-slate-900 underline-offset-4 transition hover:underline"
                    >
                      {item.title}
                    </Link>
                    <div className="mt-1 text-sm text-slate-500">{item.project_name}</div>
                  </div>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${priorityBadgeClass(
                      item.priority
                    )}`}
                  >
                    {item.priority}
                  </span>
                </div>

                <div className="mt-3 text-sm text-slate-600">
                  <span className="font-medium text-slate-900">Route:</span>{" "}
                  {item.final_route ?? item.ai_suggested_route ?? "Not assigned"}
                </div>
                <div className="mt-2 text-sm text-slate-600">
                  <span className="font-medium text-slate-900">Summary:</span>{" "}
                  {item.ai_summary ?? "No AI summary available."}
                </div>
              </div>
            ))}

            {requests.length === 0 && !apiError ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
                Routing cards will appear once requests are available.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
