import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ params, request }) => {
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
    const groupName = params.groupName;

    // For demo purposes, return mock data
    // In production, this would forward to the actual coordinator
    const mockResponse = {
      group_name: groupName,
      creator_username: "admin",
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date().toISOString(),
      state: "Active",
      task_count: 15,
      storage_quota: 10737418240, // 10GB
      storage_used: 2147483648, // 2GB
      worker_count: 3,
      users_in_group: {
        admin: "Admin",
        user1: "Write",
        user2: "Read",
      },
    };

    return new Response(JSON.stringify(mockResponse), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Group details query error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

