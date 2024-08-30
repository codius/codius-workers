import { getCommit, triggerWorkflow } from "@/lib/github"
import { RequestError } from "@octokit/request-error"
import { ActionError, defineAction } from "astro:actions"
import { z } from "astro:schema"
import Cloudflare from "cloudflare"

export const app = {
  delete: defineAction({
    input: z.object({
      id: z.string(),
    }),
    handler: async ({ id }, context) => {
      if (!context.locals.user) {
        throw new ActionError({
          code: "UNAUTHORIZED",
        })
      }
      const app = await context.locals.db.apps.delete({
        id,
        userId: context.locals.user.id,
      })
      if (!app) {
        throw new ActionError({
          code: "NOT_FOUND",
          message: "App not found.",
        })
      }
      if (app.status === "deployed") {
        const cloudflare = new Cloudflare({
          apiToken: context.locals.runtime.env.CLOUDFLARE_API_TOKEN,
        })

        await cloudflare.workersForPlatforms.dispatch.namespaces.scripts.delete(
          context.locals.runtime.env.CF_DISPATCH_NAMESPACE,
          id,
          {
            account_id: context.locals.runtime.env.CLOUDFLARE_ACCOUNT_ID,
          },
        )
      }

      return { success: true }
    },
  }),
  create: defineAction({
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
      if (!context.locals.user) {
        throw new ActionError({
          code: "UNAUTHORIZED",
        })
      }
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
          branch,
          directory,
          dispatchNamespace: context.locals.runtime.env.CF_DISPATCH_NAMESPACE,
        })

        return { appId: app.id }
      } catch (e) {
        console.error(e)

        if (e instanceof Error) {
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
        }

        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unexpected issue saving the app.",
        })
      }
    },
  }),
}
