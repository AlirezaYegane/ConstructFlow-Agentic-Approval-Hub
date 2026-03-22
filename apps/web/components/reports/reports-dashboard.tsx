"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Shield,
  Sparkles,
  TrendingUp,
} from "lucide-react";

const kpis = [
  {
    label: "Active Requests",
    value: "24",
    note: "Open across all projects",
    icon: Clock3,
    tone: "blue",
  },
  {
    label: "Awaiting Approval",
    value: "8",
    note: "Need human decision",
    icon: Shield,
    tone: "amber",
  },
  {
    label: "High-Risk Items",
    value: "3",
    note: "Escalated priority",
    icon: AlertTriangle,
    tone: "rust",
  },
  {
    label: "Controlled Docs",
    value: "14",
    note: "Archived this week",
    icon: FileCheck2,
    tone: "green",
  },
];

const trendData = [
  { day: "Mon", submitted: 6, approved: 3, archived: 2 },
  { day: "Tue", submitted: 9, approved: 4, archived: 3 },
  { day: "Wed", submitted: 7, approved: 5, archived: 4 },
  { day: "Thu", submitted: 11, approved: 7, archived: 5 },
  { day: "Fri", submitted: 10, approved: 8, archived: 6 },
  { day: "Sat", submitted: 8, approved: 6, archived: 6 },
  { day: "Sun", submitted: 5, approved: 4, archived: 3 },
];

const routeLoad = [
  { route: "Safety", count: 7 },
  { route: "PM", count: 6 },
  { route: "Supervisor", count: 4 },
  { route: "Commercial", count: 3 },
  { route: "Compliance", count: 2 },
];

const projectTurnaround = [
  { project: "Lindfield", days: 1.2 },
  { project: "Peakhurst", days: 2.1 },
  { project: "Chatswood", days: 1.6 },
  { project: "Mac Park", days: 2.7 },
];

const riskMix = [
  { name: "Low", value: 10, color: "#BFD7C9" },
  { name: "Medium", value: 11, color: "#E7C786" },
  { name: "High", value: 3, color: "#B05645" },
];

function toneClass(tone: string) {
  switch (tone) {
    case "blue":
      return "bg-[var(--cf-soft-navy)] text-[var(--cf-navy)]";
    case "amber":
      return "bg-[var(--cf-soft-amber)] text-[var(--cf-amber)]";
    case "rust":
      return "bg-[var(--cf-soft-rust)] text-[var(--cf-rust)]";
    case "green":
      return "bg-[var(--cf-soft-teal)] text-[var(--cf-green)]";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export function ReportsDashboard() {
  const heaviestRoute = [...routeLoad].sort((a, b) => b.count - a.count)[0];
  const slowestProject = [...projectTurnaround].sort((a, b) => b.days - a.days)[0];
  const fastestProject = [...projectTurnaround].sort((a, b) => a.days - b.days)[0];
  const highRisk = riskMix.find((item) => item.name === "High")?.value ?? 0;

  const briefLines = [
    `${heaviestRoute.route} queue is carrying the heaviest operational review load right now.`,
    `${slowestProject.project} has the slowest turnaround at ${slowestProject.days} days and should be reviewed for friction.`,
    `${fastestProject.project} is the fastest project in the portfolio at ${fastestProject.days} days.`,
    `${highRisk} high-risk items remain open and should stay visible until resolved or documented.`,
  ];

  return (
    <div className="space-y-6">
      <section className="cf-card rounded-[30px] p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="cf-kicker text-[11px] font-semibold text-slate-500">
              AI Portfolio Brief
            </div>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">
              A manager-ready reading of the current operating picture
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              This summary is meant to help a manager understand where pressure, risk, and delay are building without reading every request individually.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(22,50,79,0.10)] bg-[var(--cf-soft-navy)] px-4 py-2 text-sm font-medium text-[var(--cf-navy)]">
            <Sparkles className="h-4 w-4" />
            AI-assisted overview
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[1.2fr_0.85fr]">
          <div className="rounded-[26px] bg-[var(--cf-navy)] p-6 text-white shadow-[0_14px_40px_rgba(15,23,42,0.16)]">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/10 p-2">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold">What needs attention now</div>
                <div className="mt-1 text-sm text-slate-300">
                  Focus on load, delay, and unresolved high-risk work.
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {briefLines.map((item) => (
                <div
                  key={item}
                  className="rounded-[18px] border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-slate-100"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[24px] border border-[rgba(47,107,95,0.14)] bg-[var(--cf-soft-teal)] p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--cf-green)]">
                Operational Signal
              </div>
              <div className="mt-2 text-lg font-semibold text-slate-950">
                Throughput is healthy, but queue concentration is visible.
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                Approvals and controlled outputs are moving, but review load is not evenly distributed.
              </p>
            </div>

            <div className="rounded-[24px] border border-[rgba(183,121,31,0.14)] bg-[var(--cf-soft-amber)] p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--cf-amber)]">
                Manager Prompt
              </div>
              <div className="mt-2 text-lg font-semibold text-slate-950">
                Check the Safety queue and Mac Park turnaround first.
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                Those two signals currently represent the clearest operational bottlenecks in this portfolio snapshot.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="cf-card rounded-[28px] p-5">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-slate-500">{item.label}</div>
                <div className={`rounded-2xl p-2 ${toneClass(item.tone)}`}>
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

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
        <section className="cf-card rounded-[30px] p-6">
          <div className="cf-kicker text-[11px] font-semibold text-slate-500">
            Weekly Flow
          </div>
          <h3 className="mt-2 text-xl font-semibold text-slate-950">
            Intake, approvals, and archived outputs
          </h3>
          <div className="mt-6 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="submittedFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16324F" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#16324F" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="approvedFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1F6F78" stopOpacity={0.26} />
                    <stop offset="95%" stopColor="#1F6F78" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="submitted" stroke="#16324F" fill="url(#submittedFill)" strokeWidth={2} />
                <Area type="monotone" dataKey="approved" stroke="#1F6F78" fill="url(#approvedFill)" strokeWidth={2} />
                <Area type="monotone" dataKey="archived" stroke="#B7791F" fill="transparent" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="cf-card rounded-[30px] p-6">
          <div className="cf-kicker text-[11px] font-semibold text-slate-500">
            Manager Brief
          </div>
          <h3 className="mt-2 text-xl font-semibold text-slate-950">
            What matters right now
          </h3>
          <div className="mt-5 space-y-3">
            {briefLines.map((item) => (
              <div key={item} className="rounded-[20px] border border-black/5 bg-white px-4 py-3 text-sm leading-6 text-slate-600">
                {item}
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-[22px] border border-[rgba(47,107,95,0.14)] bg-[var(--cf-soft-teal)] p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-white/70 p-2 text-[var(--cf-green)]">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-[var(--cf-green)]">
                  Operational signal is stable
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-700">
                  Approval throughput is healthy, but review concentration should be watched closely.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="cf-card rounded-[30px] p-6">
          <div className="cf-kicker text-[11px] font-semibold text-slate-500">
            Route Load
          </div>
          <h3 className="mt-2 text-xl font-semibold text-slate-950">
            Review ownership pressure
          </h3>
          <div className="mt-6 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={routeLoad}>
                <XAxis dataKey="route" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} fill="#16324F" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="cf-card rounded-[30px] p-6">
          <div className="cf-kicker text-[11px] font-semibold text-slate-500">
            Risk Mix
          </div>
          <h3 className="mt-2 text-xl font-semibold text-slate-950">
            Open request distribution
          </h3>
          <div className="mt-6 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskMix}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={92}
                  paddingAngle={4}
                >
                  {riskMix.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {riskMix.map((item) => (
              <div key={item.name} className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                {item.name}: {item.value}
              </div>
            ))}
          </div>
        </section>

        <section className="cf-card rounded-[30px] p-6">
          <div className="cf-kicker text-[11px] font-semibold text-slate-500">
            Turnaround
          </div>
          <h3 className="mt-2 text-xl font-semibold text-slate-950">
            Average days by project
          </h3>
          <div className="mt-6 space-y-4">
            {projectTurnaround.map((item) => (
              <div key={item.project}>
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>{item.project}</span>
                  <span>{item.days}d</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-[var(--cf-teal)]"
                    style={{ width: `${Math.min(item.days / 3, 1) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
