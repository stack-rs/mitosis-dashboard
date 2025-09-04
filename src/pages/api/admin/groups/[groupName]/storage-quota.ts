import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ params, request }) => {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid authorization header" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const token = authHeader.substring(7);
    const groupName = params.groupName;
    const requestBody = await request.json();

    console.log(
      `Admin updating storage quota for group ${groupName}:`,
      requestBody,
    );

    // Parse storage quota string to bytes (simplified)
    const parseStorageQuota = (quota: string): number => {
      const match = quota.match(/^(\d+(?:\.\d+)?)\s*(GB|MB|TB|KB|B)?$/i);
      if (!match) return parseInt(quota) || 0;

      const value = parseFloat(match[1]);
      const unit = (match[2] || "B").toUpperCase();

      const multipliers: { [key: string]: number } = {
        B: 1,
        KB: 1024,
        MB: 1024 * 1024,
        GB: 1024 * 1024 * 1024,
        TB: 1024 * 1024 * 1024 * 1024,
      };

      return Math.floor(value * (multipliers[unit] || 1));
    };

    const quotaBytes = parseStorageQuota(requestBody.storage_quota);

    // For demo purposes, return mock response
    // In production, this would forward to the actual coordinator
    const mockResponse = {
      storage_quota: quotaBytes,
      message: `Storage quota updated to ${quotaBytes} bytes`,
    };

    return new Response(JSON.stringify(mockResponse), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Admin storage quota update error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

