import { Webhooks } from "@octokit/webhooks"
import type { APIContext } from "astro"

export async function POST(context: APIContext): Promise<Response> {
  const webhooks = new Webhooks({
    secret: context.locals.runtime.env.GITHUB_WEBHOOK_SECRET,
  })

  webhooks.on("workflow_run", (data) => {
    console.log(data, "event received")
  })

  try {
    const body = await context.request.json()
    const eventName = context.request.headers.get("x-github-event")
    const signature = context.request.headers.get("x-hub-signature-256")
    console.log({ body, eventName, signature })
    await webhooks.verifyAndReceive({
      id: context.request.headers.get("x-github-delivery"),
      name: eventName,
      signature: signature,
      payload: body,
    })

    return new Response("Event processed", { status: 200 })
  } catch (error) {
    console.error("Error handling webhook", error)
    return new Response("Error processing event", { status: 500 })
  }
}
