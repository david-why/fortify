import type { H3Event } from 'h3'

export async function respondSlackEvent(
  event: { response_url: string },
  data: Record<string, any>
) {
  return await $fetch(event.response_url, {
    method: 'POST',
    body: data,
  })
}

export async function getSlackCookie(event: H3Event, slackID: string) {
  const user = await getUser(event, slackID)
  return user?.siege_session || undefined
}
