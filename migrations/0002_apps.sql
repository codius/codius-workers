-- Migration number: 0002 	 2024-06-18T21:08:44.455Z

CREATE TABLE IF NOT EXISTS "apps" (
  "id" text NOT NULL,
  "userId" text NOT NULL,
  "githubOwner" text NOT NULL,
  "repo" text NOT NULL,
  "branch" text NOT NULL,
  "commitHash" text NOT NULL,
  "directory" text,
  "status" TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('deployed', 'failed', 'pending')),
  "createdAt" DATETIME DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
  "updatedAt" DATETIME DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS "apps_history" (
  "id" text NOT NULL,
  "githubOwner" text NOT NULL,
  "repo" text NOT NULL,
  "branch" text NOT NULL,
  "commitHash" text NOT NULL,
  "directory" text,
  "status" TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('deployed', 'failed', 'pending')),
  "updatedAt" DATETIME,
  "historyTimestamp" DATETIME DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now'))
);

CREATE TRIGGER "after_app_update"
AFTER UPDATE ON "apps"
BEGIN
  INSERT INTO "apps_history" ("id", "githubOwner", "repo", "branch", "commitHash", "directory", "status", "updatedAt")
  VALUES (OLD."id", OLD."githubOwner", OLD."repo", OLD."branch", OLD."commitHash", OLD."directory", OLD."status", OLD."updatedAt");
END;
