import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  try {
    const { token, coordinator_addr, uuid, content_type, content_length } =
      await request.json();

    if (!token || !coordinator_addr || !uuid) {
      return new Response(
        JSON.stringify({
          error: "Token, coordinator_addr, and uuid are required",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Match UploadArtifactReq schema
    const uploadArtifactReq = {
      content_type: content_type || "result", // Default to 'result'
      content_length: content_length || 0,
    };

    const response = await fetch(
      `${coordinator_addr}/tasks/${uuid}/artifacts`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(uploadArtifactReq),
      },
    );

    if (response.ok) {
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } else {
      const error = await response.text();
      return new Response(JSON.stringify({ error }), {
        status: response.status,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
