import { Users } from "./users"

export class DB {
  users: Users

  constructor(d1: D1Database) {
    this.users = new Users(d1)
  }
}
