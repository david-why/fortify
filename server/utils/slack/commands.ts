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

const INFO_TEXT = `\
:hyper-dino-wave: Welcome to <https://fortify.davidwhy.me|Fortify>!
I can help you with many things related to <#C08SKC6P85V>, including:
- :siege: Fetch general information about the siege
- :siege-castle: Manage your armory projects (WIP)
- :siege-coin: Purchase items from the shop (WIP)
Use \`${MAIN_COMMAND} help\` to see what I can do!`

const HELP_TEXT = `\
:siege-castle: All subcommands:
- \`info\`, \`i\`: Show the info text.
- \`help\`, \`h\`: Show this help text.`

const UNKNOWN_TEXT = `Command not found... :( Try \`${MAIN_COMMAND} help\` for a list of subcommands!`
