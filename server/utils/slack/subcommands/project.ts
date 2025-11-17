import type { H3Event } from 'h3'
import { FetchError } from 'ofetch'

const USAGE = `Usage: \`project <project_id>\``

export async function projectCommand(
  h3Event: H3Event,
  args: string[],
  event: SlackSlashCommandRequest
) {
  if (!args.length) {
    return USAGE
  }
  const projectID = parseInt(args[0]!)
  if (isNaN(projectID) || projectID <= 0) {
    return USAGE
  }
  h3Event.waitUntil(command(h3Event, args, event, projectID))
  return ':discord_loader: Fetching the project...'
}

async function command(
  h3Event: H3Event,
  args: string[],
  event: SlackSlashCommandRequest,
  projectID: number
) {
  const cookie = (await getUser(h3Event, event.user_id))?.siege_session || null

  try {
    const blocks = await generateProjectBlocks(cookie, projectID)

    await respondSlackEvent(event, {
      text: 'Here is the project!',
      blocks,
    })
  } catch (e) {
    if (e instanceof FetchError && e.statusCode === 404) {
      return respondSlackEvent(event, {
        text: `Project with ID \`${projectID}\` is not found.`,
      })
    }
    return respondSlackEvent(event, {
      text: SLACK_ERROR_TEXT,
    })
  }
}
