import { users } from "../schema"
import * as schema from "../schema"
import type { Endpoints } from "@octokit/types"
import { eq } from "drizzle-orm"
import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1"

type GitHubUser = Endpoints["GET /user"]["response"]["data"]

export class Users {
  private db: DrizzleD1Database<typeof schema>
  constructor(d1: D1Database) {
    this.db = drizzle(d1, { schema })
  }

  async create(githubUser: GitHubUser) {
    const [user] = await this.db
      .insert(users)
      .values({
        githubId: githubUser.id,
        username: githubUser.login,
      })
      .returning()
    return user
  }

  async getByGitHubId(githubId: number) {
    return this.db.query.users.findFirst({
      where: eq(users.githubId, githubId),
    })
  }
}
