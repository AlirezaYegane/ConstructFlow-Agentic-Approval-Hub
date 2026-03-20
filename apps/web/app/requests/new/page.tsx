import Link from "next/link";
import RequestCreateForm from "@/components/request-create-form";

export default function NewRequestPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/requests"
          className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          Back to requests
        </Link>
      </div>

      <RequestCreateForm />
    </div>
  );
}