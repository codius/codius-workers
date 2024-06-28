-- Migration number: 0002 	 2024-06-18T21:08:44.455Z

CREATE TABLE IF NOT EXISTS "apps" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "githubOwner" TEXT NOT NULL,
  "repo" TEXT NOT NULL,
  "branch" TEXT NOT NULL,
  "commitHash" TEXT NOT NULL,
  "directory" TEXT NOT NULL DEFAULT '',
  "status" TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('deployed', 'failed', 'pending')
  ),
  "githubWorkflowJobId" TEXT,
  "githubWorkflowRunId" TEXT,
  "createdAt" DATETIME DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
  "updatedAt" DATETIME DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
  PRIMARY KEY (id),
  UNIQUE (userId, githubOwner, repo, commitHash, directory)
);

CREATE TABLE IF NOT EXISTS "apps_history" (
  "id" TEXT NOT NULL,
  "githubOwner" TEXT NOT NULL,
  "repo" TEXT NOT NULL,
  "branch" TEXT NOT NULL,
  "commitHash" TEXT NOT NULL,
  "directory" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('deployed', 'failed', 'pending')
  ),
  "githubWorkflowJobId" TEXT,
  "githubWorkflowRunId" TEXT,
  "updatedAt" DATETIME,
  "historyTimestamp" DATETIME DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now'))
);

CREATE TRIGGER "after_app_update"
AFTER UPDATE ON "apps"
BEGIN
  INSERT INTO "apps_history"
    (
      "id",
      "githubOwner",
      "repo",
      "branch",
      "commitHash",
      "directory",
      "status",
      "githubWorkflowJobId",
      "githubWorkflowRunId",
      "updatedAt"
    )
  VALUES
    (
      OLD."id",
      OLD."githubOwner",
      OLD."repo",
      OLD."branch",
      OLD."commitHash",
      OLD."directory",
      OLD."status",
      OLD."githubWorkflowJobId",
      OLD."githubWorkflowRunId",
      OLD."updatedAt"
    );
END;
