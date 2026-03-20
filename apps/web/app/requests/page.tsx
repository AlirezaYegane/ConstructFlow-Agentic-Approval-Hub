import { getRequests } from "@/lib/api";
import { formatCurrency, priorityBadgeClass, riskBadgeClass, statusBadgeClass } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function RequestsPage() {
  const requests = await getRequests();

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold tracking-tight">Request Register</h2>
        <p className="mt-1 text-sm text-slate-500">
          Live approval requests sourced from the FastAPI backend.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">ID</th>
                <th className="px-5 py-3 font-medium">Title</th>
                <th className="px-5 py-3 font-medium">Project</th>
                <th className="px-5 py-3 font-medium">Requester</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Cost</th>
                <th className="px-5 py-3 font-medium">Priority</th>
                <th className="px-5 py-3 font-medium">Risk</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Route</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((item) => (
                <tr key={item.id} className="border-t border-slate-100 align-top">
                  <td className="px-5 py-4 font-medium text-slate-900">#{item.id}</td>
                  <td className="px-5 py-4">
                    <div className="font-medium text-slate-900">{item.title}</div>
                    <div className="mt-1 max-w-md text-xs leading-5 text-slate-500">
                      {item.description}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{item.project_name}</td>
                  <td className="px-5 py-4 text-slate-600">{item.requester_name}</td>
                  <td className="px-5 py-4 text-slate-600">
                    {item.request_type} / {item.category}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {formatCurrency(item.estimated_cost)}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${priorityBadgeClass(
                        item.priority
                      )}`}
                    >
                      {item.priority}
                    </span>
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
                  <td className="px-5 py-4 text-slate-600">
                    <div className="max-w-xs leading-5">
                      {item.final_route ?? item.ai_suggested_route ?? "-"}
                    </div>
                  </td>
                </tr>
              ))}

              {requests.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-5 py-10 text-center text-slate-500">
                    No requests found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

