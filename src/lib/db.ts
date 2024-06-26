import { Apps } from "./apps"
import { Users } from "./users"

export class DB {
  apps: Apps
  users: Users

  constructor(d1: D1Database) {
    this.apps = new Apps(d1)
    this.users = new Users(d1)
  }
}
