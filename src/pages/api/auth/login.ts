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

    console.log("API Login attempt:", {
      username,
      coordinator_addr,
      retain,
      passwordLength: password?.length,
    });

    // Hash password using MD5 and convert to array of integers (matching Python SDK)
    const md5Hash = crypto.createHash("md5").update(password).digest();
    const md5_password = Array.from(md5Hash);

    // console.log("MD5 hash generated, length:", md5_password.length);
    // console.log("Making request to:", `${coordinator_addr}/login`);

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

    // console.log("Backend response status:", response.status);

    if (response.ok) {
      const data = await response.json();
      // console.log("Login successful, token received");
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
