import type { H3Event } from 'h3'
import type { KnownBlock } from '@slack/types'

const MAIN_COMMAND = '/siege-fortify'

export async function handleSlackCommand(
  h3Event: H3Event,
  event: SlackSlashCommandRequest
) {
  if (event.command === MAIN_COMMAND) {
    return await handleMainCommand(h3Event, event)
  }
  return 'Command not found, please try again later!'
}

const commands = {
  auth: authCommand,
}

const syncCommands = {
  global: globalCommand,
  g: globalCommand,
  armory: armoryCommand,
  a: armoryCommand,
}

async function handleMainCommand(
  h3Event: H3Event,
  event: SlackSlashCommandRequest
) {
  const { text } = event
  const [cmd, ...args] = text.split(' ')

  if (!cmd || cmd === 'info' || cmd === 'i') {
    return INFO_TEXT
  } else if (cmd === 'help' || cmd === 'h') {
    return HELP_TEXT
  } else if (cmd in syncCommands) {
    return await syncCommands[cmd as keyof typeof syncCommands](
      h3Event,
      args,
      event
    )
  } else if (cmd in commands) {
    h3Event.context.cloudflare.context.waitUntil(
      commands[cmd as keyof typeof commands](h3Event, args, event)
    )
    return ''
  } else {
    return UNKNOWN_TEXT
  }
}

async function respond(url: string, data: Record<string, any>) {
  return await $fetch(url, {
    method: 'POST',
    body: data,
  })
}

// subcommands

async function globalCommand(
  h3Event: H3Event,
  args: string[],
  event: SlackSlashCommandRequest
) {
  h3Event.context.cloudflare.context.waitUntil(
    globalCommandInner(h3Event, args, event)
  )
  return ':discord_loader: Fetching all projects to calculate hours...'
}
async function globalCommandInner(
  h3Event: H3Event,
  args: string[],
  event: SlackSlashCommandRequest
) {
  const { projects } = await $fetch<{ projects: APIProject[] }>(
    'https://siege.hackclub.com/api/public-beta/projects'
  )
  const week = getCurrentWeek()

  const sumHours = (projects: APIProject[]) =>
    Math.round(projects.map((p) => p.hours).reduce((a, b) => a + b, 0) * 10) /
    10

  const totalHours = sumHours(projects)
  const totalSubmittedHours = sumHours(
    projects.filter((p) => p.status !== 'building')
  )

  const weekProjects = projects.filter(
    (p) => p.week_badge_text === `Week ${week}`
  )
  const weekHours = sumHours(weekProjects)
  const submittedHours = sumHours(
    weekProjects.filter((p) => p.status !== 'building')
  )

  await respond(event.response_url, {
    text: `\
:clock3: Total hours tracked this week: ${weekHours}
:clock6: Total submitted hours this week: ${submittedHours}
:clock9: Total hours tracked across all weeks: ${totalHours}
:clock12: Total submitted hours across all weeks: ${totalSubmittedHours}`,
  })
}

async function authCommand(
  h3Event: H3Event,
  args: string[],
  event: SlackSlashCommandRequest
) {
  const user =
    (await getUser(h3Event, event.user_id)) ||
    (await createUser(h3Event, event.user_id))

  if (args[0] === 'logout') {
    if (!user.siege_session) {
      await respond(event.response_url, {
        text: `What do you mean "logout"? You've never logged in!!`,
      })
      return
    }
    user.siege_session = null
    await upsertUser(h3Event, user)
    await respond(event.response_url, {
      text: `You have been logged out, and your cookie is forever deleted from the server.`,
    })
    return
  }

  if (args[0]) {
    const cookie = args[0]
    user.siege_session = cookie
    await upsertUser(h3Event, user)
    await respond(event.response_url, {
      text: `You are now logged in! Your cookie has been stored on the server. If you want to log out and permanently delete the cookie, run \`${MAIN_COMMAND} auth logout\`.`,
    })
    return
  }

  if (!user?.siege_session) {
    await respond(event.response_url, {
      text: `You are not logged in. Please run \`${MAIN_COMMAND} auth <_siege_session>\` with your _siege_session cookie value to login.`,
    })
  } else {
    await respond(event.response_url, {
      text: `You are logged in. If you want to log out, please run \`${MAIN_COMMAND} auth logout\`.`,
    })
  }
}

async function armoryCommand(
  h3Event: H3Event,
  args: string[],
  event: SlackSlashCommandRequest
) {
  const user = await getUser(h3Event, event.user_id)
  if (!user?.siege_session) {
    return NOT_LOGGED_IN_TEXT
  }
  h3Event.context.cloudflare.context.waitUntil(
    armoryCommandInner(h3Event, args, event, user)
  )
  return ':discord_loader: Fetching your projects from the armory, please wait...'
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

  await respond(event.response_url, {
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

// constants

const INFO_TEXT = `\
:hyper-dino-wave: Welcome to <https://fortify.davidwhy.me|Fortify>!
I can help you with many things related to <#C08SKC6P85V>, including:
- :siege: Fetch general information about the siege
- :siege-castle: Manage your armory projects (WIP)
- :siege-coin: Purchase items from the shop (WIP)
Use \`${MAIN_COMMAND} help\` to see what I can do!`

const HELP_TEXT = `\
:siege-castle: All subcommands:
No auth required:
- \`global\`, \`g\`: Retrieves the total time tracked and submitted, this week and across all weeks.
- \`auth\`: Logs in or out with your _siege_session token.
- \`info\`, \`i\`: Show the info text.
- \`help\`, \`h\`: Show this help text.
_siege_session cookie required:
- \`armory\`, \`a\`: Views your projects.`

const UNKNOWN_TEXT = `Command not found... :( Try \`${MAIN_COMMAND} help\` for a list of subcommands!`

const NOT_LOGGED_IN_TEXT = `You are not logged in! Please use \`${MAIN_COMMAND} auth <_siege_session>\` to log in with your _siege_session cookie.`
