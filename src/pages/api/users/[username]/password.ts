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

    console.log(`Password change for user ${username}`);

    // For demo purposes, return success with new token
    // In production, this would forward to the actual coordinator
    const mockResponse = {
      token: "new_jwt_token_" + Date.now(),
      message: "Password changed successfully",
    };

    return new Response(JSON.stringify(mockResponse), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Password change error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

