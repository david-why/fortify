import { setMainDeviceSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const { device_id } = await readValidatedBody(
    event,
    setMainDeviceSchema.parseAsync
  )

  const { csrfToken } = await getCsrfTokens(
    event,
    'https://siege.hackclub.com/market'
  )

  const res = await fetch('https://siege.hackclub.com/market/set_main_device', {
    method: 'POST',
    headers: {
      Cookie: `_siege_session=${getSessionCookie(event)}`,
      'x-csrf-token': csrfToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ device_id, refund: true }),
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
    refunded: res.refunded as boolean,
  }
})
