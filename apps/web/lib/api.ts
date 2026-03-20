export type ApprovalRequest = {
  id: number;
  project_id: number;
  project_name: string | null;
  requester_id: number;
  requester_name: string | null;
  request_type: string;
  category: string;
  title: string;
  description: string;
  estimated_cost: number;
  priority: string;
  safety_flag: boolean;
  status: string;
  ai_summary: string | null;
  ai_risk_level: string | null;
  ai_suggested_route: string | null;
  final_route: string | null;
};

const API_BASE_URL =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://127.0.0.1:8000/api";

async function apiFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export async function getRequests(): Promise<ApprovalRequest[]> {
  return apiFetch<ApprovalRequest[]>("/requests");
}

export async function getRequest(requestId: number): Promise<ApprovalRequest> {
  return apiFetch<ApprovalRequest>(`/requests/${requestId}`);
}

