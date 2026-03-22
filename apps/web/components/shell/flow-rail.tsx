type FlowRailProps = {
  active: "Intake" | "Analysis" | "Decision" | "Document" | "Audit";
};

const steps = ["Intake", "Analysis", "Decision", "Document", "Audit"] as const;

export function FlowRail({ active }: FlowRailProps) {
  const activeIndex = steps.indexOf(active);

  return (
    <div className="rounded-[24px] border border-black/5 bg-white/90 px-4 py-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-2 md:gap-3">
        {steps.map((step, index) => {
          const isActive = step === active;
          const isDone = index < activeIndex;

          return (
            <div key={step} className="flex items-center gap-2">
              <div
                className={[
                  "flex h-8 min-w-8 items-center justify-center rounded-full px-3 text-xs font-semibold transition",
                  isActive
                    ? "bg-[var(--cf-navy)] text-white shadow-sm"
                    : isDone
                    ? "bg-[var(--cf-soft-teal)] text-[var(--cf-green)]"
                    : "bg-slate-100 text-slate-500",
                ].join(" ")}
              >
                {index + 1}
              </div>
              <span
                className={[
                  "text-sm font-medium",
                  isActive ? "text-slate-950" : isDone ? "text-slate-700" : "text-slate-500",
                ].join(" ")}
              >
                {step}
              </span>
              {index < steps.length - 1 && (
                <div className="mx-1 h-px w-6 bg-slate-200 md:w-10" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
