import { nanoid } from "@/lib/utils"
import { sql } from "drizzle-orm"
import { text, integer, sqliteTable, unique } from "drizzle-orm/sqlite-core"

export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  githubId: integer("github_id").notNull().unique(),
  username: text("username").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
})

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at").notNull(),
  userId: text("user_id").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
})

export const apps = sqliteTable(
  "apps",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    userId: text("user_id").references(() => users.id),
    githubOwner: text("github_owner").notNull(),
    repo: text("repo").notNull(),
    branch: text("branch").notNull(),
    commitHash: text("commit_hash").notNull(),
    directory: text("directory").notNull().default(""),
    status: text("status", { enum: ["deployed", "failed", "pending"] })
      .notNull()
      .default("pending"),
    githubWorkflowJobId: text("github_workflow_job_id"),
    githubWorkflowRunId: text("github_workflow_run_id"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`)
      // .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
      // .$onUpdate(() => new Date()).$type<Date>(),
      .$onUpdate(() => new Date()),
  },
  (t) => ({
    unq: unique().on(
      t.id,
      t.userId,
      t.githubOwner,
      t.repo,
      t.commitHash,
      t.directory,
    ),
  }),
)

export const payments = sqliteTable("payments", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  amount: integer("amount").notNull(),
  stripeCheckoutSessionId: text("stripe_checkout_session_id").notNull(),
  appId: text("app_id").references(() => apps.id),
  userId: text("user_id").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
})
