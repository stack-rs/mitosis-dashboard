import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  try {
    const {
      token,
      coordinator_addr,
      group_name,
      role,
      tags,
      labels,
      creator_username,
      count = false,
    } = await request.json();

    if (!token || !coordinator_addr) {
      return new Response(
        JSON.stringify({ error: "Token and coordinator_addr are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Build the query payload matching WorkersQueryReq schema
    const queryPayload: any = {
      count,
    };

    // Add optional fields only if they have values
    if (group_name) {
      queryPayload.group_name = group_name;
    }
    if (role && role.length > 0) {
      queryPayload.role = role;
    }
    if (tags && tags.length > 0) {
      queryPayload.tags = tags;
    }
    if (labels && labels.length > 0) {
      queryPayload.labels = labels;
    }
    if (creator_username) {
      queryPayload.creator_username = creator_username;
    }

    const response = await fetch(`${coordinator_addr}/workers/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(queryPayload),
    });

    if (response.ok) {
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      const error = await response.text();
      return new Response(JSON.stringify({ error }), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Workers query error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
