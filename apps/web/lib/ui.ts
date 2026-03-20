export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function riskBadgeClass(risk?: string | null): string {
  switch ((risk ?? "").toLowerCase()) {
    case "high":
      return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
    case "medium":
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
    default:
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
  }
}

export function priorityBadgeClass(priority?: string | null): string {
  switch ((priority ?? "").toLowerCase()) {
    case "high":
      return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
    case "medium":
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
    default:
      return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
  }
}

export function statusBadgeClass(status?: string | null): string {
  switch ((status ?? "").toLowerCase()) {
    case "approved":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
    case "rejected":
      return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
    case "submitted":
      return "bg-sky-50 text-sky-700 ring-1 ring-sky-200";
    default:
      return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
  }
}

