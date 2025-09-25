import type { APIRoute } from "astro";

export const PUT: APIRoute = async ({ request, params }) => {
  try {
    const { id } = params;
    const { token, coordinator_addr, relations } = await request.json();

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

    if (
      !relations ||
      typeof relations !== "object" ||
      Object.keys(relations).length === 0
    ) {
      return new Response(
        JSON.stringify({
          error: "Relations object is required and cannot be empty",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    const response = await fetch(`${coordinator_addr}/workers/${id}/groups`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ relations }),
    });

    if (response.ok) {
      return new Response(JSON.stringify({ success: true }), {
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

export const DELETE: APIRoute = async ({ request, params }) => {
  try {
    const { id } = params;
    const { token, coordinator_addr, groups } = await request.json();

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

    if (!groups || !Array.isArray(groups) || groups.length === 0) {
      return new Response(
        JSON.stringify({
          error: "Groups array is required and cannot be empty",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Build query parameters for groups
    const queryParams = new URLSearchParams();
    groups.forEach((group: string) => {
      queryParams.append("groups", group);
    });

    const response = await fetch(
      `${coordinator_addr}/workers/${id}/groups?${queryParams.toString()}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (response.ok) {
      return new Response(JSON.stringify({ success: true }), {
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
