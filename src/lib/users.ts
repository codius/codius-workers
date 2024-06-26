type User = {
  id: string
  githubId: number
  username: string
}

export class Users {
  constructor(private db: D1Database) {}

  async create({ id, githubId, username }: User) {
    return this.db
      .prepare("INSERT INTO user (id, github_id, username) VALUES (?1, ?2, ?3)")
      .bind(id, githubId, username)
      .run()
  }

  async getByGitHubId(githubId: number) {
    return this.db
      .prepare(
        "SELECT id, github_id AS githubId, username FROM user WHERE github_id = ?1",
      )
      .bind(githubId)
      .first<User>()
  }
}
