export async function respondSlashCommand(
  event: Pick<SlackSlashCommandRequest, 'response_url'>,
  data: Record<string, any>
) {
  return await $fetch(event.response_url, {
    method: 'POST',
    body: data,
  })
}
