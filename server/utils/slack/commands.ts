import type { H3Event } from 'h3'

const rootCommands = {
  '/fortify-armory': armoryCommand,
  '/fortify-global': globalCommand,
  '/fortify-auth': authCommand,
  '/fortify-help': helpCommand,
  '/fortify-info': infoCommand,
  '/fortify-project': projectCommand,

  '/dev-fortify-armory': armoryCommand,
  '/dev-fortify-global': globalCommand,
  '/dev-fortify-auth': authCommand,
  '/dev-fortify-help': helpCommand,
  '/dev-fortify-info': infoCommand,
  '/dev-fortify-project': projectCommand,

  [SLACK_MAIN_COMMAND]: handleMainCommand,
  '/siege-dev-fortify': handleMainCommand,
}

export async function handleSlackCommand(
  h3Event: H3Event,
  event: SlackSlashCommandRequest
) {
  if (event.command in rootCommands) {
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

const commands: Record<string, CommandCallback> = {
  auth: authCommand,
  global: globalCommand,
  g: globalCommand,
  armory: armoryCommand,
  a: armoryCommand,
  help: helpCommand,
  h: helpCommand,
  info: infoCommand,
  i: infoCommand,
  project: projectCommand,
  p: projectCommand,
}

async function handleMainCommand(
  h3Event: H3Event,
  allArgs: string[],
  event: SlackSlashCommandRequest
) {
  const [cmd, ...args] = allArgs

  if (!cmd) {
    return SLACK_INFO_TEXT
  } else if (cmd in commands) {
    return await commands[cmd as keyof typeof commands](h3Event, args, event)
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
