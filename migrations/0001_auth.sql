-- Migration number: 0001 	 2024-06-18T15:39:07.582Z

CREATE TABLE IF NOT EXISTS "accounts" (
  "id" text NOT NULL,
  "userId" text NOT NULL,
  "type" text NOT NULL,
  "provider" text NOT NULL,
  "providerAccountId" text NOT NULL,
  "refresh_token" text DEFAULT NULL,
  "access_token" text DEFAULT NULL,
  "expires_at" number DEFAULT NULL,
  "token_type" text DEFAULT NULL,
  "scope" text DEFAULT NULL,
  "id_token" text DEFAULT NULL,
  "session_state" text DEFAULT NULL,
  "oauth_token_secret" text DEFAULT NULL,
  "oauth_token" text DEFAULT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS "sessions" (
  "id" text NOT NULL,
  "sessionToken" text NOT NULL,
  "userId" text NOT NULL,
  "expires" datetime NOT NULL, 
  PRIMARY KEY (sessionToken)
);

CREATE TABLE IF NOT EXISTS "users" (
  "id" text NOT NULL DEFAULT '',
  "name" text DEFAULT NULL,
  "email" text DEFAULT NULL,
  "emailVerified" datetime DEFAULT NULL,
  "image" text DEFAULT NULL, 
  PRIMARY KEY (id)
);
