import type { APIRoute } from "astro";

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const { token, coordinator_addr, ...requestData } = await request.json();

    if (!token || !coordinator_addr) {
      return new Response(
        JSON.stringify({ error: "Token and coordinator_addr are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const groupName = params.groupName;

    if (!groupName) {
      return new Response(JSON.stringify({ error: "Group name is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const response = await fetch(
      `${coordinator_addr}/groups/${groupName}/users`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      },
    );

    if (response.ok) {
      try {
        const data = await response.json();
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } catch (jsonError) {
        // If response is successful but not JSON, return success without data
        return new Response(
          JSON.stringify({
            success: true,
            message: "User role updated successfully",
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
    } else {
      const error = await response.text();
      return new Response(JSON.stringify({ error }), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("User role update error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};

export const DELETE: APIRoute = async ({ params, request }) => {
  try {
    const { token, coordinator_addr, users } = await request.json();

    if (!token || !coordinator_addr) {
      return new Response(
        JSON.stringify({ error: "Token and coordinator_addr are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const groupName = params.groupName;

    if (!groupName) {
      return new Response(JSON.stringify({ error: "Group name is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!users || !Array.isArray(users) || users.length === 0) {
      return new Response(
        JSON.stringify({ error: "Users array is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Send users as query parameters
    const usersParam = users
      .map((user) => `users=${encodeURIComponent(user)}`)
      .join("&");

    const response = await fetch(
      `${coordinator_addr}/groups/${groupName}/users?${usersParam}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (response.ok) {
      try {
        const data = await response.json();
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } catch (jsonError) {
        // If response is successful but not JSON, return success without data
        return new Response(
          JSON.stringify({
            success: true,
            message: "Users removed successfully",
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
    } else {
      const error = await response.text();
      return new Response(JSON.stringify({ error }), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("User removal error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
