import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");
    const coordinator_addr = url.searchParams.get("coordinator_addr");
    const uuid = url.searchParams.get("uuid");
    const content_type = url.searchParams.get("content_type");

    if (!token || !coordinator_addr || !uuid || !content_type) {
      return new Response(
        JSON.stringify({
          error: "Token, coordinator_addr, uuid, and content_type are required",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    const response = await fetch(
      `${coordinator_addr}/tasks/${uuid}/download/artifacts/${content_type}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (response.ok) {
      const data = await response.json();
      return new Response(JSON.stringify(data), {
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
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
