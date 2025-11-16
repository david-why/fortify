import type { H3Event } from 'h3'

export async function globalCommand(
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

  await respondSlashCommand(event, {
    text: `\
:clock3: Total hours tracked this week: ${weekHours}
:clock6: Total submitted hours this week: ${submittedHours}
:clock9: Total hours tracked across all weeks: ${totalHours}
:clock12: Total submitted hours across all weeks: ${totalSubmittedHours}`,
  })
}
