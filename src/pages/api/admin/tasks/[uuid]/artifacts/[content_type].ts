import type { APIRoute } from "astro";

export const DELETE: APIRoute = async ({ request, params }) => {
  try {
    const { uuid, content_type } = params;

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { token, coordinator_addr } = body;

    if (!uuid || !content_type || !token || !coordinator_addr) {
      return new Response(
        JSON.stringify({
          error:
            "Missing required parameters: uuid, content_type, token, coordinator_addr",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Call the admin artifact deletion endpoint
    const response = await fetch(
      `${coordinator_addr}/admin/tasks/${uuid}/artifacts/${content_type}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (response.ok) {
      return new Response(
        JSON.stringify({
          message: `${content_type} artifact deleted for task "${uuid}"`,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    } else {
      const errorText = await response.text();
      console.error("Admin artifact deletion failed:", errorText);
      return new Response(
        JSON.stringify({
          error: errorText || "Failed to delete artifact",
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  } catch (error) {
    console.error("Admin artifact deletion error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
