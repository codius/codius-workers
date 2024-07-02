import { nanoid } from "./utils"
import type { WorkflowJob } from "@octokit/webhooks-types"
import { D1QB } from "workers-qb"

type CreateAppOptions = {
  userId: string
  githubOwner: string
  repo: string
  branch: string
  commitHash: string
  directory?: string
}

type Status = "deployed" | "failed" | "pending"

type AppOptions = {
  id: string
  userId: string
}

type App = {
  id: string
  userId: string
  githubOwner: string
  repo: string
  branch: string
  commitHash: string
  directory: string
  status: Status
  githubWorkflowJobId: string | null
  githubWorkflowRunId: string | null
  createdAt: string
  updatedAt: string
}

export class Apps {
  private qb: D1QB
  constructor(d1: D1Database) {
    this.qb = new D1QB(d1)
  }

  async create({
    userId,
    githubOwner,
    repo,
    branch,
    commitHash,
    directory,
  }: CreateAppOptions) {
    const { results: app } = await this.qb
      .insert<App>({
        tableName: "apps",
        data: {
          id: nanoid(),
          userId,
          githubOwner,
          repo,
          branch,
          commitHash,
          directory: directory || "",
        },
        returning: "*",
      })
      .execute()
    return app
  }

  async delete({ id, userId }: AppOptions) {
    const { results } = await this.qb
      .delete<App>({
        tableName: "apps",
        where: {
          conditions: ["id = ?1", "userId = ?2"],
          params: [id, userId],
        },
        returning: "*",
      })
      .execute()
    return results?.[0]
  }

  async getByUserId(userId: string) {
    const { results } = await this.qb
      .fetchAll<App>({
        tableName: "apps",
        where: {
          conditions: "userId = ?1",
          params: [userId],
        },
      })
      .execute()
    return results
  }

  async get({ id, userId }: AppOptions) {
    const { results } = await this.qb
      .fetchOne<App>({
        tableName: "apps",
        where: {
          conditions: ["id = ?1", "userId = ?2"],
          params: [id, userId],
        },
      })
      .execute()
    return results
  }

  async updateGitHubWorkflowJob(id: string, workflowJob: WorkflowJob) {
    const { results } = await this.qb
      .update<App>({
        tableName: "apps",
        data: {
          githubWorkflowJobId: String(workflowJob.id),
          githubWorkflowRunId: String(workflowJob.run_id),
        },
        where: {
          conditions: "id = ?1",
          params: [id],
        },
        returning: "*",
      })
      .execute()
    return results?.[0]
  }

  async updateCompletedGitHubWorkflowJob(id: string, workflowJob: WorkflowJob) {
    const status = workflowJob.conclusion === "success" ? "deployed" : "failed"

    const { results } = await this.qb
      .update<App>({
        tableName: "apps",
        data: {
          githubWorkflowJobId: String(workflowJob.id),
          githubWorkflowRunId: String(workflowJob.run_id),
          status,
        },
        where: {
          conditions: "id = ?1",
          params: [id],
        },
        returning: "*",
      })
      .execute()
    return results?.[0]
  }
}
