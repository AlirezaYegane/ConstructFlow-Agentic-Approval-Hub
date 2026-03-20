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

export type RequestQuery = {
  search?: string;
  risk?: string;
  priority?: string;
  status?: string;
  projectId?: string;
};

export type CreateRequestInput = {
  project_id: number;
  requester_id: number;
  request_type: string;
  category: string;
  title: string;
  description: string;
  estimated_cost: number;
  priority: string;
  safety_flag: boolean;
};

const API_BASE_URL =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://127.0.0.1:8000/api";

function buildQueryString(params?: RequestQuery): string {
  if (!params) return "";

  const query = new URLSearchParams();

  if (params.search) query.set("search", params.search);
  if (params.risk) query.set("risk", params.risk);
  if (params.priority) query.set("priority", params.priority);
  if (params.status) query.set("status", params.status);
  if (params.projectId) query.set("project_id", params.projectId);

  const value = query.toString();
  return value ? `?${value}` : "";
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
    ...init,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function getRequests(params?: RequestQuery): Promise<ApprovalRequest[]> {
  return apiFetch<ApprovalRequest[]>(`/requests${buildQueryString(params)}`);
}

export async function getRequest(requestId: number): Promise<ApprovalRequest> {
  return apiFetch<ApprovalRequest>(`/requests/${requestId}`);
}

export async function createRequest(input: CreateRequestInput): Promise<ApprovalRequest> {
  return apiFetch<ApprovalRequest>("/requests", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(input),
  });
}