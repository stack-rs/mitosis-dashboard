import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ params, request }) => {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");
    const coordinator_addr = url.searchParams.get("coordinator_addr");

    if (!token || !coordinator_addr) {
      return new Response(
        JSON.stringify({ error: "Token and coordinator_addr are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const groupName = params.groupName;

    if (!groupName) {
      return new Response(JSON.stringify({ error: "Group name is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const response = await fetch(`${coordinator_addr}/groups/${groupName}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      const error = await response.text();
      return new Response(JSON.stringify({ error }), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Group details query error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
