import type { BlockAction } from '@slack/bolt'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)

  const data = await readBody<{ payload: string }>(event)
  if (!data.payload) {
    throw createError({ status: 400 })
  }

  const payload = JSON.parse(data.payload) as BlockAction
  if (payload.token !== config.slackVerificationToken) {
    throw createError({ status: 400 })
  }

  if (payload.type === 'block_actions') {
    event.waitUntil(handleSlackBlockAction(event, payload))
  }

  return ''
})
