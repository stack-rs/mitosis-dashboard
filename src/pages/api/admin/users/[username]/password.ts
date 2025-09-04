import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ params, request }) => {
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
    const username = params.username;
    const requestBody = await request.json();

    console.log(`Admin changing password for user: ${username}`);

    // For demo purposes, just return success
    // In production, this would forward to the actual coordinator
    return new Response(
      JSON.stringify({
        success: true,
        message: `Password changed for user "${username}"`,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Admin password change error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

