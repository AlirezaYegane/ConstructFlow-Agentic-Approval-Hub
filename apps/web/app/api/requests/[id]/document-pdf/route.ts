const BACKEND_API_BASE =
  process.env.BACKEND_API_BASE_URL ?? "http://127.0.0.1:8000/api";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const upstream = await fetch(`${BACKEND_API_BASE}/requests/${id}/document-pdf`, {
      method: "GET",
      cache: "no-store",
    });

    const arrayBuffer = await upstream.arrayBuffer();

    return new Response(arrayBuffer, {
      status: upstream.status,
      headers: {
        "content-type":
          upstream.headers.get("content-type") ?? "application/pdf",
        "content-disposition":
          upstream.headers.get("content-disposition") ?? "inline",
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
