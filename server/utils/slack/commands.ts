import type { H3Event } from 'h3'

const MAIN_COMMAND = '/siege-fortify'

export async function handleSlackCommand(
  h3Event: H3Event,
  event: SlackSlashCommandRequest
) {
  if (event.command === MAIN_COMMAND) {
    await handleMainCommand(h3Event, event)
  }
}

async function handleMainCommand(
  h3Event: H3Event,
  event: SlackSlashCommandRequest
) {
  const { text } = event
  const [cmd, ...args] = text.split(' ')

  if (!cmd || cmd === 'info' || cmd === 'i') {
    await respond(event.response_url, { text: INFO_TEXT })
  } else if (cmd === 'help' || cmd === 'h') {
    await respond(event.response_url, { text: HELP_TEXT })
  } else if (cmd === 'global' || cmd === 'g') {
    await globalCommand(h3Event, args, event)
  } else {
    await respond(event.response_url, { text: UNKNOWN_TEXT })
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
  await respond(event.response_url, {
    text: ':discord_loader: Fetching all projects to calculate hours...',
  })

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
- \`global\`, \`g\`: Retrieves the total time tracked and submitted, this week and across all weeks.
- \`info\`, \`i\`: Show the info text.
- \`help\`, \`h\`: Show this help text.`

const UNKNOWN_TEXT = `Command not found... :( Try \`${MAIN_COMMAND} help\` for a list of subcommands!`
