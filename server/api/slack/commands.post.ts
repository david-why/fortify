export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)

  const body = await readBody<SlackSlashCommandRequest>(event)
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

  event.context.cloudflare.context.waitUntil(handleSlackCommand(event, body))

  setResponseStatus(event, 200)
  return ''
})
