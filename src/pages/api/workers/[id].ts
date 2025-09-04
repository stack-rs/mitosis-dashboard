import type { APIRoute } from "astro";

export const DELETE: APIRoute = async ({ params, request }) => {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid authorization header" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const token = authHeader.substring(7);
    const workerId = params.id;
    const url = new URL(request.url);
    const force = url.searchParams.get("op") === "force";

    console.log(`${force ? "Force " : ""}Cancelling worker ${workerId}`);

    // For demo purposes, just return success
    // In production, this would forward to the actual coordinator
    return new Response(
      JSON.stringify({
        success: true,
        message: `Worker ${workerId} ${force ? "force " : ""}cancelled`,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Worker cancellation error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

