import type { APIRoute } from "astro";
import crypto from "node:crypto";

export const POST: APIRoute = async ({ request }) => {
  try {
    const {
      username,
      password,
      retain = true,
      coordinator_addr,
    } = await request.json();

    const md5Hash = crypto.createHash("md5").update(password).digest();
    const md5_password = Array.from(md5Hash);

    const requestBody = {
      username,
      md5_password,
      retain,
    };

    const response = await fetch(`${coordinator_addr}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
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
      console.error("Backend login failed:", error);
      return new Response(JSON.stringify({ error }), {
        status: response.status,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  } catch (error) {
    console.error("API login error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
};
