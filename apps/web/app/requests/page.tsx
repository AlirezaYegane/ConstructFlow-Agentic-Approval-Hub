import Link from "next/link";
import { ArrowUpRight, Filter, Search } from "lucide-react";
import { PageIntro } from "@/components/shell/page-intro";

const requests = [
  {
    id: 3,
    code: "REQ-003",
    title: "Unprotected trench edge",
    project: "Lindfield Duplex",
    stage: "Decision Review",
    risk: "High",
    route: "Safety Officer",
    updated: "8 mins ago",
    nextAction: "Open case",
  },
  {
    id: 4,
    code: "REQ-004",
    title: "Stormwater reroute",
    project: "Chatswood Fitout",
    stage: "Analysis Complete",
    risk: "High",
    route: "Project Manager",
    updated: "24 mins ago",
    nextAction: "Open case",
  },
  {
    id: 2,
    code: "REQ-002",
    title: "Additional exterior GPO",
    project: "Peakhurst Renovation",
    stage: "Submitted",
    risk: "Low",
    route: "Site Supervisor",
    updated: "1 hr ago",
    nextAction: "Review intake",
  },
];

export default function RequestsPage() {
  const featured = requests[0];

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Intake Queue"
        title="Incoming work with visible routing context"
        description="Browse requests, see their operational state, and jump directly into the decision room without losing context."
      />

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.8fr]">
        <section className="cf-card rounded-[30px] p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white px-4 py-2 text-sm text-slate-600">
                <Search className="h-4 w-4" />
                Search requests
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white px-4 py-2 text-sm text-slate-600">
                <Filter className="h-4 w-4" />
                Filters
              </div>
            </div>
            <div className="text-sm text-slate-500">3 visible items</div>
          </div>

          <div className="mt-6 overflow-hidden rounded-[24px] border border-black/5 bg-white">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
                <tr>
                  <th className="px-4 py-4 font-semibold">Request</th>
                  <th className="px-4 py-4 font-semibold">Project</th>
                  <th className="px-4 py-4 font-semibold">Stage</th>
                  <th className="px-4 py-4 font-semibold">Risk</th>
                  <th className="px-4 py-4 font-semibold">Route</th>
                  <th className="px-4 py-4 font-semibold">Updated</th>
                  <th className="px-4 py-4 font-semibold">Next Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((item) => (
                  <tr key={item.code} className="border-t border-slate-100 text-sm text-slate-700">
                    <td className="px-4 py-4">
                      <div className="font-semibold text-slate-950">{item.title}</div>
                      <div className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-400">
                        {item.code}
                      </div>
                    </td>
                    <td className="px-4 py-4">{item.project}</td>
                    <td className="px-4 py-4">{item.stage}</td>
                    <td className="px-4 py-4">
                      <span
                        className={[
                          "rounded-full px-3 py-1 text-xs font-semibold",
                          item.risk === "High"
                            ? "bg-rose-50 text-rose-700"
                            : "bg-slate-100 text-slate-700",
                        ].join(" ")}
                      >
                        {item.risk}
                      </span>
                    </td>
                    <td className="px-4 py-4">{item.route}</td>
                    <td className="px-4 py-4 text-slate-500">{item.updated}</td>
                    <td className="px-4 py-4">
                      <Link
                        href={`/requests/${item.id}`}
                        className="inline-flex items-center gap-2 font-medium text-slate-900 hover:text-slate-600"
                      >
                        {item.nextAction}
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="cf-card rounded-[30px] p-6">
          <div className="cf-kicker text-[11px] font-semibold text-slate-500">
            Quick Preview
          </div>
          <h3 className="mt-2 text-xl font-semibold text-slate-950">
            {featured.title}
          </h3>
          <div className="mt-5 space-y-3">
            <div className="rounded-[20px] bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                Project
              </div>
              <div className="mt-2 text-sm font-medium text-slate-900">{featured.project}</div>
            </div>
            <div className="rounded-[20px] bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                Current Stage
              </div>
              <div className="mt-2 text-sm font-medium text-slate-900">{featured.stage}</div>
            </div>
            <div className="rounded-[20px] bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                Suggested Route
              </div>
              <div className="mt-2 text-sm font-medium text-slate-900">{featured.route}</div>
            </div>
            <div className="rounded-[20px] bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                Priority
              </div>
              <div className="mt-2 text-sm font-medium text-slate-900">{featured.risk}</div>
            </div>
          </div>

          <Link
            href={`/requests/${featured.id}`}
            className="cf-primary-btn !mt-5 !inline-flex !w-full !text-white hover:!text-white"
          >
            Enter decision room
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </aside>
      </div>
    </div>
  );
}
