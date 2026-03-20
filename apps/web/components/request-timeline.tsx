import type { TimelineItem } from "@/lib/workflow";

type Props = {
  items: TimelineItem[];
};

function dotClass(state: TimelineItem["state"]): string {
  switch (state) {
    case "done":
      return "bg-emerald-500";
    case "current":
      return "bg-sky-500";
    default:
      return "bg-slate-300";
  }
}

function cardClass(state: TimelineItem["state"]): string {
  switch (state) {
    case "done":
      return "border-emerald-200 bg-emerald-50";
    case "current":
      return "border-sky-200 bg-sky-50";
    default:
      return "border-slate-200 bg-white";
  }
}

export default function RequestTimeline({ items }: Props) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={item.key} className="flex gap-4">
          <div className="flex w-6 flex-col items-center">
            <div className={`mt-1 h-3 w-3 rounded-full ${dotClass(item.state)}`} />
            {index < items.length - 1 ? <div className="mt-2 w-px flex-1 bg-slate-200" /> : null}
          </div>

          <div className={`flex-1 rounded-2xl border p-4 ${cardClass(item.state)}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-900">{item.label}</div>
                <div className="mt-1 text-sm text-slate-500">{item.owner}</div>
              </div>

              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                {item.state}
              </span>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-600">{item.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}