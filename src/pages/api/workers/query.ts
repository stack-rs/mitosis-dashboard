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

    // For demo purposes, return mock data
    // In production, this would forward to the actual coordinator
    const mockResponse = {
      count: 3,
      workers: [
        {
          worker_id: "worker-123e4567-e89b-12d3-a456-426614174000",
          creator_username: "admin",
          tags: ["compute", "gpu"],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          state: "Normal",
          last_heartbeat: new Date().toISOString(),
          assigned_task_id: null,
        },
        {
          worker_id: "worker-987fcdeb-51f2-4a61-b340-0123456789ab",
          creator_username: "user1",
          tags: ["compute", "cpu"],
          created_at: new Date(Date.now() - 3600000).toISOString(),
          updated_at: new Date().toISOString(),
          state: "Normal",
          last_heartbeat: new Date().toISOString(),
          assigned_task_id: "task-456",
        },
        {
          worker_id: "worker-456def78-9012-3456-789a-bcdef0123456",
          creator_username: "user2",
          tags: ["storage"],
          created_at: new Date(Date.now() - 7200000).toISOString(),
          updated_at: new Date().toISOString(),
          state: "GracefulShutdown",
          last_heartbeat: new Date(Date.now() - 300000).toISOString(),
          assigned_task_id: null,
        },
      ],
      group_name: "default",
    };

    return new Response(JSON.stringify(mockResponse), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Workers query error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

