import { nanoid } from "./utils"
import type { Endpoints } from "@octokit/types"
import { D1QB } from "workers-qb"

type GitHubUser = Endpoints["GET /user"]["response"]["data"]

type User = {
  id: string
  github_id: number
  username: string
}

export class Users {
  private qb: D1QB
  constructor(d1: D1Database) {
    this.qb = new D1QB(d1)
  }

  async create(githubUser: GitHubUser) {
    const { results: user } = await this.qb
      .insert<User>({
        tableName: "user",
        data: {
          id: nanoid(),
          github_id: githubUser.id,
          username: githubUser.login,
        },
        returning: "*",
      })
      .execute()
    return user
  }

  async getByGitHubId(githubId: number) {
    const { results } = await this.qb
      .fetchOne<User>({
        tableName: "user",
        where: {
          conditions: "github_id = ?1",
          params: [githubId],
        },
      })
      .execute()
    return results
  }
}
