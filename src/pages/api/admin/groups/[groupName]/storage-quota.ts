import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ params, request }) => {
  try {
    const { token, coordinator_addr, storage_quota } = await request.json();

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

    if (!groupName || !storage_quota) {
      return new Response(
        JSON.stringify({ error: "Group name and storage_quota are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Build the UpdateStorageQuotaReq payload
    const updateStorageQuotaReq = {
      storage_quota,
    };

    const response = await fetch(
      `${coordinator_addr}/admin/groups/${groupName}/storage-quota`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateStorageQuotaReq),
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
    console.error("Admin storage quota update error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
