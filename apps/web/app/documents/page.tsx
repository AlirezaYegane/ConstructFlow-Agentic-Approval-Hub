import Link from "next/link";
import { ArrowUpRight, FileText, ShieldCheck } from "lucide-react";
import { PageIntro } from "@/components/shell/page-intro";

const docs = [
  {
    requestId: 3,
    title: "Variation Approval Document - Request 3",
    status: "Controlled Record",
    subtitle: "Approval outcome archived for project operations",
  },
  {
    requestId: 11,
    title: "Variation Approval Document - Request 11",
    status: "Controlled Record",
    subtitle: "Generated output linked to the request lifecycle",
  },
];

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Controlled Docs"
        title="Archived outputs that feel official"
        description="This area should read like a controlled record workspace, not a generic AI content screen."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {docs.map((doc) => (
          <section key={doc.requestId} className="cf-card rounded-[30px] overflow-hidden">
            <div className="bg-slate-950 px-6 py-6 text-white">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="cf-kicker text-[11px] font-semibold text-slate-300">
                    ConstructFlow Document
                  </div>
                  <h3 className="mt-2 text-xl font-semibold">{doc.title}</h3>
                  <p className="mt-2 text-sm text-slate-300">{doc.subtitle}</p>
                </div>
                <div className="rounded-full bg-emerald-400/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-200">
                  {doc.status}
                </div>
              </div>
            </div>

            <div className="grid gap-4 p-6 md:grid-cols-2">
              <div className="rounded-[22px] bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <FileText className="h-4 w-4" />
                  Linked request
                </div>
                <div className="mt-2 text-sm text-slate-600">Request #{doc.requestId}</div>
              </div>

              <div className="rounded-[22px] bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <ShieldCheck className="h-4 w-4" />
                  Record type
                </div>
                <div className="mt-2 text-sm text-slate-600">Controlled approval artifact</div>
              </div>
            </div>

            <div className="px-6 pb-6">
              <Link
                href={`/requests/${doc.requestId}`}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-50"
              >
                Open linked request
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
