const BACKEND_API_BASE =
  process.env.BACKEND_API_BASE_URL ?? "http://127.0.0.1:8000/api";

const ALLOWED_ACTIONS = new Set([
  "approve",
  "reject",
  "request-info",
  "send-to-review",
  "generate-document",
]);

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string; action: string }> }
) {
  const { id, action } = await context.params;

  if (!ALLOWED_ACTIONS.has(action)) {
    return Response.json({ detail: "Unsupported action." }, { status: 400 });
  }

  try {
    const upstream = await fetch(`${BACKEND_API_BASE}/requests/${id}/${action}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const text = await upstream.text();

    return new Response(text, {
      status: upstream.status,
      headers: {
        "content-type":
          upstream.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to reach backend API.";

    return Response.json(
      { detail: `Proxy error: ${message}` },
      { status: 502 }
    );
  }
}
