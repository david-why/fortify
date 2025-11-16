export const SLACK_MAIN_COMMAND = '/siege-fortify'

export const SLACK_INFO_TEXT = `\
:hyper-dino-wave: Welcome to <https://fortify.davidwhy.me|Fortify>!
I can help you with many things related to <#C08SKC6P85V>, including:
- :siege: Fetch general information about the siege
- :siege-castle: Manage your armory projects (WIP)
- :siege-coin: Purchase items from the shop (WIP)
Use \`${SLACK_MAIN_COMMAND} help\` to see what I can do!`

export const SLACK_HELP_TEXT = `\
:siege-castle: All subcommands:
No auth required:
- \`global\`, \`g\`: Retrieves the total time tracked and submitted, this week and across all weeks.
- \`auth\`: Logs in or out with your _siege_session token.
- \`info\`, \`i\`: Show the info text.
- \`help\`, \`h\`: Show this help text.
_siege_session cookie required:
- \`armory\`, \`a\`: Views your projects.`

export const SLACK_UNKNOWN_TEXT = `Command not found... :( Try \`${SLACK_MAIN_COMMAND} help\` for a list of subcommands!`

export const SLACK_NOT_LOGGED_IN_TEXT = `You are not logged in! Please use \`${SLACK_MAIN_COMMAND} auth <_siege_session>\` to log in with your _siege_session cookie.`
