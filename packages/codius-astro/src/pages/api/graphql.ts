import type { APIContext } from "astro"

export async function POST(context: APIContext): Promise<Response> {
  // TODO: admin users
  if (!["justmoon", "wilsonianb"].includes(context.locals.user.username)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: {
        "Content-Type": "application/json",
      },
    })
  }
  try {
    const requestBody = await context.request.json()

    const response = await fetch(
      "https://api.cloudflare.com/client/v4/graphql",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${context.locals.runtime.env.CF_ANALYTICS_API_TOKEN}`,
        },
        body: JSON.stringify(requestBody),
      },
    )

    const data = await response.json()
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: "Failed to fetch data" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    })
  }
}
