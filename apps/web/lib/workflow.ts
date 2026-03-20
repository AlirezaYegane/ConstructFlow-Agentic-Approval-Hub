import type { ApprovalRequest } from "@/lib/api";

export type TimelineItem = {
  key: string;
  label: string;
  owner: string;
  state: "done" | "current" | "upcoming";
  detail: string;
};

function formatOwner(owner: string): string {
  return owner
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function parseRoute(route?: string | null): string[] {
  if (!route) return [];
  return route.split(">").map((item) => item.trim()).filter(Boolean);
}

export function buildWorkflowTimeline(request: ApprovalRequest): TimelineItem[] {
  const routeSteps = parseRoute(request.final_route ?? request.ai_suggested_route);

  const timeline: TimelineItem[] = [
    {
      key: "submitted",
      label: "Request submitted",
      owner: request.requester_name ?? "Requester",
      state: "done",
      detail: "The request has been logged in the approval hub.",
    },
    {
      key: "triage",
      label: "AI triage completed",
      owner: "ConstructFlow AI",
      state: "done",
      detail:
        request.ai_summary ??
        "The rule engine assessed risk and proposed a routing path.",
    },
  ];

  const normalizedStatus = request.status.toLowerCase();
  const isTerminal = ["approved", "rejected", "closed", "completed"].includes(normalizedStatus);

  routeSteps.forEach((step, index) => {
    let state: "done" | "current" | "upcoming" = "upcoming";

    if (isTerminal) {
      state = "done";
    } else if (index === 0) {
      state = "current";
    }

    timeline.push({
      key: `route-${index + 1}`,
      label: `Approval step ${index + 1}`,
      owner: formatOwner(step),
      state,
      detail: `Assigned reviewer in the recommended approval route.`,
    });
  });

  timeline.push({
    key: "decision",
    label: "Final decision",
    owner: "Approval workflow",
    state: isTerminal ? "done" : "upcoming",
    detail: `Current status: ${request.status}.`,
  });

  return timeline;
}