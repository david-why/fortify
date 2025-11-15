export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)

  const body = await readBody<SlackEventsRequest>(event)
  if (typeof body !== 'object' || !body?.token) {
    throw createError({
      status: 400,
    })
  }
  if (body.token !== config.slackVerificationToken) {
    throw createError({
      status: 400,
    })
  }

  if (body.type === 'url_verification') {
    setResponseHeader(event, 'content-type', 'text/plain')
    return body.challenge
  } else {
    event.context.cloudflare.context.waitUntil(handleSlackEvent(event, body))
    setResponseStatus(event, 200)
    return ''
  }
})
