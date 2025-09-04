import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  try {
    const {
      token,
      coordinator_addr,
      group_name,
      tags = [],
      labels = [],
      timeout = "10min",
      priority = 0,
      task_spec,
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

    // Construct the SubmitTaskReq payload matching the Python schema
    const submitTaskReq = {
      group_name,
      tags: Array.isArray(tags) ? tags : [], // Convert to array (will be serialized as list in Python)
      labels: Array.isArray(labels) ? labels : [], // Convert to array (will be serialized as list in Python)
      timeout: timeout || "10min", // Default timeout
      priority: priority || 0, // Default priority
      task_spec: {
        args: task_spec.args || [],
        envs: task_spec.envs || {},
        resources: task_spec.resources || [],
        terminal_output: task_spec.terminal_output || false,
        watch: task_spec.watch || null,
      },
    };

    const response = await fetch(`${coordinator_addr}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(submitTaskReq),
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

