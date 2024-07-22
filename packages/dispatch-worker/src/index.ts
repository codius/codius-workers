export default {
  async fetch(request, env, ctx): Promise<Response> {
    try {
      const workerName = new URL(request.url).host.split(".")[0]
      const userWorker = env.DISPATCH_NAMESPACE.get(workerName)
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
