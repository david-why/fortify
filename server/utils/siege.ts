// helper functions for common operations with the Siege API

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
    throw new Error('Failed to get page for CSRF')
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

export async function validateCookie(cookie: string) {
  const res = await fetch('https://siege.hackclub.com/castle', {
    headers: {
      Cookie: `_siege_session=${cookie}`,
    },
    redirect: 'manual',
  })
  return res.status === 200
}
