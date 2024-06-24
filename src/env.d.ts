/// <reference path="../.astro/actions.d.ts" />
/// <reference types="astro/client" />
type D1Database = import("@cloudflare/workers-types").D1Database
type ENV = {
  GITHUB_APP_NAME: string
  GITHUB_CLIENT_ID: string
  GITHUB_CLIENT_SECRET: string
  GITHUB_ACCESS_TOKEN: string
  DB: D1Database
}

type Runtime = import("@astrojs/cloudflare").Runtime<ENV>

declare namespace App {
  interface Locals extends Runtime {
    github: import("arctic").GitHub
    lucia: import("lucia").Lucia
    session: import("lucia").Session | null
    user: import("lucia").User | null
  }
}
