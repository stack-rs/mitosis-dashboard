import type { APIRoute } from "astro";
import crypto from "node:crypto";

export const POST: APIRoute = async ({ request }) => {
  try {
    const { password } = await request.json();

    if (!password) {
      return new Response(JSON.stringify({ error: "Password is required" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Hash password using MD5 and convert to array of integers (matching Python SDK)
    const md5Hash = crypto.createHash("md5").update(password).digest();
    const md5_password = Array.from(md5Hash);

    return new Response(JSON.stringify({ md5_password }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Password hashing error:", error);
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
