const steps = [
  {
    title: "1. Submit Request",
    body: "A defect, variation, or safety issue is lodged with structured metadata.",
  },
  {
    title: "2. AI Intake Analysis",
    body: "The request is summarized and normalized to support clearer downstream decisions.",
  },
  {
    title: "3. Policy + Rule Check",
    body: "Deterministic routing rules and governance constraints define the correct decision path.",
  },
  {
    title: "4. Human Approval",
    body: "A reviewer can approve, reject, or request more information before the flow continues.",
  },
  {
    title: "5. Document Generation",
    body: "A controlled document preview and PDF are created from the approved request.",
  },
  {
    title: "6. Audit + Dashboard",
    body: "Each transition is logged and reflected in the operational dashboard.",
  },
];

const states = [
  "draft",
  "submitted",
  "triaged",
  "needs_info",
  "pending_approval",
  "approved",
  "rejected",
  "document_generated",
  "notified",
  "closed",
];

export default function WorkflowPage() {
  return (
    <main className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Workflow Explorer</h1>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
          ConstructFlow is intentionally designed as a governed agentic workflow,
          where AI supports analysis and drafting, while routing, approvals,
          and auditability remain controlled.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {steps.map((step) => (
          <div
            key={step.title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2 className="text-base font-semibold text-slate-900">{step.title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{step.body}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">State Machine</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {states.map((state) => (
            <span
              key={state}
              className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700"
            >
              {state}
            </span>
          ))}
        </div>
      </section>
    </main>
  );
}
