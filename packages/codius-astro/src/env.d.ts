/// <reference path="../.astro/actions.d.ts" />
/// <reference types="astro/client" />
type D1Database = import("@cloudflare/workers-types").D1Database
type ENV = {
  CLOUDFLARE_ACCOUNT_ID: string
  CLOUDFLARE_API_TOKEN: string
  CF_ANALYTICS_API_TOKEN: string
  CF_DISPATCH_NAMESPACE: string
  GITHUB_APP_NAME: string
  GITHUB_CLIENT_ID: string
  GITHUB_CLIENT_SECRET: string
  GITHUB_ACCESS_TOKEN: string
  GITHUB_WEBHOOK_SECRET: string
  STRIPE_TOPUP_PRICE_ID: string
  STRIPE_SECRET_KEY: string
  DB: D1Database
}

type Runtime = import("@astrojs/cloudflare").Runtime<ENV>

// https://github.com/withastro/astro/issues/7394#issuecomment-1975657601
declare namespace App {
  interface Locals extends Runtime {
    github: import("arctic").GitHub
    lucia: import("lucia").Lucia
    session: import("lucia").Session | null
    user: import("lucia").User | null
    db: import("@/lib/db").DB
  }
}
