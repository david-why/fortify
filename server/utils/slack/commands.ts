import type { H3Event } from 'h3'

const rootCommands = {
  '/fortify-armory': armoryCommand,
  '/fortify-global': globalCommand,
  '/fortify-auth': authCommand,
  '/fortify-help': helpCommand,
  '/fortify-info': infoCommand,
}

export async function handleSlackCommand(
  h3Event: H3Event,
  event: SlackSlashCommandRequest
) {
  if (event.command === SLACK_MAIN_COMMAND) {
    return await handleMainCommand(h3Event, event)
  } else if (event.command in rootCommands) {
    return await rootCommands[event.command as keyof typeof rootCommands](
      h3Event,
      event.text.split(' '),
      event
    )
  }
  return 'Command not found, please try again later!'
}

type CommandCallback = (
  h3Event: H3Event,
  args: string[],
  event: SlackSlashCommandRequest
) => Promise<any>

const commands: Record<string, CommandCallback> = {}

const syncCommands: Record<string, CommandCallback> = {
  auth: authCommand,
  global: globalCommand,
  g: globalCommand,
  armory: armoryCommand,
  a: armoryCommand,
  help: helpCommand,
  h: helpCommand,
  info: infoCommand,
  i: infoCommand,
}

async function handleMainCommand(
  h3Event: H3Event,
  event: SlackSlashCommandRequest
) {
  const { text } = event
  const [cmd, ...args] = text.split(' ')

  if (!cmd) {
    return SLACK_INFO_TEXT
  } else if (cmd in syncCommands) {
    return await syncCommands[cmd as keyof typeof syncCommands](
      h3Event,
      args,
      event
    )
  } else if (cmd in commands) {
    h3Event.waitUntil(
      commands[cmd as keyof typeof commands](h3Event, args, event)
    )
    return ''
  } else {
    return SLACK_UNKNOWN_TEXT
  }
}

async function helpCommand() {
  return SLACK_HELP_TEXT
}

async function infoCommand() {
  return SLACK_INFO_TEXT
}
