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
      const jobId = String(data.payload.workflow_job.id)
      const runId = String(data.payload.workflow_job.run_id)

      const info = await context.locals.runtime.env.DB.prepare(
        "UPDATE apps SET githubWorkflowJobId = ?1, githubWorkflowRunId = ?2 WHERE id = ?3",
      )
        .bind(jobId, runId, appId)
        .run()
      console.log(info)
    }
  })

  webhooks.on("workflow_job.completed", async (data) => {
    if (data.payload.workflow_job.workflow_name === WORKFLOW_NAME) {
      const appId = data.payload.workflow_job.steps[1].name
      const jobId = String(data.payload.workflow_job.id)
      const runId = String(data.payload.workflow_job.run_id)
      const status =
        data.payload.workflow_job.conclusion === "success"
          ? "deployed"
          : "failed"

      const info = await context.locals.runtime.env.DB.prepare(
        "UPDATE apps SET githubWorkflowJobId = ?1, githubWorkflowRunId = ?2, status = ?3 WHERE id = ?4",
      )
        .bind(jobId, runId, status, appId)
        .run()
      console.log(info)
    }
  })

  try {
    const body = await context.request.text()
    const eventName = context.request.headers.get("x-github-event")
    const signature = context.request.headers.get("x-hub-signature-256")

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
