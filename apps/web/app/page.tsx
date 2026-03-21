const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000/api";

type Summary = {
  open_requests: number;
  pending_approval: number;
  approved_flow: number;
  rejected: number;
  high_risk: number;
};

type ChartItem = {
  label: string;
  value: number;
};

type Charts = {
  status_counts: ChartItem[];
  type_counts: ChartItem[];
  risk_counts: ChartItem[];
};

async function getSummary(): Promise<Summary> {
  const res = await fetch(`${API_BASE}/dashboard/summary`, { cache: "no-store" });
  if (!res.ok) {
    return {
      open_requests: 0,
      pending_approval: 0,
      approved_flow: 0,
      rejected: 0,
      high_risk: 0,
    };
  }
  return res.json();
}

async function getCharts(): Promise<Charts> {
  const res = await fetch(`${API_BASE}/dashboard/charts`, { cache: "no-store" });
  if (!res.ok) {
    return { status_counts: [], type_counts: [], risk_counts: [] };
  }
  return res.json();
}

function SimpleList({
  title,
  items,
}: {
  title: string;
  items: ChartItem[];
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
            No data available
          </div>
        ) : (
          items.map((item) => (
            <div
              key={`${title}-${item.label}`}
              className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm"
            >
              <span className="font-medium text-slate-700">{item.label}</span>
              <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                {item.value}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default async function HomePage() {
  const [summary, charts] = await Promise.all([getSummary(), getCharts()]);

  const stats = [
    { label: "Open Requests", value: summary.open_requests },
    { label: "Pending Approval", value: summary.pending_approval },
    { label: "Approved Flow", value: summary.approved_flow },
    { label: "Rejected", value: summary.rejected },
    { label: "High Risk", value: summary.high_risk },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {stats.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="text-sm text-slate-500">{item.label}</div>
            <div className="mt-3 text-3xl font-semibold tracking-tight">
              {item.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <SimpleList title="By Status" items={charts.status_counts} />
        <SimpleList title="By Type" items={charts.type_counts} />
        <SimpleList title="By Risk" items={charts.risk_counts} />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Demo Outcome</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          This dashboard reflects the governed request lifecycle: intake, approval,
          document generation, notification readiness, and audit visibility.
        </p>
      </div>
    </div>
  );
}
