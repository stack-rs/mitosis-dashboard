import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  try {
    const { token, coordinator_addr } = await request.json();

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

    // For now, we'll return a simple success response
    // In a real implementation, this would test the Redis connection
    const response = await fetch(`${coordinator_addr}/redis`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      return new Response(JSON.stringify({ status: "connected" }), {
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
    return new Response(JSON.stringify({ error: "Connection test failed" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};

