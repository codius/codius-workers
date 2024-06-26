import { initializeLucia, initializeGitHub } from "@/lib/auth"
import { DB } from "@/lib/db"
import { defineMiddleware } from "astro:middleware"
import { verifyRequestOrigin } from "lucia"

export const onRequest = defineMiddleware(async (context, next) => {
  context.locals.db = new DB(context.locals.runtime.env.DB)
  const lucia = initializeLucia(context.locals.runtime.env.DB)
  context.locals.lucia = lucia
  const github = initializeGitHub(
    context.locals.runtime.env.GITHUB_CLIENT_ID,
    context.locals.runtime.env.GITHUB_CLIENT_SECRET,
  )
  context.locals.github = github
  const sessionId = context.cookies.get(lucia.sessionCookieName)?.value ?? null
  if (!sessionId) {
    context.locals.user = null
    context.locals.session = null
    return next()
  }

  const { session, user } = await lucia.validateSession(sessionId)
  if (session && session.fresh) {
    const sessionCookie = lucia.createSessionCookie(session.id)
    context.cookies.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    )
  }
  if (!session) {
    const sessionCookie = lucia.createBlankSessionCookie()
    context.cookies.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    )
  }
  context.locals.session = session
  context.locals.user = user
  return next()
})
