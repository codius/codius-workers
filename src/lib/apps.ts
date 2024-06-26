import type { WorkflowJob } from "@octokit/webhooks-types"

type CreateAppOptions = {
  id: string
  userId: string
  githubOwner: string
  repo: string
  branch: string
  commitHash: string
  directory?: string
}

type Status = "deployed" | "failed" | "pending"

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
  constructor(private db: D1Database) {}

  async create({
    id,
    userId,
    githubOwner,
    repo,
    branch,
    commitHash,
    directory,
  }: CreateAppOptions) {
    return this.db
      .prepare(
        "INSERT INTO apps (id, userId, githubOwner, repo, branch, commitHash, directory) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
      )
      .bind(id, userId, githubOwner, repo, branch, commitHash, directory || "")
      .run()
  }

  async delete(id: string) {
    return this.db.prepare("DELETE FROM apps WHERE id = ?1").bind(id).run()
  }

  async getById(id: string) {
    return this.db
      .prepare("SELECT * FROM apps WHERE id = ?1")
      .bind(id)
      .first<App>()
  }

  async getByUserId(userId: string) {
    const { results } = await this.db
      .prepare("SELECT * FROM apps WHERE userId = ?1")
      .bind(userId)
      .all<App>()
    return results
  }

  async updateGitHubWorkflowJob(id: string, workflowJob: WorkflowJob) {
    return this.db
      .prepare(
        "UPDATE apps SET githubWorkflowJobId = ?1, githubWorkflowRunId = ?2 WHERE id = ?3",
      )
      .bind(String(workflowJob.id), String(workflowJob.run_id), id)
      .run()
  }

  async updateCompletedGitHubWorkflowJob(id: string, workflowJob: WorkflowJob) {
    const status = workflowJob.conclusion === "success" ? "deployed" : "failed"

    return this.db
      .prepare(
        "UPDATE apps SET githubWorkflowJobId = ?1, githubWorkflowRunId = ?2, status = ?3 WHERE id = ?4",
      )
      .bind(String(workflowJob.id), String(workflowJob.run_id), status, id)
      .run()
  }
}
