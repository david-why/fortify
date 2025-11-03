import { purchaseItemSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const { item_name } = await readValidatedBody(
    event,
    purchaseItemSchema.parseAsync
  )

  const { csrfToken } = await getCsrfTokens(
    event,
    'https://siege.hackclub.com/market'
  )

  const res = await fetch(`https://siege.hackclub.com/market/purchase`, {
    method: 'POST',
    headers: {
      Cookie: `_siege_session=${getSessionCookie(event)}`,
      'x-csrf-token': csrfToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ item_name }),
  }).then((r) => r.json())

  if (!res.success) {
    throw createError({
      status: 500,
      message: 'Siege API returned error purchasing item',
      data: res,
    })
  }

  return {
    message: res.message as string,
  }
})
