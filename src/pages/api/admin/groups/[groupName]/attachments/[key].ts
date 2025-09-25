import type { APIRoute } from "astro";

export const DELETE: APIRoute = async ({ request, params }) => {
  try {
    const { groupName, key } = params;

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

    if (!groupName || !key || !token || !coordinator_addr) {
      return new Response(
        JSON.stringify({
          error:
            "Missing required parameters: groupName, key, token, coordinator_addr",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Call the admin attachment deletion endpoint
    const response = await fetch(
      `${coordinator_addr}/admin/groups/${groupName}/attachments/${key}`,
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
          message: `Attachment "${key}" deleted from group "${groupName}"`,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    } else {
      const errorText = await response.text();
      console.error("Admin attachment deletion failed:", errorText);
      return new Response(
        JSON.stringify({
          error: errorText || "Failed to delete attachment",
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  } catch (error) {
    console.error("Admin attachment deletion error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
