import type { ReactNode } from "react";

type PageIntroProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
};

export function PageIntro({
  eyebrow,
  title,
  description,
  actions,
}: PageIntroProps) {
  return (
    <div className="flex flex-col gap-4 rounded-[28px] border border-black/5 bg-white/90 p-6 shadow-sm lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        <div className="cf-kicker text-[11px] font-semibold text-slate-500">
          {eyebrow}
        </div>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
          {title}
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
      </div>

      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
