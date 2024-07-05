-- Migration number: 0003 	 2024-07-05T16:57:33.730Z

CREATE TABLE IF NOT EXISTS payments (
  id TEXT NOT NULL PRIMARY KEY,
  amount NUMBER NOT NULL,
  "stripeCheckoutSessionId" TEXT NOT NULL,
  "appId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "createdAt" DATETIME DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
  "updatedAt" DATETIME DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
  FOREIGN KEY ("appId") REFERENCES apps (id),
  FOREIGN KEY ("userId") REFERENCES user (id)
);
