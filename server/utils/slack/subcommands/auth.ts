import type { H3Event } from 'h3'

export async function authCommand(
  h3Event: H3Event,
  args: string[],
  event: SlackSlashCommandRequest
) {
  const user =
    (await getUser(h3Event, event.user_id)) ||
    (await createUser(h3Event, event.user_id))

  if (args[0] === 'logout') {
    if (!user.siege_session) {
      return `What do you mean "logout"? You've never logged in!!`
    }
    user.siege_session = null
    await upsertUser(h3Event, user)
    return `You have been logged out, and your cookie is forever deleted from the server.`
  }

  if (args[0]) {
    if (user.siege_session) {
      return `You've already logged in! If you wish to change cookies for whatever reason, please log out first with \`${SLACK_MAIN_COMMAND} auth logout\`.`
    }
    const cookie = args[0]
    h3Event.context.cloudflare.context.waitUntil(
      authCommandLogin(h3Event, event, user, cookie)
    )
    return ':discord_loader: Validating your cookie with Siege...'
  }

  if (!user?.siege_session) {
    return SLACK_NOT_LOGGED_IN_TEXT
  } else {
    return `You are logged in. If you want to log out, please run \`${SLACK_MAIN_COMMAND} auth logout\`.`
  }
}

async function authCommandLogin(
  h3Event: H3Event,
  event: SlackSlashCommandRequest,
  user: DBUser,
  cookie: string
) {
  const isValid = await validateCookie(cookie)
  if (!isValid) {
    await respondSlashCommand(event, {
      text: `The cookie you provided (\`${cookie}\`) is invalid. Please make sure it is correct, and then try again.`,
    })
    return
  }
  user.siege_session = cookie
  await upsertUser(h3Event, user)
  await respondSlashCommand(event, {
    text: `You are now logged in! Your cookie has been stored on the server. If you want to log out and permanently delete the cookie, run \`${SLACK_MAIN_COMMAND} auth logout\`.`,
  })
}
