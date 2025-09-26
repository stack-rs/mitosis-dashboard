import type { APIRoute } from "astro";

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
};

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");
    const coordinator_addr = url.searchParams.get("coordinator_addr");
    const uuid = url.searchParams.get("uuid");
    const content_type = url.searchParams.get("content_type");

    if (!token || !coordinator_addr || !uuid || !content_type) {
      return new Response(
        JSON.stringify({
          error: "Token, coordinator_addr, uuid, and content_type are required",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    // First get the presigned URL from the coordinator
    const response = await fetch(
      `${coordinator_addr}/tasks/${uuid}/download/artifacts/${content_type}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      const error = await response.text();
      return new Response(JSON.stringify({ error }), {
        status: response.status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }

    const data = await response.json();

    // Now fetch the actual file from S3 using the presigned URL
    const fileResponse = await fetch(data.url);

    if (!fileResponse.ok) {
      return new Response(
        JSON.stringify({ error: `Failed to fetch file from storage: ${fileResponse.statusText}` }),
        {
          status: fileResponse.status,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        },
      );
    }

    // Get the filename based on content type
    const getFileName = (type: string): string => {
      switch (type) {
        case "result":
          return "result.tar.gz";
        case "exec_log":
          return "exec-log.tar.gz";
        case "std_log":
          return "std-log.tar.gz";
        default:
          return `${type}.tar.gz`;
      }
    };

    // Stream the file back to the client with appropriate headers
    return new Response(fileResponse.body, {
      status: 200,
      headers: {
        "Content-Type": "application/gzip",
        "Content-Disposition": `attachment; filename="${getFileName(content_type)}"`,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        // Pass through content-length if available
        ...(fileResponse.headers.get("content-length") && {
          "Content-Length": fileResponse.headers.get("content-length")!
        })
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
};
