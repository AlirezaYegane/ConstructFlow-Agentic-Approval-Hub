import { PageIntro } from "@/components/shell/page-intro";
import { ReportsDashboard } from "@/components/reports/reports-dashboard";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Executive Reports"
        title="A one-glance portfolio view for managers"
        description="This page is designed to help a manager understand current pressure, risk, throughput, and operational bottlenecks in a few seconds."
      />

      <ReportsDashboard />
    </div>
  );
}
