import Link from "next/link";

type Props = {
  defaults: {
    search?: string;
    risk?: string;
    priority?: string;
    status?: string;
  };
};

export default function RequestFilters({ defaults }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">
            Request Register
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Search, filter, and manage live approval requests.
          </p>
        </div>

        <Link
          href="/requests/new"
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          New request
        </Link>
      </div>

      <form action="/requests" className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <input
          name="search"
          defaultValue={defaults.search ?? ""}
          placeholder="Search title, description, type..."
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none ring-0 transition focus:border-slate-400"
        />

        <select
          name="risk"
          defaultValue={defaults.risk ?? ""}
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-slate-400"
        >
          <option value="">All risk levels</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <select
          name="priority"
          defaultValue={defaults.priority ?? ""}
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-slate-400"
        >
          <option value="">All priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <select
          name="status"
          defaultValue={defaults.status ?? ""}
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-slate-400"
        >
          <option value="">All statuses</option>
          <option value="submitted">Submitted</option>
          <option value="under_review">Under review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            Apply
          </button>

          <Link
            href="/requests"
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Reset
          </Link>
        </div>
      </form>
    </div>
  );
}