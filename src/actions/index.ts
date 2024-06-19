import { ActionError, defineAction, z } from "astro:actions"
import { getSession } from "auth-astro/server"
import { customAlphabet } from "nanoid"

const nanoid: () => string = customAlphabet(
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz",
  16,
)

export const server = {
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
        const session = await getSession(context.request)
        const repoPath = new URL(repoUrl).pathname
        const [owner, repo] = repoPath.substring(1).split("/")

        // fetch the head commit for repo + branch from GitHub
        const branchUrl = `https://api.github.com/repos/${owner}/${repo}/commits/${branch}`
        const commit = await fetch(branchUrl, {
          headers: {
            Authorization: `token ${session.accessToken}`,
            "User-Agent": import.meta.env.GITHUB_APP_NAME,
          },
        }).then((res) => res.json())

        const appId = nanoid()
        const deploymentId = nanoid()
        context.locals.runtime.env.DB.batch([
          context.locals.runtime.env.DB.prepare(
            "INSERT INTO apps (id, userId) VALUES (?1, ?2)",
          ).bind(appId, session.user.email),
          context.locals.runtime.env.DB.prepare(
            "INSERT INTO deployments (id, appId, githubOwner, repo, branch, commit, directory) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
          ).bind(
            deploymentId,
            appId,
            owner,
            repo,
            branch,
            commit.sha,
            directory || null,
          ),
        ])
        return { success: true }
      } catch (e) {
        console.error(e)
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
        })
      }
    },
  }),
}
