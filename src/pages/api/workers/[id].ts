import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ params, request }) => {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");
    const coordinatorAddr = url.searchParams.get("coordinator_addr");

    if (!token || !coordinatorAddr) {
      return new Response(
        JSON.stringify({ error: "Token and coordinator_addr are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const workerId = params.id;

    if (!workerId) {
      return new Response(JSON.stringify({ error: "Worker ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const response = await fetch(`${coordinatorAddr}/workers/${workerId}`, {
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
    console.error("Worker query error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const DELETE: APIRoute = async ({ params, request }) => {
  try {
    const { token, coordinator_addr } = await request.json();

    if (!token || !coordinator_addr) {
      return new Response(
        JSON.stringify({ error: "Token and coordinator_addr are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const workerId = params.id;

    if (!workerId) {
      return new Response(JSON.stringify({ error: "Worker ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const url = new URL(request.url);
    const force = url.searchParams.get("op") === "force";
    const queryParam = force ? "?op=force" : "";

    const response = await fetch(
      `${coordinator_addr}/workers/${workerId}${queryParam}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

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
    console.error("Worker cancellation error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
