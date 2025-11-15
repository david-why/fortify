import { load } from 'cheerio'

export default defineEventHandler(async (event) => {
  const res = await fetch('https://siege.hackclub.com/keep', {
    headers: {
      Cookie: `_siege_session=${getSessionCookie(event)}`,
    },
    redirect: 'manual',
  })
  if (res.status !== 200) {
    throw createError({
      status: 401,
      message: 'Invalid session cookie',
    })
  }
  const htmlText = await res.text()

  const $ = load(htmlText)
  const leaderboard = $('.home-leader-item')
    .map(function () {
      return {
        user_name: $(this).find('.home-user').text().trim(),
        time_text: $(this).find('.home-amount').text().trim(),
      }
    })
    .toArray()

  return leaderboard
})
