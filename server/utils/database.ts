import type { H3Event } from 'h3'

export async function getUser(event: H3Event, slackID: string) {
  return await event.context.cloudflare.env.DB.prepare(
    'SELECT * FROM users WHERE slack_id = ?'
  )
    .bind(slackID)
    .first<DBUser>()
}

export async function createUser(event: H3Event, slackID: string) {
  return (await event.context.cloudflare.env.DB.prepare(
    'INSERT INTO users(slack_id) VALUES(?)'
  )
    .bind(slackID)
    .first<DBUser>())!
}

export async function upsertUser(event: H3Event, user: DBUser) {
  return await event.context.cloudflare.env.DB.prepare(
    'INSERT INTO users(slack_id, siege_session) VALUES(?, ?) ON CONFLICT(slack_id) DO UPDATE SET siege_session = EXCLUDED.siege_session RETURNING *'
  )
    .bind(user.slack_id, user.siege_session)
    .first<DBUser>()
}
