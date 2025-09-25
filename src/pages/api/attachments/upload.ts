import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  try {
    const {
      token,
      coordinator_addr,
      group_name,
      key,
      content_length,
      content_type,
    } = await request.json();

    if (!token || !coordinator_addr || !group_name || !key) {
      return new Response(
        JSON.stringify({
          error: "Token, coordinator_addr, group_name, and key are required",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Match UploadAttachmentReq schema
    const uploadAttachmentReq = {
      key: key,
      content_length: content_length || 0,
      content_type: content_type || "application/octet-stream",
    };

    const response = await fetch(
      `${coordinator_addr}/groups/${group_name}/attachments`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(uploadAttachmentReq),
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
