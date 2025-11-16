import type { H3Event } from 'h3'
import type { KnownBlock } from '@slack/types'

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
  const projects = (await $fetch(`/api/users/me/projects`, {
    headers: {
      Cookie: `_siege_session=${user.siege_session}`,
    },
  }))!

  const projectBlocks: KnownBlock[] = projects.projects
    .toSorted((a, b) => a.week - b.week)
    .map((p) => ({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${p.title}* - Week ${p.week}, ${formatProjectStatusSlack(p)}`,
      },
      accessory: {
        type: 'button',
        text: {
          type: 'plain_text',
          text: 'View',
          emoji: true,
        },
        value: String(p.id),
        action_id: 'armory-project-details',
      },
    }))
  if (!projectBlocks.length) {
    projectBlocks.push({
      type: 'section',
      text: {
        type: 'plain_text',
        text: 'No projects yet. Create one with the button below!',
      },
    })
  }

  const createProjectBlocks: KnownBlock[] = projects.canCreate
    ? [
        {
          type: 'divider',
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: ':heavy_plus_sign: Create project',
                emoji: true,
              },
              action_id: 'create-project',
            },
          ],
        },
      ]
    : []

  await respondSlashCommand(event, {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: ':siege-castle: Your projects',
          emoji: true,
        },
      },
      {
        type: 'divider',
      },
      ...projectBlocks,
      ...createProjectBlocks,
    ] satisfies KnownBlock[],
  })
}
