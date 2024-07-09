import { getCommit, triggerWorkflow } from "@/lib/github"
import { RequestError } from "@octokit/request-error"
import { ActionError, defineAction, z } from "astro:actions"
import Stripe from "stripe"

export const server = {
  deleteApp: defineAction({
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
          directory,
        })

        return { success: true }
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
  createCheckoutSession: defineAction({
    input: z.object({
      appId: z.string(),
    }),
    handler: async ({ appId }, context) => {
      if (!context.locals.user) {
        throw new ActionError({
          code: "UNAUTHORIZED",
        })
      }

      const stripe = new Stripe(context.locals.runtime.env.STRIPE_SECRET_KEY)
      const { origin } = new URL(context.request.url)
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price: context.locals.runtime.env.STRIPE_TOPUP_PRICE_ID,
            quantity: 1,
          },
        ],
        mode: "payment",
        metadata: {
          // TODO: encrypt
          appId,
          userId: context.locals.user.id,
        },
        success_url: `${origin}/checkout-sessions/{CHECKOUT_SESSION_ID}/success`,
        cancel_url: `${origin}?canceled=true`,
      })

      if (!session.url) {
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create checkout session.",
        })
      } else {
        return session.url
      }
    },
  }),
}
