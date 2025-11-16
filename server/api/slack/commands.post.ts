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

  return (await handleSlackCommand(event, body)) || ''
})
