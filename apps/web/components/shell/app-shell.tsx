"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Building2,
  ClipboardList,
  LayoutDashboard,
  ScrollText,
  Waypoints,
} from "lucide-react";
import { FlowRail } from "@/components/shell/flow-rail";

const navItems = [
  {
    href: "/",
    label: "Command Center",
    description: "Operational overview",
    icon: LayoutDashboard,
  },
  {
    href: "/requests",
    label: "Intake Queue",
    description: "Incoming work",
    icon: ClipboardList,
  },
  {
    href: "/reports",
    label: "Executive Reports",
    description: "Portfolio visibility",
    icon: BarChart3,
  },
  {
    href: "/documents",
    label: "Controlled Docs",
    description: "Archived outputs",
    icon: ScrollText,
  },
  {
    href: "/workflow",
    label: "System Flow",
    description: "Governance map",
    icon: Waypoints,
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function getActiveFlow(pathname: string): "Intake" | "Analysis" | "Decision" | "Document" | "Audit" {
  if (pathname.startsWith("/requests/")) return "Decision";
  if (pathname.startsWith("/requests")) return "Intake";
  if (pathname.startsWith("/documents")) return "Document";
  if (pathname.startsWith("/reports")) return "Audit";
  if (pathname.startsWith("/workflow")) return "Audit";
  return "Analysis";
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const activeFlow = getActiveFlow(pathname);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[300px_1fr]">
      <aside className="border-b border-black/5 bg-white/70 p-5 backdrop-blur lg:min-h-screen lg:border-b-0 lg:border-r">
        <div className="rounded-[28px] bg-[var(--cf-navy)] p-5 text-white shadow-[0_14px_40px_rgba(15,23,42,0.18)]">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/10 p-3">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="cf-kicker text-[11px] font-semibold text-slate-300">
                ConstructFlow
              </div>
              <div className="mt-1 text-xl font-semibold tracking-tight">
                Governed Workspace
              </div>
            </div>
          </div>

          <p className="mt-4 text-sm leading-6 text-slate-200">
            From field issue to controlled decision record.
          </p>
        </div>

        <nav className="mt-6 space-y-2">
          {navItems.map(({ href, label, description, icon: Icon }) => {
            const active = isActive(pathname, href);

            return (
              <Link
                key={href}
                href={href}
                className={[
                  "block rounded-[22px] border px-4 py-4 transition",
                  active
                    ? "border-[var(--cf-navy)] bg-[var(--cf-navy)] text-white shadow-md"
                    : "border-black/5 bg-white/90 text-slate-800 hover:border-slate-300 hover:bg-white",
                ].join(" ")}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={[
                      "rounded-2xl p-2.5",
                      active ? "bg-white/10" : "bg-slate-100",
                    ].join(" ")}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">{label}</div>
                    <div
                      className={[
                        "mt-1 text-xs",
                        active ? "text-slate-300" : "text-slate-500",
                      ].join(" ")}
                    >
                      {description}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 rounded-[24px] border border-[rgba(183,121,31,0.18)] bg-[var(--cf-soft-amber)] p-4 text-sm text-[var(--cf-amber)]">
          <div className="font-semibold text-[var(--cf-amber)]">Current narrative</div>
          <p className="mt-2 leading-6">
            Signal in, assessment prepared, human decision made, controlled output archived, trace preserved.
          </p>
        </div>
      </aside>

      <main className="min-h-screen">
        <header className="sticky top-0 z-20 border-b border-black/5 bg-[#f5f2eb]/92 px-5 py-4 backdrop-blur lg:px-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="cf-kicker text-[11px] font-semibold text-slate-500">
                  Governed Approval Workspace
                </div>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  Construction operations with visible control
                </h1>
                <p className="mt-2 text-sm text-slate-600">
                  Structured intake, decision support, controlled documents, and full traceability.
                </p>
              </div>

              <div className="inline-flex items-center rounded-full border border-[rgba(47,107,95,0.18)] bg-[var(--cf-soft-teal)] px-4 py-2 text-sm font-medium text-[var(--cf-green)]">
                Demo Mode · Narrative Refresh
              </div>
            </div>

            <FlowRail active={activeFlow} />
          </div>
        </header>

        <section className="cf-grid min-h-[calc(100vh-150px)] px-5 py-6 lg:px-8">
          {children}
        </section>
      </main>
    </div>
  );
}
