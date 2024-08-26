import { apps } from "./schema"
import * as schema from "./schema"
import { eq, and, isNull, desc } from "drizzle-orm"
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
    return await this.db.query.apps.findFirst({
      where: eq(apps.id, id),
      with: {
        deployer: true,
        workflowRun: true,
      },
    })
  }

  async updateStatus(id: string, status: (typeof apps.$inferSelect)["status"]) {
    const [app] = await this.db
      .update(apps)
      .set({
        status,
      })
      .where(eq(apps.id, id))
      .returning()
    return app
  }
}
