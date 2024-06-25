import { getCommit, triggerWorkflow } from "@/lib/github"
import { ActionError, defineAction, z } from "astro:actions"
import { customAlphabet } from "nanoid"
import { RequestError } from "octokit"

const nanoid: () => string = customAlphabet(
  // Cloudflare worker names must be lowercase alphanumeric
  "123456789abcdefghijkmnopqrstuvwxyz",
  16,
)

export const server = {
  deleteApp: defineAction({
    input: z.object({
      id: z.string(),
    }),
    handler: async ({ id }, context) => {
      // TODO: delete worker

      const info = await context.locals.runtime.env.DB.prepare(
        "DELETE FROM apps WHERE id = ?1",
      )
        .bind(id)
        .run()
      console.log(info)

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

        const appId = nanoid()
        const info = await context.locals.runtime.env.DB.prepare(
          "INSERT INTO apps (id, userId, githubOwner, repo, branch, commitHash, directory) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        )
          .bind(
            appId,
            context.locals.user.id,
            owner,
            repo,
            branch,
            commit.sha,
            directory || "/",
          )
          .run()
        console.log(info)

        await triggerWorkflow(context.locals.runtime.env.GITHUB_ACCESS_TOKEN, {
          appId,
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
