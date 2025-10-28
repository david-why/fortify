import type { H3Event } from 'h3'

export function getSessionCookie(event: H3Event) {
  const cookie = getCookie(event, '_siege_session')
  if (!cookie) {
    throw createError({
      status: 401,
      data: { message: 'You are not signed in' },
    })
  }
  return cookie
}
