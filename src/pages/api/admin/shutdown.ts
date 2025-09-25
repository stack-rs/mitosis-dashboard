import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  try {
    const { token, coordinator_addr, secret, timeout } = await request.json();

    if (!token || !coordinator_addr || !secret) {
      return new Response(
        JSON.stringify({
          error: "Token, coordinator_addr, and secret are required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Build the ShutdownReq payload - secret is required!
    const shutdownReq: any = {
      secret: secret,
    };
    if (timeout) {
      shutdownReq.timeout = timeout;
    }

    const response = await fetch(`${coordinator_addr}/admin/shutdown`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(shutdownReq),
    });

    if (response.ok) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Shutdown command sent to coordinator",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    } else {
      const error = await response.text();
      return new Response(JSON.stringify({ error }), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Admin shutdown error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
