import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Clock3,
  FileCheck2,
  ShieldAlert,
  SplitSquareVertical,
} from "lucide-react";
import { PageIntro } from "@/components/shell/page-intro";

const stats = [
  { label: "Pending Decisions", value: "8", note: "Require review today", icon: Clock3 },
  { label: "High-Risk Requests", value: "3", note: "Escalated items", icon: ShieldAlert },
  { label: "Documents Ready", value: "6", note: "Controlled outputs", icon: FileCheck2 },
  { label: "Avg Turnaround", value: "1.8d", note: "Decision cycle", icon: SplitSquareVertical },
];

const queue = [
  {
    id: "REQ-003",
    title: "Unprotected trench edge",
    project: "Lindfield Duplex",
    priority: "High",
    route: "Safety Officer",
  },
  {
    id: "REQ-004",
    title: "Stormwater reroute",
    project: "Chatswood Fitout",
    priority: "High",
    route: "Project Manager",
  },
  {
    id: "REQ-002",
    title: "Additional exterior GPO",
    project: "Peakhurst Renovation",
    priority: "Low",
    route: "Site Supervisor",
  },
];

const activity = [
  "Request 3 moved into decision review.",
  "Approval document archived for Request 11.",
  "Dashboard summary refreshed after new intake.",
  "Audit trail captured for the latest transition.",
];

export default function HomePage() {
  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Command Center"
        title="Operational overview with a clearer story"
        description="See what needs attention, what carries risk, and which approvals are ready to become controlled records."
        actions={
          <div className="flex flex-wrap gap-3">
            <Link href="/requests" className="cf-primary-btn !text-white hover:!text-white">
              Open intake queue
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/reports" className="cf-secondary-btn">
              View reports
              <BarChart3 className="h-4 w-4" />
            </Link>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item, index) => {
          const Icon = item.icon;

          const iconBg = [
            "bg-[var(--cf-soft-navy)] text-[var(--cf-navy)]",
            "bg-[var(--cf-soft-rust)] text-[var(--cf-rust)]",
            "bg-[var(--cf-soft-teal)] text-[var(--cf-green)]",
            "bg-[var(--cf-soft-amber)] text-[var(--cf-amber)]",
          ][index];

          return (
            <div key={item.label} className="cf-card rounded-[28px] p-5">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-slate-500">{item.label}</div>
                <div className={`rounded-2xl p-2 ${iconBg}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
                {item.value}
              </div>
              <div className="mt-2 text-sm text-slate-500">{item.note}</div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <section className="cf-card rounded-[30px] p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="cf-kicker text-[11px] font-semibold text-slate-500">
                Priority Queue
              </div>
              <h3 className="mt-2 text-xl font-semibold text-slate-950">
                What needs attention now
              </h3>
            </div>
            <Link href="/requests" className="text-sm font-medium text-slate-600 hover:text-slate-950">
              View all
            </Link>
          </div>

          <div className="mt-6 space-y-3">
            {queue.map((item) => (
              <div
                key={item.id}
                className="rounded-[22px] border border-black/5 bg-white px-4 py-4 transition hover:-translate-y-0.5 hover:shadow-sm"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                      {item.id}
                    </div>
                    <div className="mt-1 text-base font-semibold text-slate-950">{item.title}</div>
                    <div className="mt-1 text-sm text-slate-500">{item.project}</div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-[rgba(183,121,31,0.14)] bg-[var(--cf-soft-amber)] px-3 py-1 text-xs font-semibold text-[var(--cf-amber)]">
                      {item.priority}
                    </span>
                    <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {item.route}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="space-y-6">
          <section className="cf-card rounded-[30px] p-6">
            <div className="cf-kicker text-[11px] font-semibold text-slate-500">
              Bottlenecks
            </div>
            <h3 className="mt-2 text-xl font-semibold text-slate-950">
              Decision pressure points
            </h3>
            <div className="mt-5 space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Safety review</span>
                  <span>78%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div className="h-2 w-[78%] rounded-full bg-[var(--cf-rust)]" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Cost validation</span>
                  <span>52%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div className="h-2 w-[52%] rounded-full bg-[var(--cf-amber)]" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Document release</span>
                  <span>33%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div className="h-2 w-[33%] rounded-full bg-[var(--cf-green)]" />
                </div>
              </div>
            </div>
          </section>

          <section className="cf-card rounded-[30px] p-6">
            <div className="cf-kicker text-[11px] font-semibold text-slate-500">
              Audit Activity
            </div>
            <h3 className="mt-2 text-xl font-semibold text-slate-950">
              Recent trace events
            </h3>
            <div className="mt-5 space-y-3">
              {activity.map((item) => (
                <div key={item} className="rounded-[20px] border border-black/5 bg-white px-4 py-3 text-sm text-slate-600">
                  {item}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
