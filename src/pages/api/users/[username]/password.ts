import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ params, request }) => {
  try {
    const { token, coordinator_addr, old_md5_password, new_md5_password } =
      await request.json();

    if (!token || !coordinator_addr) {
      return new Response(
        JSON.stringify({ error: "Token and coordinator_addr are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const username = params.username;

    if (!username || !old_md5_password || !new_md5_password) {
      return new Response(
        JSON.stringify({
          error:
            "Username, old_md5_password, and new_md5_password are required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Build the ChangePasswordReq payload
    const changePasswordReq = {
      old_md5_password,
      new_md5_password,
    };

    const response = await fetch(
      `${coordinator_addr}/users/${username}/password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(changePasswordReq),
      },
    );

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
    console.error("Password change error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
