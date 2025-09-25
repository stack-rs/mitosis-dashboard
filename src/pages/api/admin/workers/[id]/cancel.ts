import type { APIRoute } from "astro";

export const DELETE: APIRoute = async ({ request, params }) => {
  try {
    const { id } = params;
    const url = new URL(request.url);
    const force = url.searchParams.get("op") === "force";

    const body = await request.json();
    const { token, coordinator_addr } = body;

    if (!token || !coordinator_addr) {
      return new Response(
        JSON.stringify({ error: "Token and coordinator_addr are required" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    const queryParam = force ? "?op=force" : "";
    const fetchUrl = `${coordinator_addr}/admin/workers/${id}${queryParam}`;

    try {
      const response = await fetch(fetchUrl, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        });
      } else {
        const error = await response.text();
        return new Response(JSON.stringify({ error }), {
          status: response.status,
          headers: {
            "Content-Type": "application/json",
          },
        });
      }
    } catch (fetchError) {
      return new Response(
        JSON.stringify({ error: "Failed to connect to coordinator" }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
