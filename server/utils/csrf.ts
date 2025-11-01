import { load } from 'cheerio'
import type { H3Event } from 'h3'

export async function getCsrfTokens(event: H3Event, url: string) {
  const pageRes = await fetch(url, {
    headers: {
      Cookie: `_siege_session=${getSessionCookie(event)}`,
    },
    redirect: 'manual',
  })
  if (pageRes.status !== 200) {
    throw new Error('Failed to get project edit page')
  }
  const pageHtml = await pageRes.text()

  const $ = load(pageHtml)
  const csrfToken = $('meta[name="csrf-token"]').attr('content')
  const authenticityToken = $('input[name="authenticity_token"]').attr('value')
  if (!csrfToken) {
    throw new Error('Failed to get CSRF tokens')
  }

  return { csrfToken, authenticityToken }
}
