import { apps, payments } from "../schema"
import * as schema from "../schema"
import { eq, and, isNull, sql, getTableColumns } from "drizzle-orm"
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

type GitHubWorkflow = {
  githubWorkflowJobId: number
  githubWorkflowRunId: number
}

type CompletedGitHubWorkflow = GitHubWorkflow & {
  status: (typeof apps.$inferSelect)["status"]
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
      .update(apps)
      .set({
        deletedAt: new Date(),
      })
      .where(
        and(eq(apps.id, id), eq(apps.userId, userId), isNull(apps.deletedAt)),
      )
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

  async updateGitHubWorkflowJob(
    id: string,
    { githubWorkflowJobId, githubWorkflowRunId }: GitHubWorkflow,
  ) {
    const [app] = await this.db
      .update(apps)
      .set({
        githubWorkflowJobId,
        githubWorkflowRunId,
      })
      .where(eq(apps.id, id))
      .returning()
    return app
  }

  async updateCompletedGitHubWorkflowJob(
    id: string,
    {
      githubWorkflowJobId,
      githubWorkflowRunId,
      status,
    }: CompletedGitHubWorkflow,
  ) {
    const [app] = await this.db
      .update(apps)
      .set({
        githubWorkflowJobId,
        githubWorkflowRunId,
        status,
      })
      .where(eq(apps.id, id))
      .returning()
    return app
  }
}
