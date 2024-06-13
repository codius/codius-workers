import { defineAction, z } from "astro:actions"

export const server = {
  app: defineAction({
    accept: "form",
    input: z.object({
      repo: z
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
    handler: async ({ repo, branch, directory }) => {
      console.log("Deploying app", { repo, branch, directory })
      return { success: true }
    },
  }),
}
