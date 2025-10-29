import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  try {
    const {
      token,
      coordinator_addr,
      group_name,
      key: key,
      limit = 20,
      offset = 0,
      count = false,
    } = await request.json();

    if (!token || !coordinator_addr || !group_name) {
      return new Response(
        JSON.stringify({
          error: "Token, coordinator_addr, and group_name are required",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Build the query payload
    const queryPayload: any = {
      limit,
      offset,
      count, // Required field according to AttachmentsQueryReq schema
    };

    // Add optional fields
    if (key) {
      queryPayload.key = key;
    }

    const response = await fetch(
      `${coordinator_addr}/groups/${group_name}/attachments/query`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(queryPayload),
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
