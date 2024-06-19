-- Migration number: 0002 	 2024-06-18T21:08:44.455Z

CREATE TABLE IF NOT EXISTS "apps" (
  "id" text NOT NULL,
  "userId" text NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('deployed', 'failed', 'pending')),
  "createdAt" DATETIME DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
  "updatedAt" DATETIME DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS "deployments" (
  "id" text NOT NULL,
  "appId" text NOT NULL,
  "githubOwner" text NOT NULL,
  "repo" text NOT NULL,
  "branch" text NOT NULL,
  "commit" text NOT NULL,
  "directory" text,
  "createdAt" DATETIME DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
  "updatedAt" DATETIME DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
  PRIMARY KEY ("id"),
  FOREIGN KEY ("appId") REFERENCES "apps" ("id") ON DELETE CASCADE
);
