import { createId } from "@paralleldrive/cuid2"
import { relations, sql } from "drizzle-orm"
import {
  text,
  integer,
  sqliteTable,
  index,
  unique,
} from "drizzle-orm/sqlite-core"

export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
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
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
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
      .$defaultFn(() => createId()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    githubOwner: text("github_owner").notNull(),
    repo: text("repo").notNull(),
    gitRef: text("git_ref").notNull(),
    commitHash: text("commit_hash").notNull(),
    directory: text("directory").notNull().default(""),
    status: text("status", { enum: ["deployed", "failed", "pending"] })
      .notNull()
      .default("pending"),
    githubWorkflowRunId: integer("github_workflow_run_id"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`)
      .$onUpdate(() => new Date()),
    deletedAt: integer("deleted_at", { mode: "timestamp" }),
  },
  (t) => ({
    unq: unique().on(
      t.userId,
      t.githubOwner,
      t.repo,
      t.commitHash,
      t.directory,
      t.deletedAt,
    ),
    userIdIdx: index("idx_apps_user_id").on(t.userId),
    githubWorkflowRunIdIdx: index("idx_apps_github_workflow_run_id").on(
      t.githubWorkflowRunId,
    ),
  }),
)

export const appsRelations = relations(apps, ({ one }) => ({
  deployer: one(users, {
    fields: [apps.userId],
    references: [users.id],
  }),
}))

export const payments = sqliteTable("payments", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  amount: integer("amount").notNull(),
  stripeCheckoutSessionId: text("stripe_checkout_session_id").notNull(),
  appId: text("app_id")
    .notNull()
    .references(() => apps.id),
  userId: text("user_id").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
})
