import type { H3Event } from 'h3'

/** Require a logged-in user; throws 401 otherwise. */
export async function requireAuth(event: H3Event) {
  const { user } = await requireUserSession(event)
  return user!
}
