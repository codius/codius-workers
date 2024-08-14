import { initializeLucia, initializeGitHub } from "@/lib/auth"
import { DB } from "@/lib/db"
import { clerkMiddleware } from "@clerk/astro/server"
import type { MiddlewareHandler } from "astro"
import { sequence } from "astro:middleware"

const clerkAuth = clerkMiddleware()

const setupContext: MiddlewareHandler = (context, next) => {
  context.locals.db = new DB(context.locals.runtime.env.DB)
  const lucia = initializeLucia(context.locals.runtime.env.DB)
  context.locals.lucia = lucia
  const github = initializeGitHub(
    context.locals.runtime.env.GITHUB_CLIENT_ID,
    context.locals.runtime.env.GITHUB_CLIENT_SECRET,
  )
  context.locals.github = github
  return next()
}

export const onRequest = sequence(clerkAuth, setupContext)
