// Utility for consistent CORS headers across all API endpoints
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export const addCorsHeaders = (headers: Record<string, string> = {}) => {
  return {
    ...headers,
    ...corsHeaders,
  };
};

export const createCorsResponse = (
  body: string | null,
  status: number = 200,
  additionalHeaders: Record<string, string> = {}
) => {
  return new Response(body, {
    status,
    headers: addCorsHeaders(additionalHeaders),
  });
};