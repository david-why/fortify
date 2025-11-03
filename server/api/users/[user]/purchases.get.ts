export default defineEventHandler(async (event) => {
  const userID = getRouterParam(event, 'user')!
  if (userID !== 'me') {
    throw createError({
      status: 400,
      message: 'You can only retrieve purchases for yourself',
    })
  }

  const { csrfToken } = await getCsrfTokens(
    event,
    'https://siege.hackclub.com/market'
  )

  const data: SiegeUserPurchases = await fetch(
    'https://siege.hackclub.com/market/user_purchases',
    {
      headers: {
        Cookie: `_siege_session=${getSessionCookie(event)}`,
        'x-csrf-token': csrfToken,
      },
    }
  ).then((r) => r.json())

  return data
})
