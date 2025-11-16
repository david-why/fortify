import type { H3Event } from 'h3'

export async function armoryCommand(
  h3Event: H3Event,
  args: string[],
  event: SlackSlashCommandRequest
) {
  const user = await getUser(h3Event, event.user_id)
  if (!user?.siege_session) {
    return SLACK_NOT_LOGGED_IN_TEXT
  }
  h3Event.context.cloudflare.context.waitUntil(
    armoryCommandInner(h3Event, args, event, user)
  )
  return ':discord_loader: Fetching your projects from the armory...'
}

async function armoryCommandInner(
  h3Event: H3Event,
  args: string[],
  event: SlackSlashCommandRequest,
  user: DBUser
) {
  const blocks = await generateArmoryBlocks(user.siege_session!)

  await respondSlackEvent(event, {
    text: 'Here is a list of your Siege projects!',
    blocks,
  })
}
