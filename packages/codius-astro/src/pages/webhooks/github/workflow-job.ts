import { Webhooks } from "@octokit/webhooks"
import type { APIContext } from "astro"

const WORKFLOW_NAME = ".github/workflows/deploy-worker.yml"

export async function POST(context: APIContext): Promise<Response> {
  const webhooks = new Webhooks({
    secret: context.locals.runtime.env.GITHUB_WEBHOOK_SECRET,
  })

  webhooks.on("workflow_job.in_progress", async (data) => {
    // steps[1] isn't consistently included in workflow_job.in_progress
    // so we can't reliable get appId + jobId + runId until workflow_job.completed
    if (
      data.payload.workflow_job.workflow_name === WORKFLOW_NAME &&
      data.payload.workflow_job.steps[1]
    ) {
      const appId = data.payload.workflow_job.steps[1].name

      await context.locals.db.apps.updateGitHubWorkflowJob(appId, {
        githubWorkflowJobId: data.payload.workflow_job.id,
        githubWorkflowRunId: data.payload.workflow_job.run_id,
      })
    }
  })

  webhooks.on("workflow_job.completed", async (data) => {
    if (data.payload.workflow_job.workflow_name === WORKFLOW_NAME) {
      const appId = data.payload.workflow_job.steps[1].name
      await context.locals.db.apps.updateCompletedGitHubWorkflowJob(appId, {
        githubWorkflowJobId: data.payload.workflow_job.id,
        githubWorkflowRunId: data.payload.workflow_job.run_id,
        status:
          data.payload.workflow_job.conclusion === "success"
            ? "deployed"
            : "failed",
      })
    }
  })

  try {
    const id = context.request.headers.get("x-github-delivery")
    const eventName = context.request.headers.get("x-github-event")
    const signature = context.request.headers.get("x-hub-signature-256")

    if (!id || !eventName || !signature) {
      return new Response("Missing required headers", { status: 400 })
    }

    if (eventName !== "workflow_job") {
      return new Response("Invalid event name", { status: 400 })
    }

    const body = await context.request.text()

    await webhooks.verifyAndReceive({
      id,
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
