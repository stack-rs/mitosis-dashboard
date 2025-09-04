import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
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
    const requestBody = await request.json();

    console.log("Admin creating user:", {
      username: requestBody.username,
      admin: requestBody.admin,
    });

    // For demo purposes, just return success
    // In production, this would forward to the actual coordinator
    return new Response(
      JSON.stringify({
        success: true,
        message: `User "${requestBody.username}" created successfully`,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Admin user creation error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

