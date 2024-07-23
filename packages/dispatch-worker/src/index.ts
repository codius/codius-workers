import Cloudflare from "cloudflare"

export default {
  async fetch(request, env, ctx): Promise<Response> {
    try {
      const cloudflare = new Cloudflare({
        apiToken: env.CLOUDFLARE_API_TOKEN,
      })
      const workerName = new URL(request.url).host.split(".")[0]

      const url = new URL(request.url)

      if (url.pathname === "/.well-known/codius") {
        const { script } =
          await cloudflare.workersForPlatforms.dispatch.namespaces.scripts.get(
            env.DISPATCH_NAMESPACE,
            workerName,
            {
              account_id: env.CLOUDFLARE_ACCOUNT_ID,
            },
          )
        return Response.json(script)
      }

      const userWorker = env.DISPATCH_NAMESPACE_BINDING.get(workerName)
      return await userWorker.fetch(request)
    } catch (e) {
      if (e instanceof Error) {
        if (e.message.startsWith("Worker not found")) {
          // we tried to get a worker that doesn't exist in our dispatch namespace
          return new Response("", { status: 404 })
        }

        // this could be any other exception from `fetch()` *or* an exception
        // thrown by the called worker (e.g. if the dispatched worker has
        // `throw MyException()`, you could check for that here).
        return new Response(e.message, { status: 500 })
      } else {
        return new Response("Unexpected error", { status: 500 })
      }
    }
  },
} satisfies ExportedHandler<Env>
