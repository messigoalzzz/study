import { ACTIONS_CORS_HEADERS, ActionsJson } from "@solana/actions";

export const GET = async () => {
  const payload: ActionsJson = {
    rules: [
      // Map all root-level routes to an action
      {
        pathPattern: "/*",
        apiPath: "/api/actions/*",
      },
      // Fallback rule
      {
        pathPattern: "/api/actions/**",
        apiPath: "/api/actions/**",
      },
    ],
  };

  return new Response(JSON.stringify(payload), {
    headers: ACTIONS_CORS_HEADERS,
  });
};

// Ensure CORS works for Blinks by including the OPTIONS method
export const OPTIONS = GET;