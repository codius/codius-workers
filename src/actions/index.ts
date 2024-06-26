import { getCommit, triggerWorkflow } from "@/lib/github"
import { ActionError, defineAction, z } from "astro:actions"
import { RequestError } from "octokit"

export const server = {
  deleteApp: defineAction({
    input: z.object({
      id: z.string(),
    }),
    handler: async ({ id }, context) => {
      const app = await context.locals.db.apps.delete(id)
      if (app.status === "deployed") {
        // Workers for Platforms
        // https://api.cloudflare.com/client/v4/accounts/{account_id}/workers/dispatch/namespaces/{dispatch_namespace}/scripts/{script_name}
        const url = `https://api.cloudflare.com/client/v4/accounts/${context.locals.runtime.env.CLOUDFLARE_ACCOUNT_ID}/workers/scripts/${id}`

        const options = {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${context.locals.runtime.env.CLOUDFLARE_API_TOKEN}`,
          },
        }

        const res = await fetch(url, options)
        console.log(await res.json())
      }

      return { success: true }
    },
  }),
  deployApp: defineAction({
    accept: "form",
    input: z.object({
      repoUrl: z
        .string()
        .min(1)
        .refine(
          (data) => /^https:\/\/github\.com\/[^\/]+\/[^\/]+$/.test(data),
          {
            message:
              "Repo must be a valid GitHub URL in the format 'https://github.com/username/repository'.",
          },
        ),
      branch: z.string().min(1),
      directory: z.string().optional(),
    }),
    // https://github.com/withastro/roadmap/blob/actions/proposals/0046-actions.md#access-api-context
    handler: async ({ repoUrl, branch, directory }, context) => {
      try {
        const repoPath = new URL(repoUrl).pathname
        const [owner, repo] = repoPath.substring(1).split("/")

        // fetch the head commit for repo + branch from GitHub
        const commit = await getCommit({ owner, repo, branch })

        const app = await context.locals.db.apps.create({
          userId: context.locals.user.id,
          githubOwner: owner,
          repo,
          branch,
          commitHash: commit.sha,
          directory,
        })

        await triggerWorkflow(context.locals.runtime.env.GITHUB_ACCESS_TOKEN, {
          appId: app.id,
          owner,
          repo,
          commitHash: commit.sha,
          directory,
        })

        return { success: true }
      } catch (e) {
        console.error(e)

        if (e.message.includes("UNIQUE constraint failed")) {
          throw new ActionError({
            code: "CONFLICT",
            message: "An app with these details already exists.",
          })
        } else if (e instanceof RequestError) {
          throw new ActionError({
            code: "BAD_REQUEST",
            message: "Invalid repo URL.",
          })
        }

        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unexpected issue saving the app.",
        })
      }
    },
  }),
}
