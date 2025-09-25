import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  try {
    const {
      token,
      coordinator_addr,
      creator_usernames,
      group_name,
      tags,
      labels,
      states,
      exit_status,
      priority,
      limit,
      offset,
      count = false,
    } = await request.json();

    if (!token || !coordinator_addr) {
      return new Response(
        JSON.stringify({ error: "Token and coordinator_addr are required" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Build the query payload matching TasksQueryReq schema
    const queryPayload: any = {
      count,
    };

    // Add optional fields only if they have values (matching Python SDK behavior)
    if (creator_usernames && creator_usernames.length > 0) {
      queryPayload.creator_usernames = creator_usernames;
    }
    if (group_name) {
      queryPayload.group_name = group_name;
    }
    if (tags && tags.length > 0) {
      queryPayload.tags = tags;
    }
    if (labels && labels.length > 0) {
      queryPayload.labels = labels;
    }
    if (states && states.length > 0) {
      queryPayload.states = states;
    }
    if (exit_status) {
      queryPayload.exit_status = exit_status;
    }
    if (priority !== undefined && priority !== null) {
      queryPayload.priority = priority;
    }
    if (limit !== undefined && limit !== null) {
      queryPayload.limit = limit;
    }
    if (offset !== undefined && offset !== null) {
      queryPayload.offset = offset;
    }

    const response = await fetch(`${coordinator_addr}/tasks/query`, {
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
