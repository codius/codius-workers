import { apps, payments } from "../schema"
import * as schema from "../schema"
import type { WorkflowJob } from "@octokit/webhooks-types"
import { eq, and, sql, getTableColumns } from "drizzle-orm"
import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1"

// type NewApp = typeof apps.$inferInsert
type CreateAppOptions = {
  userId: string
  githubOwner: string
  repo: string
  branch: string
  commitHash: string
  directory?: string
}

type AppOptions = {
  id: string
  userId: string
}

export class Apps {
  private db: DrizzleD1Database<typeof schema>
  constructor(d1: D1Database) {
    this.db = drizzle(d1, { schema })
  }

  async create(appOpts: CreateAppOptions) {
    const [app] = await this.db.insert(apps).values(appOpts).returning()
    return app
  }

  async delete({ id, userId }: AppOptions) {
    const [app] = await this.db
      .delete(apps)
      .where(and(eq(apps.id, id), eq(apps.userId, userId)))
      .returning()

    return app
  }

  async getByUserId(userId: string) {
    return this.db.query.apps.findMany({
      where: eq(apps.userId, userId),
    })
  }

  async get({ id, userId }: AppOptions) {
    return this.db.query.apps.findFirst({
      where: and(eq(apps.id, id), eq(apps.userId, userId)),
    })
  }

  async getWithTotalFunding({ id, userId }: AppOptions) {
    const columns = getTableColumns(apps)
    const [app] = await this.db
      .select({
        ...columns,
        totalFunding: sql<number>`COALESCE(SUM(payments.amount), 0)`,
      })
      .from(apps)
      .where(and(eq(apps.id, id), eq(apps.userId, userId)))
      .leftJoin(payments, eq(apps.id, payments.appId))
      .groupBy(apps.id)
    return app
  }

  async updateGitHubWorkflowJob(id: string, workflowJob: WorkflowJob) {
    const [app] = await this.db
      .update(apps)
      .set({
        githubWorkflowJobId: String(workflowJob.id),
        githubWorkflowRunId: String(workflowJob.run_id),
      })
      .where(eq(apps.id, id))
      .returning()
    return app
  }

  async updateCompletedGitHubWorkflowJob(id: string, workflowJob: WorkflowJob) {
    const status = workflowJob.conclusion === "success" ? "deployed" : "failed"

    const [app] = await this.db
      .update(apps)
      .set({
        githubWorkflowJobId: String(workflowJob.id),
        githubWorkflowRunId: String(workflowJob.run_id),
        status,
      })
      .where(eq(apps.id, id))
      .returning()
    return app
  }
}
