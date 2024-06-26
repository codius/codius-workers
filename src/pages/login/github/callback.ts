import { OAuth2RequestError } from "arctic"
import type { APIContext } from "astro"
import { generateIdFromEntropySize } from "lucia"

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
    const githubUserResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        "User-Agent": import.meta.env.GITHUB_APP_NAME,
      },
    })

    const githubUser: GitHubUser = await githubUserResponse.json()
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

    const userId = generateIdFromEntropySize(10) // 16 characters long

    await context.locals.db.users.create({
      id: userId,
      githubId: githubUser.id,
      username: githubUser.login,
    })

    const session = await context.locals.lucia.createSession(userId, {})
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

interface GitHubUser {
  id: string
  login: string
}
