import { apps } from "./schema"
import * as schema from "./schema"
import { eq, and, isNull, desc } from "drizzle-orm"
import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1"

export type App = typeof apps.$inferSelect

type CreateAppOptions = typeof apps.$inferInsert

type AppOptions = {
  id: string
  userId: string
}

type UpdateStatusOptions = {
  githubWorkflowRunId: number
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
      orderBy: [desc(apps.createdAt)],
    })
  }

  async getById(id: string) {
    return this.db.query.apps.findFirst({
      where: eq(apps.id, id),
      with: {
        deployer: true,
      },
    })
  }

  async updateGitHubWorkflowRunId(id: string, githubWorkflowRunId: number) {
    const [app] = await this.db
      .update(apps)
      .set({
        githubWorkflowRunId,
      })
      .where(eq(apps.id, id))
      .returning()
    return app
  }

  async updateStatus({ githubWorkflowRunId, status }: UpdateStatusOptions) {
    const [app] = await this.db
      .update(apps)
      .set({
        status,
      })
      .where(eq(apps.githubWorkflowRunId, githubWorkflowRunId))
      .returning()
    return app
  }
}
