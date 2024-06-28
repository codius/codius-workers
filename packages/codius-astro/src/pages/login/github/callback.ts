import { Octokit } from "@octokit/rest"
import { OAuth2RequestError } from "arctic"
import type { APIContext } from "astro"

export async function GET(context: APIContext): Promise<Response> {
  const code = context.url.searchParams.get("code")
  const state = context.url.searchParams.get("state")
  const storedState = context.cookies.get("github_oauth_state")?.value ?? null
  if (!code || !state || !storedState || state !== storedState) {
    return new Response(null, {
      status: 400,
    })
  }

  try {
    const tokens = await context.locals.github.validateAuthorizationCode(code)
    const octokit = new Octokit({
      auth: tokens.accessToken,
    })
    const { data: githubUser } = await octokit.rest.users.getAuthenticated()
    console.log({ githubUser })

    const existingUser = await context.locals.db.users.getByGitHubId(
      githubUser.id,
    )

    if (existingUser) {
      const session = await context.locals.lucia.createSession(
        existingUser.id,
        {},
      )
      const sessionCookie = context.locals.lucia.createSessionCookie(session.id)
      context.cookies.set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      )
      return context.redirect("/")
    }

    const user = await context.locals.db.users.create(githubUser)

    const session = await context.locals.lucia.createSession(user.id, {})
    const sessionCookie = context.locals.lucia.createSessionCookie(session.id)
    context.cookies.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    )
    return context.redirect("/")
  } catch (e) {
    console.error(e.message)

    // the specific error message depends on the provider
    if (e instanceof OAuth2RequestError) {
      // invalid code
      return new Response(null, {
        status: 400,
      })
    }
    return new Response(null, {
      status: 500,
    })
  }
}
