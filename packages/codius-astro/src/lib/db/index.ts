import { Apps } from "./apps"
import { Payments } from "./payments"
import { Users } from "./users"
import { WorkflowRuns } from "./workflowRuns"

export class DB {
  apps: Apps
  payments: Payments
  users: Users
  workflowRuns: WorkflowRuns

  constructor(d1: D1Database) {
    this.apps = new Apps(d1)
    this.payments = new Payments(d1)
    this.users = new Users(d1)
    this.workflowRuns = new WorkflowRuns(d1)
  }
}
