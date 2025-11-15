import type { H3Event } from 'h3'

export async function handleSlackEvent(
  h3Event: H3Event,
  event: SlackEventCallbackRequest
) {
  console.log(event)
}
