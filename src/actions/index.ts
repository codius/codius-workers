import { ActionError, defineAction, z } from "astro:actions"
import { customAlphabet } from "nanoid"
import { Octokit, RequestError } from "octokit"

const nanoid: () => string = customAlphabet(
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz",
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
        const branchUrl = `https://api.github.com/repos/${owner}/${repo}/commits/${branch}`
        const commitHash = await fetch(branchUrl, {
          headers: {
            // TODO: store and use the user's GitHub access token
            // Authorization: `token ${session.accessToken}`,
            "User-Agent": import.meta.env.GITHUB_APP_NAME,
          },
        }).then((res) => res.json())

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
            commitHash.sha,
            directory || "/",
          )
          .run()
        console.log(info)

        // https://docs.github.com/en/rest/actions/workflows?apiVersion=2022-11-28#create-a-workflow-dispatch-event
        const octokit = new Octokit({
          auth: context.locals.runtime.env.GITHUB_ACCESS_TOKEN,
        })

        const { data } = await octokit.request(
          "POST /repos/codius/codius-astro/actions/workflows/{workflow_id}/dispatches",
          {
            workflow_id: "deploy-worker.yml",
            // TODO: main
            ref: "github-action",
            inputs: {
              repo: `${owner}/${repo}`,
              // TODO: commitHash
              branch,
              directory,
            },
            headers: {
              "X-GitHub-Api-Version": "2022-11-28",
            },
          },
        )

        console.log(data)

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
