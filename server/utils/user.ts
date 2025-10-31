import type { H3Event } from 'h3'

export function getSessionCookie(
  event: H3Event,
  required: false
): string | undefined
export function getSessionCookie(event: H3Event, required?: true): string

export function getSessionCookie(event: H3Event, required: boolean = true) {
  const cookie = getCookie(event, '_siege_session')
  if (!cookie && required) {
    throw createError({
      status: 401,
      data: { message: 'You are not signed in' },
    })
  }
  return cookie
}
