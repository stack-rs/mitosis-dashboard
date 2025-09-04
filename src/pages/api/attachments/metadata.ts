import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");
    const coordinator_addr = url.searchParams.get("coordinator_addr");
    const group_name = url.searchParams.get("group_name");
    const key = url.searchParams.get("key");

    if (!token || !coordinator_addr || !group_name || !key) {
      return new Response(
        JSON.stringify({
          error: "Token, coordinator_addr, group_name, and key are required",
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
      `${coordinator_addr}/groups/${group_name}/attachments/${key}`,
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
