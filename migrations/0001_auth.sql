-- Migration number: 0001 	 2024-06-18T15:39:07.582Z

CREATE TABLE IF NOT EXISTS "accounts" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "refresh_token" TEXT DEFAULT NULL,
  "access_token" TEXT DEFAULT NULL,
  "expires_at" NUMBER DEFAULT NULL,
  "token_type" TEXT DEFAULT NULL,
  "scope" TEXT DEFAULT NULL,
  "id_token" TEXT DEFAULT NULL,
  "session_state" TEXT DEFAULT NULL,
  "oauth_token_secret" TEXT DEFAULT NULL,
  "oauth_token" TEXT DEFAULT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS "sessions" (
  "id" TEXT NOT NULL,
  "sessionToken" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "expires" DATETIME NOT NULL,
  PRIMARY KEY (sessionToken)
);

CREATE TABLE IF NOT EXISTS "users" (
  "id" TEXT NOT NULL DEFAULT '',
  "name" TEXT DEFAULT NULL,
  "email" TEXT DEFAULT NULL,
  "emailVerified" DATETIME DEFAULT NULL,
  "image" TEXT DEFAULT NULL,
  PRIMARY KEY (id)
);
