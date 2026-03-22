import { PageIntro } from "@/components/shell/page-intro";

const stages = [
  {
    title: "Intake",
    owner: "Field requester",
    note: "A site issue or variation is captured with enough operational context.",
  },
  {
    title: "Analysis",
    owner: "AI support layer",
    note: "The request is summarized, risk is assessed, and a suggested route is prepared.",
  },
  {
    title: "Decision",
    owner: "Human approver",
    note: "A reviewer checks the brief, confirms the route, and decides the next transition.",
  },
  {
    title: "Document",
    owner: "Controlled output generator",
    note: "An official artifact is prepared from the approved request state.",
  },
  {
    title: "Audit",
    owner: "System trace",
    note: "Every major transition is retained as a visible record.",
  },
];

export default function WorkflowPage() {
  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="System Flow"
        title="A governance map, not a decorative graph"
        description="This page should explain what happens at each step, who owns it, and why the output remains controlled."
      />

      <section className="cf-card rounded-[30px] p-6">
        <div className="grid gap-4 lg:grid-cols-5">
          {stages.map((stage, index) => (
            <div key={stage.title} className="rounded-[24px] border border-black/5 bg-white p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                Step {index + 1}
              </div>
              <h3 className="mt-2 text-lg font-semibold text-slate-950">{stage.title}</h3>
              <div className="mt-2 text-sm font-medium text-slate-600">{stage.owner}</div>
              <p className="mt-3 text-sm leading-6 text-slate-500">{stage.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="cf-card rounded-[30px] p-6">
          <div className="cf-kicker text-[11px] font-semibold text-slate-500">
            Selected Step
          </div>
          <h3 className="mt-2 text-xl font-semibold text-slate-950">Decision</h3>
          <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
            <p>
              This is where the product must feel most trustworthy. The approver sees the case context,
              operational brief, and the visible route before taking action.
            </p>
            <p>
              The user should understand that AI informs the decision, but the transition itself remains governed.
            </p>
          </div>
        </div>

        <div className="cf-card rounded-[30px] p-6">
          <div className="cf-kicker text-[11px] font-semibold text-slate-500">
            Output Rule
          </div>
          <h3 className="mt-2 text-xl font-semibold text-slate-950">Why this feels controlled</h3>
          <ul className="mt-5 space-y-3 text-sm text-slate-600">
            <li>• The request state is explicit.</li>
            <li>• The owner of each stage is visible.</li>
            <li>• The controlled document depends on an approved state.</li>
            <li>• The trace survives after the UI interaction ends.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
