import { D1Adapter } from "@lucia-auth/adapter-sqlite"
import { GitHub } from "arctic"
import { Lucia } from "lucia"

export function initializeLucia(D1: D1Database) {
  const adapter = new D1Adapter(D1, {
    user: "user",
    session: "session",
  })
  return new Lucia(adapter, {
    sessionCookie: {
      attributes: {
        // set to `true` when using HTTPS
        secure: import.meta.env.PROD,
      },
    },
    getUserAttributes: (attributes) => {
      return {
        // attributes has the type of DatabaseUserAttributes
        githubId: attributes.github_id,
        username: attributes.username,
      }
    },
  })
}

export const github = new GitHub(
  import.meta.env.GITHUB_CLIENT_ID,
  import.meta.env.GITHUB_CLIENT_SECRET,
)

declare module "lucia" {
  interface Register {
    Lucia: ReturnType<typeof initializeLucia>
    DatabaseUserAttributes: DatabaseUserAttributes
  }
}

// RegisteredDatabaseUserAttributes?
interface DatabaseUserAttributes {
  github_id: number
  username: string
}
